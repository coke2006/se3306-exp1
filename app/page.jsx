import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>CSR / SSR / SSG 渲染对比</h1>
      <p className="subtitle">
        本站使用 Next.js（App Router）实现，三个演示页分别对应一种渲染模式。
        页面上会显示关键时间戳，用来验证内容到底是「什么时候」生成的。
      </p>

      <div className="demo-grid">
        <Link href="/csr" className="demo-card">
          <span className="badge badge-blue">模式一</span>
          <h3>CSR 客户端渲染</h3>
          <p>
            HTML 是空壳，浏览器下载 JS 后再请求数据渲染。能看到明显的加载过程。
          </p>
        </Link>
        <Link href="/ssr" className="demo-card">
          <span className="badge badge-orange">模式二</span>
          <h3>SSR 服务端渲染</h3>
          <p>
            每次刷新都在服务器实时生成 HTML。刷新页面，时间戳每次都变。
          </p>
        </Link>
        <Link href="/ssg" className="demo-card">
          <span className="badge badge-green">模式三</span>
          <h3>SSG 静态生成</h3>
          <p>
            构建时就生成好 HTML。页面时间戳固定为构建时刻，刷新也不会变。
          </p>
        </Link>
      </div>

      <h2 style={{ fontSize: 20, margin: "36px 0 14px" }}>三种模式速览</h2>
      <table>
        <thead>
          <tr>
            <th>对比维度</th>
            <th>CSR</th>
            <th>SSR</th>
            <th>SSG</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>HTML 生成时机</td>
            <td>浏览器端，JS 执行后</td>
            <td>服务器端，每次请求时</td>
            <td>构建时一次性生成</td>
          </tr>
          <tr>
            <td>首屏速度</td>
            <td>慢（需等 JS + 数据请求）</td>
            <td>快</td>
            <td>最快（纯静态文件）</td>
          </tr>
          <tr>
            <td>SEO</td>
            <td>差</td>
            <td>好</td>
            <td>好</td>
          </tr>
          <tr>
            <td>服务器压力</td>
            <td>小</td>
            <td>大（每次请求都计算）</td>
            <td>极小（可全站 CDN）</td>
          </tr>
          <tr>
            <td>内容实时性</td>
            <td>实时（取决于接口）</td>
            <td>实时</td>
            <td>需重新构建才更新</td>
          </tr>
          <tr>
            <td>典型场景</td>
            <td>后台管理系统、重交互应用</td>
            <td>个性化页面、搜索结果</td>
            <td>博客、文档、官网</td>
          </tr>
        </tbody>
      </table>

      <p className="subtitle" style={{ marginTop: 24 }}>
        详细对比与实验结论见仓库 README。
      </p>
    </div>
  );
}
