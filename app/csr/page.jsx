"use client";

import { useEffect, useState } from "react";

export default function CsrPage() {
  const [posts, setPosts] = useState(null);
  const [fetchTime, setFetchTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // 数据获取发生在浏览器端：页面已先到达用户，这里才发起请求
    const start = new Date();
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error("接口请求失败");
        return res.json();
      })
      .then((data) => {
        setPosts(data.posts);
        setFetchTime(start.toLocaleString("zh-CN", { hour12: false }));
      })
      .catch((e) => setError(e.message));
  }, []);

  const now = new Date().toLocaleString("zh-CN", { hour12: false });

  return (
    <div>
      <a href="/" className="back-link">
        ← 返回首页
      </a>
      <h1>CSR：客户端渲染</h1>
      <p className="subtitle">
        Client-Side Rendering。你刚才打开这个页面时，浏览器先收到一个
        「空壳 HTML」，再下载 JS、执行、向接口要数据，最后才把列表画出来。
      </p>

      <div className="card">
        <span className="badge badge-blue">渲染过程</span>
        <ul className="meta-list">
          <li>
            <b>HTML 到达浏览器时：</b>
            <span>不含列表内容（只有空 div + JS 引用）→ 右键「查看网页源代码」可验证</span>
          </li>
          <li>
            <b>数据请求发起方：</b>
            <span>浏览器（useEffect 中 fetch /api/posts）</span>
          </li>
          <li>
            <b>页面渲染方：</b>
            <span>浏览器中的 React</span>
          </li>
        </ul>
        <div className="time-box">
          页面在浏览器中当前时间：{now}
          {fetchTime && (
            <>
              <br />
              数据请求发起时间：{fetchTime}
            </>
          )}
        </div>
      </div>

      {error && <div className="note">加载失败：{error}</div>}

      {!posts && !error && (
        <div className="loading">
          {/* 这段加载态只会出现在 CSR 页面：数据还没回来 */}
          <div className="spinner" />
          正在从接口获取数据……（CSR 特有的加载过程）
        </div>
      )}

      {posts &&
        posts.map((post) => (
          <div className="card" key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.summary}</p>
          </div>
        ))}
    </div>
  );
}
