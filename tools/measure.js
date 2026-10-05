// 用无头 Chrome + CDP 实测三个渲染页面的性能指标并截图
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const PORT = 9333;
const OUT = path.resolve(__dirname, "..", "lab1-shots");
const BASE = process.env.BASE_URL || "http://localhost:3000";

const PAGES = [
  { name: "home", url: `${BASE}/` },
  { name: "csr", url: `${BASE}/csr` },
  { name: "ssr", url: `${BASE}/ssr` },
  { name: "ssg", url: `${BASE}/ssg` },
  { name: "viewsource-csr", url: `view-source:${BASE}/csr` },
  { name: "viewsource-ssr", url: `view-source:${BASE}/ssr` },
  { name: "evidence-csr", url: `file:///${path.join(OUT, "evidence-csr.html").replace(/\\/g, "/")}` },
  { name: "evidence-ssr", url: `file:///${path.join(OUT, "evidence-ssr.html").replace(/\\/g, "/")}` },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jsonApi(p, method = "GET") {
  const res = await fetch(`http://127.0.0.1:${PORT}${p}`, { method });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`CDP 返回非 JSON: ${text.slice(0, 120)}`);
  }
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        const waiters = this.events.get(msg.method) || [];
        waiters.forEach((w) => w(msg.params));
        this.events.set(msg.method, []);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method, timeout = 15000) {
    return new Promise((resolve) => {
      const waiters = this.events.get(method) || [];
      waiters.push(resolve);
      this.events.set(method, waiters);
      setTimeout(() => resolve(null), timeout);
    });
  }
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  return new Cdp(ws);
}

const OBSERVER = `
window.__lcp = 0; window.__cls = 0;
try {
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = Math.max(window.__lcp, e.startTime); })
    .observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
} catch (e) {}
`;

const METRICS = `(() => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const paints = performance.getEntriesByType('paint');
  const fcp = paints.find(p => p.name === 'first-contentful-paint');
  return JSON.stringify({
    fcp: fcp ? Math.round(fcp.startTime) : null,
    lcp: window.__lcp ? Math.round(window.__lcp) : null,
    cls: Number((window.__cls || 0).toFixed(4)),
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
    loadEnd: Math.round(nav.loadEventEnd || 0),
    htmlTransferBytes: nav.transferSize || 0,
    htmlDecodedBytes: nav.decodedBodySize || 0,
    textLength: document.body ? document.body.innerText.length : 0,
  });
})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const userDataDir = path.join(os.tmpdir(), `cdp-profile-${Date.now()}`);

  const chrome = spawn(
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=1280,860",
      "--proxy-server=direct://",
      "--proxy-bypass-list=*",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  // 等 CDP 就绪
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      await jsonApi("/json/version");
      ready = true;
      break;
    } catch {
      await sleep(500);
    }
  }
  if (!ready) {
    console.error("Chrome CDP 未就绪");
    chrome.kill();
    process.exit(1);
  }

  const results = {};
  for (const p of PAGES) {
    try {
      const target = await jsonApi(`/json/new?${encodeURIComponent(p.url)}`, "PUT");
      const cdp = await connect(target.webSocketDebuggerUrl);
      await cdp.send("Page.enable");
      await cdp.send("Runtime.enable");
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVER });
      await cdp.send("Page.navigate", { url: p.url });
      await cdp.once("Page.loadEventFired", 20000);
      await sleep(3500); // 让 LCP 稳定 + CSR 完成数据请求

      const ev = await cdp.send("Runtime.evaluate", { expression: METRICS, returnByValue: true });
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: /^(viewsource|evidence)/.test(p.name),
      });
      fs.writeFileSync(path.join(OUT, `${p.name}.png`), Buffer.from(shot.data, "base64"));

      const metrics = JSON.parse(ev.result.value);
      results[p.name] = metrics;
      console.log(
        `${p.name.padEnd(16)} FCP=${metrics.fcp}ms LCP=${metrics.lcp}ms CLS=${metrics.cls} HTML(压缩)=${metrics.htmlTransferBytes}B 文本长度=${metrics.textLength}`
      );
      cdp.ws.close();
    } catch (e) {
      console.log(`${p.name.padEnd(16)} 采集失败: ${e.message}`);
    }
  }

  fs.writeFileSync(path.join(OUT, "metrics.json"), JSON.stringify(results, null, 2));

  // ===== 第二轮：模拟 Slow 4G，观察 CSR 加载态与真实差距 =====
  console.log("\n--- 模拟 Slow 4G（延迟 150ms / 下行 1.5Mbps）---");
  const slows = [
    { name: "throttled-csr", url: `${BASE}/csr` },
    { name: "throttled-ssr", url: `${BASE}/ssr` },
    { name: "throttled-ssg", url: `${BASE}/ssg` },
  ];
  const slowResults = {};
  for (const p of slows) {
    try {
      const target = await jsonApi(`/json/new?about:blank`, "PUT");
      const cdp = await connect(target.webSocketDebuggerUrl);
      await cdp.send("Page.enable");
      await cdp.send("Runtime.enable");
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 150,
        downloadThroughput: (1.5 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
      });
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVER });
      await cdp.send("Page.navigate", { url: p.url });
      await cdp.once("Page.loadEventFired", 20000);
      // load 事件后立刻截图：CSR 此时应仍在加载数据，能看到加载态
      const early = await cdp.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(OUT, `${p.name}-early.png`), Buffer.from(early.data, "base64"));
      await sleep(6000);
      const ev = await cdp.send("Runtime.evaluate", { expression: METRICS, returnByValue: true });
      const late = await cdp.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(OUT, `${p.name}.png`), Buffer.from(late.data, "base64"));
      const m = JSON.parse(ev.result.value);
      slowResults[p.name] = m;
      console.log(`${p.name.padEnd(16)} FCP=${m.fcp}ms LCP=${m.lcp}ms CLS=${m.cls} 文本长度=${m.textLength}`);
      cdp.ws.close();
    } catch (e) {
      console.log(`${p.name.padEnd(16)} 采集失败: ${e.message}`);
    }
  }
  fs.writeFileSync(path.join(OUT, "metrics-throttled.json"), JSON.stringify(slowResults, null, 2));

  chrome.kill();
  console.log("\n结果目录:", OUT);
})();
