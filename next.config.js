/** @type {import('next').NextConfig} */
const nextConfig = {
  // 注意：本项目使用服务端 API 路由（app/api/generate-guide）代理 LLM 调用，
  // 以避免密钥泄露到浏览器，因此不能使用 output: 'export' 纯静态导出。
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
