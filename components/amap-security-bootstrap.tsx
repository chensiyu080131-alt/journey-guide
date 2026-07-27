import Script from 'next/script'

/** 必须在高德 JS 脚本加载之前注入（官方要求） */
export function AmapSecurityBootstrap() {
  const code = process.env.NEXT_PUBLIC_AMAP_SECURITY
  if (!code) return null

  return (
    <Script id="amap-security-config" strategy="beforeInteractive">
      {`window._AMapSecurityConfig={securityJsCode:${JSON.stringify(code)}};`}
    </Script>
  )
}
