# 线上部署清单（Supabase 链路上线）

代码已提交（本地 `2ed92fc`），**尚未推送**——按你要求先配好 GitHub Secrets 再推。
推送后 GitHub Actions 会自动构建并部署到 47.109.91.112:8080。

---

## 第 1 步：在 GitHub 仓库添加 2 个 Secret（必做，否则线上新链路失效）

打开：**GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret**

| Secret 名称 | 值 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dnfuqobsgtmyinmruovn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_ePMSV1A-gPbSQlt54Hb7jA_kryD3HWH` |

> 这两个值和 `.env.local` 里的一致（publishable key 本就是公开的，放 Secrets 是为了构建时注入，不是保密）。
> 如果仓库里已有 `NEXT_PUBLIC_AMAP_KEY` / `NEXT_PUBLIC_AMAP_SECURITY` / `ECS_HOST` / `ECS_SSH_KEY`，**不要动**，它们是地图和服务器部署用的。

---

## 第 2 步：推送代码触发部署

配好 Secret 后，告诉我一声，我来推送；或你自己执行：

```bash
cd C:\Users\22812\Documents\Codex\2026-06-27\ji\work\journey-guide
git push origin main
```

推送后 GitHub Actions 会自动：
1. `npm install` + `next build`（注入 Supabase 凭证）
2. 把 `out/` 上传到服务器
3. 替换 nginx 目录 + reload

预计 3–5 分钟完成。

---

## 第 3 步：部署后自检（命令可直接复制）

```bash
# 1) 首页正常
curl -s -o /dev/null -w "首页: HTTP %{http_code}\n" http://47.109.91.112:8080/

# 2) 路线详情页正常（新链路核心页）
curl -s -o /dev/null -w "路线页: HTTP %{http_code}\n" http://47.109.91.112:8080/route/yangzhou-wangzengqi-zaocha/

# 3) Supabase 凭证是否打进产物（关键！为空=Secret 没配对）
curl -s http://47.109.91.112:8080/route/yangzhou-wangzengqi-zaocha/ | grep -c "dnfuqobsgtmyinmruovn"
# 期望: ≥1（返回 0 说明 Secret 没配，回第 1 步检查）

# 4) 数据库连通（直接打 Supabase REST）
curl -s "https://dnfuqobsgtmyinmruovn.supabase.co/rest/v1/routes?select=slug" \
  -H "apikey: sb_publishable_ePMSV1A-gPbSQlt54Hb7jA_kryD3HWH" \
  -H "Authorization: Bearer sb_publishable_ePMSV1A-gPbSQlt54Hb7jA_kryD3HWH"
# 期望: [{"slug":"yangzhou-wangzengqi-zaocha"}]

# 5) 高德地图白名单（地图显示的前提）
#    高德开放平台 → 应用 → Web端Key → 域名白名单确认已含:
#    47.109.91.112 和 47.109.91.112:8080
```

**浏览器验证（部署完成后用手机或电脑浏览器打开）：**
- http://47.109.91.112:8080/route/yangzhou-wangzengqi-zaocha/
- 页面应显示路线概览 + 5 个点位 + 地图标记 + 打卡按钮
- Chrome DevTools → Console → 输入 `location.href` 确认无报错
- 地图能正常显示（若蓝格子/空白 → 高德白名单问题，见 `deploy/DEPLOY-SECRETS.md`）

---

## 常见问题

| 现象 | 原因 | 解决 |
|---|---|---|
| 路线页 404 | nginx 未部署 route 目录 | 确认 Actions 构建步骤成功 |
| 页面打开但显示「本地快照」 | Supabase Secret 没配 | 回第 1 步，重新 push |
| 地图蓝格子 | 高德白名单没加服务器 IP | 高德控制台加 `47.109.91.112` |
| 打卡提示失败 | Anonymous sign-ins 未开 | Supabase → Authentication → 开启 |

---

## 已知遗留（不影响本次部署，记 BLOCKED.md）

1. nginx 未配 `error_page 404 /404.html`，未知路线 id 会显示 nginx 默认 404 页（非品牌页）——改 `deploy/nginx-xuncheng.conf` 一行即可，待你确认后我随下次提交一起带上。
2. 浏览器 Sensors 伪造 GPS 截图需 GUI 自测（坐标 `32.3938, 119.4142`）。
3. 文学卡片的插图/照片素材等设计出图，当前用占位。
