# SE3306 实验一：CSR / SSR / SSG 渲染对比

> - **仓库**：https://gitee.com/coker-coal/se3306-exp1
> - **部署地址**：https://se3306-exp1-coke11.vercel.app
> - **技术栈**：Next.js 14（App Router）+ React 18

## 一、实验目的

在同一个项目中分别实现 **CSR（客户端渲染）**、**SSR（服务端渲染）**、**SSG（静态站点生成）** 三种渲染模式，通过页面时间戳与查看网页源代码，直观对比三者的差异并理解其适用场景。

## 二、如何运行

```bash
npm install
npm run dev     # 开发模式：http://localhost:3000
npm run build   # 生产构建
npm run start   # 生产模式：http://localhost:3000
```

> 注意：SSG 的效果必须在 `build + start`（生产模式）下观察；`dev` 模式下所有页面都是实时渲染的，无法体现 SSG。

## 三、实验设计

| 路由 | 渲染模式 | 实现方式 |
| --- | --- | --- |
| `/csr` | CSR | `'use client'` 组件，`useEffect` 中 `fetch('/api/posts')` 请求数据后渲染 |
| `/ssr` | SSR | 服务端组件 + `export const dynamic = 'force-dynamic'`，每次请求在服务器执行渲染 |
| `/ssg` | SSG | 服务端组件无动态 API，`next build` 时预渲染为静态 HTML |
| `/api/posts` | 数据接口 | Route Handler，为 CSR 页面提供数据 |
| `/` | 对比总览 | 三种模式速查表 |

**验证手段（每个页面都内置了）：**

1. 页面显示关键时间戳：
   - CSR 页显示「浏览器当前时间 / 数据请求发起时间」；
   - SSR 页显示「服务器本次渲染时间」——**不停刷新，每次都变**；
   - SSG 页显示「构建时间」——**不停刷新，永远不变**。
2. 右键「查看网页源代码」：
   - CSR 页的 HTML 里**没有**列表内容（空壳 + JS）；
   - SSR 页的 HTML 里**有**列表内容，且每次请求都是新的；
   - SSG 页的 HTML 里**有**列表内容，但永远是构建时刻的内容。

## 四、实验结果与对比分析

| 对比维度 | CSR | SSR | SSG |
| --- | --- | --- | --- |
| HTML 生成时机 | 浏览器端，JS 执行后 | 服务器端，每次请求时 | 构建时一次性生成 |
| 首屏速度 | 慢（需等 JS + 接口请求） | 快 | 最快（纯静态文件） |
| SEO | 差（爬虫拿到空壳） | 好 | 好 |
| 服务器压力 | 小（只出静态资源和接口） | 大（每次请求都计算） | 极小（可全站 CDN） |
| 内容实时性 | 实时（取决于接口） | 实时 | 需重新构建才更新 |
| 开发路由示例 | `/csr` | `/ssr` | `/ssg` |
| 构建产物类型 | 动态页面（客户端渲染） | 动态页面（服务端渲染） | 静态 HTML |

**实验结论：**

1. **CSR** 的 HTML 到达浏览器时是空壳，内容全部由浏览器中的 JS 拉取并渲染，因此首屏最慢、SEO 最差，但服务器压力小、交互体验好，适合后台管理系统等重交互、弱 SEO 场景。
2. **SSR** 每次请求都在服务器实时生成完整 HTML，首屏快、SEO 好、内容实时，代价是服务器每次都要计算，适合内容实时变化的页面（如个性化推荐、搜索结果）。
3. **SSG** 在构建时就把 HTML 生成好，访问时直接返回静态文件，速度和稳定性最佳，但内容更新需要重新构建，适合博客、文档、官网等不常变化的内容。若需要"定期更新"，可使用 ISR（增量静态再生）：给页面加 `export const revalidate = 60` 即可每 60 秒后台重新生成。

## 五、仓库结构

```
se3306-exp1/
├── app/
│   ├── page.jsx          # 首页：三种模式对比总览
│   ├── layout.jsx        # 全局布局与导航
│   ├── globals.css       # 全局样式
│   ├── csr/page.jsx      # CSR 演示页
│   ├── ssr/page.jsx      # SSR 演示页
│   ├── ssg/page.jsx      # SSG 演示页
│   └── api/posts/route.js# 数据接口（供 CSR 页 fetch）
├── lib/data.js           # 共用模拟数据
├── next.config.mjs
├── edgeone.json          # EdgeOne Pages 部署配置
└── README.md
```

## 六、部署说明（Vercel）

本项目最终部署在 Vercel（免费 Hobby 套餐，原生支持 Next.js 的 SSR/SSG）：

1. 将代码推送到 GitHub 仓库（https://github.com/coke2006/se3306-exp1）；
2. 在 [Vercel](https://vercel.com) 使用 GitHub 账号登录，Import 该仓库；
3. Framework Preset 自动识别为 Next.js，直接 Deploy；
4. 在 Settings → Deployment Protection 中关闭 Vercel Authentication，使链接可公开访问；
5. 最终访问地址：**https://se3306-exp1-coke11.vercel.app**，每次向 main 分支推送会自动重新部署。

> 备注：也曾部署到腾讯云 EdgeOne Makers（见 `edgeone.json`），但其默认域名对中国大陆加速区域仅提供 3 小时限时预览链接，长期公开访问需绑定已备案的自定义域名，故最终采用 Vercel。
