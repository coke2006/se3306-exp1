// 抓取三个页面的真实源码，生成证据页 HTML（供截图用），并核对内容差异
const fs = require("node:fs");
const path = require("node:path");

const BASE = "http://localhost:3000";
const OUT = path.join(__dirname, "..", "lab1-shots");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function grab(p) {
  const res = await fetch(`${BASE}${p}`);
  return res.text();
}

(async () => {
  const pages = [
    { path: "/csr", file: "evidence-csr.html", title: "CSR 页面浏览器实际收到的 HTML 源码" },
    { path: "/ssr", file: "evidence-ssr.html", title: "SSR 页面浏览器实际收到的 HTML 源码" },
  ];
  for (const p of pages) {
    const html = await grab(p.path);
    const hasList = html.includes("如何区分三者");
    const hasLoading = html.includes("正在从接口获取数据");
    const page = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${p.title}</title>
<style>body{font-family:Consolas,monospace;background:#fff;margin:0;padding:16px}
h3{font-family:'Microsoft YaHei';font-size:15px;margin:0 0 8px}
.note{font-family:'Microsoft YaHei';font-size:13px;color:#0a7a3d;margin-bottom:10px}
pre{background:#f6f8fa;border:1px solid #ddd;border-radius:6px;padding:12px;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-all}</style>
</head><body>
<h3>${p.title}（GET ${BASE}${p.path}，共 ${Buffer.byteLength(html)} 字节）</h3>
<div class="note">核对结果：源码${hasList ? "【包含】" : "【不包含】"}文章列表正文；${
      hasLoading ? "包含" : "不包含"
    }「正在从接口获取数据」加载占位</div>
<pre>${esc(html)}</pre></body></html>`;
    fs.writeFileSync(path.join(OUT, p.file), page);
    console.log(`${p.path} -> ${p.file}  含正文=${hasList}  含加载占位=${hasLoading}  大小=${Buffer.byteLength(html)}B`);
  }
})();
