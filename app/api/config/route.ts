import { NextResponse } from 'next/server'

/** 运行期配置探针（地图 Key 是否已注入服务端环境） */
export async function GET() {
  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY || process.env.AMAP_WEB_KEY || ''
  const amapSecurity = process.env.NEXT_PUBLIC_AMAP_SECURITY || ''

  return NextResponse.json({
    amap: {
      hasKey: Boolean(amapKey),
      hasSecurity: Boolean(amapSecurity),
      keyPrefix: amapKey ? `${amapKey.slice(0, 6)}…` : null,
    },
    llm: {
      hasKey: Boolean(process.env.LLM_API_KEY),
      useMock: process.env.USE_MOCK === 'true' || !process.env.LLM_API_KEY,
    },
    nodeEnv: process.env.NODE_ENV,
  })
}
