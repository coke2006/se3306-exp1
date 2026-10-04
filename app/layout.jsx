import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "SE3306 实验一：CSR/SSR/SSG 渲染对比",
  description: "使用 Next.js 演示并对比 CSR、SSR、SSG 三种渲染模式",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="logo">
              SE3306 · 实验一
            </Link>
            <nav className="nav">
              <Link href="/csr">CSR</Link>
              <Link href="/ssr">SSR</Link>
              <Link href="/ssg">SSG</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            SE3306 实验一 · CSR / SSR / SSG 渲染对比 · Next.js 实现
          </div>
        </footer>
      </body>
    </html>
  );
}
