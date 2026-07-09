# 线上 LLM 部署检查清单

线上 **必须跑 Node 服务**（`standalone` + pm2 + nginx 反代），纯静态 `out/` 部署 **没有** `/api/*`，LLM 不会工作。

## GitHub Repository Secrets（Settings → Secrets and variables → Actions）

| Secret | 必填 | 说明 |
|--------|------|------|
| `ECS_HOST` | ✅ | 服务器 IP |
| `ECS_SSH_KEY` | ✅ | SSH 私钥 |
| `LLM_API_KEY` | ✅ | 大模型 API Key（**缺了就走演示模式**） |
| `LLM_BASE_URL` | 建议 | 如 `https://api.deepseek.com/v1` |
| `LLM_MODEL` | 建议 | 如 `deepseek-chat` |
| `NEXT_PUBLIC_AMAP_KEY` | 建议 | 前端地图 |
| `NEXT_PUBLIC_AMAP_SECURITY` | 建议 | 高德安全密钥 |
| `AMAP_WEB_KEY` | 可选 | 服务端 POI 搜索，默认同 `NEXT_PUBLIC_AMAP_KEY` |

## 部署后自检

```bash
curl http://47.109.91.112:8080/api/book-guide
# 期望：{"mock":false,"reason":null}
# 若 mock:true → LLM_API_KEY 未注入
```

## 常见原因：线上没有 LLM

1. **仍是静态站** — `deploy.yml` 还在上传 `out/*`，未合并 standalone 版本  
2. **Secret 未配** — `LLM_API_KEY` 为空 → `shouldUseMock()` 为 true  
3. **nginx 未反代** — 8080 指向旧静态目录，POST `/api/*` 返回 405  
