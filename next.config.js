/** @type {import('next').NextConfig} */
const nextConfig = {
  // 注意：本项目使用服务端 API 路由（/api/chat、/api/generate-guide、/api/book-guide）代理 LLM 调用，
  // 以避免密钥泄露到浏览器，因此不能使用 output: 'export' 纯静态导出。
  // 'standalone' 产出自包含的 Node 服务（.next/standalone/server.js），便于部署到 ECS + pm2。
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
