// 模拟数据源：三种渲染模式共用同一份数据，便于对比差异
export const posts = [
  {
    id: 1,
    title: "CSR：客户端渲染",
    summary: "浏览器先下载空 HTML 和 JS 包，再由 JS 请求数据并渲染页面。首屏慢、有白屏/加载态，但后续交互流畅，服务器压力小。",
  },
  {
    id: 2,
    title: "SSR：服务端渲染",
    summary: "每次请求都在服务器上实时生成完整 HTML 再返回。首屏快、SEO 友好，但服务器每次都要计算，压力较大。",
  },
  {
    id: 3,
    title: "SSG：静态站点生成",
    summary: "在构建阶段就把 HTML 生成好，部署后直接返回静态文件。首屏最快、可上 CDN，但内容更新需要重新构建。",
  },
  {
    id: 4,
    title: "如何区分三者",
    summary: "看 HTML 到达浏览器时是否已含内容：CSR 到达时是空壳；SSR 到达时是本次请求的新内容；SSG 到达时是构建时的旧内容。",
  },
  {
    id: 5,
    title: "选型建议",
    summary: "内容不常变（文档、博客、官网）用 SSG；内容实时（用户主页、搜索结果）用 SSR；重交互、弱 SEO 的后台类应用用 CSR。",
  },
];

export const buildTag = "se3306-exp1";
