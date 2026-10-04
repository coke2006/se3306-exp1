import { posts } from "@/lib/data";

// 关键：强制每次请求都在服务器上重新渲染（SSR）
export const dynamic = "force-dynamic";

export const metadata = {
  title: "SSR 服务端渲染 | SE3306 实验一",
};

export default function SsrPage() {
  // 这里的 new Date() 在「每次请求」时于服务器上执行，
  // 所以刷新页面，时间戳每次都会变 —— 这就是 SSR 的证据
  const requestTime = new Date().toLocaleString("zh-CN", { hour12: false });

  return (
    <div>
      <a href="/" className="back-link">
        ← 返回首页
      </a>
      <h1>SSR：服务端渲染</h1>
      <p className="subtitle">
        Server-Side Rendering。你收到的 HTML 是服务器在「这次请求」时实时拼好的，
        到达浏览器时列表内容已经在里面了，不需要再等 JS 拉数据。
      </p>

      <div className="card">
        <span className="badge badge-orange">渲染过程</span>
        <ul className="meta-list">
          <li>
            <b>HTML 到达浏览器时：</b>
            <span>已包含完整列表内容 → 右键「查看网页源代码」可验证</span>
          </li>
          <li>
            <b>数据获取位置：</b>
            <span>服务器（渲染组件时直接读取数据模块）</span>
          </li>
          <li>
            <b>生成时机：</b>
            <span>每一次刷新都重新执行一次（对比 SSG 理解）</span>
          </li>
        </ul>
        <div className="time-box">
          服务器本次渲染时间：{requestTime}
          <br />
          ↑ 不停刷新本页，这个时间每次都会变 —— 说明内容是实时生成的
        </div>
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
