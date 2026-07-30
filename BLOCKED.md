# BLOCKED — 非遗活动 + 360°全景 浏览层

## 阻断项
无。

## 待后续处理（非阻断，已用合理方案兜底）
1. **全景图为占位图**：当前用 Pannellum 官方示例全景图（alma/cerro-toco/jfk）按点位轮换，非景点实拍。
   - 影响：用户看到的全景是通用风景，不是该景点真实全景。
   - 后续：替换为各景点实拍 360° 全景图，或在 JSON 给重点点位配 panorama 字段指向真实全景图 URL。

2. **Pannellum 走 CDN 而非 npm**：决策见 PROGRESS.md。若后期 CDN 不稳定或需离线运行，可改为自托管 pannellum 脚本（放 public/pannellum/）或装 photo-sphere-viewer（基于 three.js，但属于"全景渲染"非"3D建模"，符合任务书精神）。

3. **非遗活动时间为示例**：heritage.json 里 activity 字段是静态示例（如"秦淮灯会·2026预计春节"），非实时。需人工按季更新。

4. **张家界无非遗数据**：非遗覆盖扬苏杭宁4城，张家界路线点位显示兜底文案"暂无非遗活动信息"。
