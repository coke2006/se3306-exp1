import { posts, buildTag } from "@/lib/data";
import fs from "fs";
import path from "path";

// SSG：不做任何特殊配置时，无动态 API 的页面在 next build 时即被静态生成。
// 下面读取构建信息，用于在页面上证明「内容来自构建时刻」。
function getBuildInfo() {
  try {
    // 读取构建产物中记录的构建时间（.next/BUILD_ID 的修改时间即构建时间）
    const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");
    const stat = fs.statSync(buildIdPath);
    return stat.mtime.toLocaleString("zh-CN", { hour12: false });
  } catch {
    return "开发模式下运行（dev 模式每次请求都重新渲染，无法体现 SSG）";
  }
}

export const metadata = {
  title: "SSG 静态生成 | SE3306 实验一",
};

export default function SsgPage() {
  const buildTime = getBuildInfo();

  return (
    <div>
      <a href="/" className="back-link">
        ← 返回首页
      </a>
      <h1>SSG：静态站点生成</h1>
      <p className="subtitle">
        Static Site Generation。整个页面在执行 <code>next build</code>{" "}
        时就已经生成成 HTML 文件了，部署后服务器（或 CDN）
        只是原样返回文件，不做任何计算。
      </p>

      <div className="card">
        <span className="badge badge-green">渲染过程</span>
        <ul className="meta-list">
          <li>
            <b>HTML 到达浏览器时：</b>
            <span>已包含完整列表内容，且内容和构建时一模一样</span>
          </li>
          <li>
            <b>数据获取位置：</b>
            <span>构建机器（build 时读取数据模块）</span>
          </li>
          <li>
            <b>生成时机：</b>
            <span>next build 执行时，一次性生成</span>
          </li>
        </ul>
        <div className="time-box">
          本页面的构建时间：{buildTime}
          <br />
          项目标识：{buildTag}
          <br />↑ 不停刷新本页，这个时间永远不变 —— 说明内容是构建时生成的静态产物
        </div>
      </div>

      <div className="note">
        思考：如果想让 SSG 页面也能定期更新内容怎么办？—— 可以使用 ISR
        （增量静态再生），在 Next.js 中给页面加 <code>export const revalidate =
        60</code>，即可每 60 秒在后台重新生成一次。
      </div>

      {posts.map((post) => (
        <div className="card" key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.summary}</p>
        </div>
      ))}
    </div>
  );
}
