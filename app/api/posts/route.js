// 数据接口：CSR 页面在浏览器中通过 fetch 调用它
import { NextResponse } from "next/server";
import { posts } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    servedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    posts,
  });
}
