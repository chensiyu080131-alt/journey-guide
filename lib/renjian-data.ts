// 人间滋味 · 汪曾祺美食文旅 — 数据模块
// 章节、高邮点位、全国城市、人生阶段

export interface Chapter {
  no: string
  title: string
  theme: string
  essays: string
}

export interface GaoPoint {
  id: string
  name: string
  food: string
  quote: string
  spot: string
  scene: string
  x: number
  y: number
  anchor?: boolean
}

export interface City {
  id: string
  name: string
  icon: string
  tag?: string         // 故乡 / 第二故乡 / 定居 / 下放 / 区域
  home?: boolean
  region: string
  foods: string[]
  tastes: string[]
}

export interface Stage {
  year: string
  title: string
  place: string
  desc: string
  foods: string[]
}

export interface RouteStop {
  no: number
  name: string
  time: string
  desc: string
}

// 四章
export const chapters: Chapter[] = [
  { no: '一', title: '安身之本，必资于食', theme: '食材本味', essays: '《五味》《葵·薤》《故乡的食物》《故乡的野菜》' },
  { no: '二', title: '肉食者不鄙', theme: '肉类美食', essays: '《肉食者不鄙》《鱼我所欲也》《鳜鱼》《手把肉》' },
  { no: '三', title: '吃喝门道，贵在讲究', theme: '饮食讲究', essays: '《豆腐》《干丝》《韭菜花》《家常酒菜》' },
  { no: '四', title: '四方食事，明心见性', theme: '各地风味', essays: '《四方食事》《食道旧寻》《宋朝人的吃喝》' },
]

// 高邮 9 个点位(SVG 坐标 viewBox 0 0 820 540)
export const gaoPoints: GaoPoint[] = [
  { id: 'wangzengqi', name: '汪曾祺纪念馆', food: '锚点 · 作家故居', quote: '我的家乡是水乡，出鸭。', spot: '汪曾祺纪念馆（中心锚点）', scene: '纪念馆实景', x: 410, y: 270, anchor: true },
  { id: 'duck', name: '高邮湖 · 咸鸭蛋', food: '🥚 咸鸭蛋', quote: '高邮咸蛋的黄是通红的。筷子头一扎下去，吱——红油就冒出来了。', spot: '高邮湖 · 鸭蛋之乡', scene: '高邮湖风光', x: 170, y: 250 },
  { id: 'river', name: '运河码头 · 螺蛳蚬子', food: '🐚 螺蛳·蚬子', quote: '孩子们把螺蛳壳甩到屋顶上，叮叮当当响。', spot: '高邮湖湿地 · 大运河', scene: '运河码头', x: 470, y: 400 },
  { id: 'yucheng', name: '盂城驿', food: '📜 古驿站', quote: '高邮是古城，盂城驿是明代留下来的驿站。', spot: '盂城驿（全国重点文保）', scene: '盂城驿', x: 360, y: 175 },
  { id: 'jieshou', name: '界首镇 · 茶干', food: '🟫 界首茶干', quote: '界首的茶干，是很有名的。', spot: '界首镇（国家地理标志产品）', scene: '界首老街', x: 660, y: 120 },
  { id: 'dongdajie', name: '东大街 · 炒米焦屑', food: '🍚 炒米·焦屑', quote: '一到冬天，街上就有人炒米。炒米和焦屑，是我们那里的东西。', spot: '东大街 · 高邮老街', scene: '冬日街巷', x: 500, y: 310 },
  { id: 'wild', name: '乡村田野 · 野菜', food: '🌿 蒌蒿·荠菜·马齿苋', quote: '蒌蒿满地芦芽短。枸杞、荠菜、马齿苋，都是野菜。', spot: '高邮乡村田野', scene: '水乡田野', x: 200, y: 440 },
  { id: 'pubao', name: '街头 · 蒲包肉', food: '🥟 蒲包肉', quote: '蒲包肉，是用蒲草包着卤的肉。', spot: '高邮街头小吃摊', scene: '街头小吃', x: 560, y: 215 },
  { id: 'doufu', name: '本地餐馆 · 汪豆腐', food: '🍲 汪豆腐', quote: '汪豆腐是高邮菜，这名字是我给它取的。', spot: '高邮本地餐馆', scene: '家常菜馆', x: 610, y: 345 },
]

// 高邮一日路线
export const gaoRoute: RouteStop[] = [
  { no: 1, name: '汪曾祺纪念馆', time: '9:00', desc: '起点' },
  { no: 2, name: '高邮湖', time: '10:30', desc: '咸鸭蛋·河鲜' },
  { no: 3, name: '盂城驿', time: '13:00', desc: '古驿站' },
  { no: 4, name: '界首镇', time: '15:00', desc: '茶干' },
  { no: 5, name: '东大街', time: '17:30', desc: '炒米焦屑·蒲包肉' },
]

// 五味
export const tastes = [
  { id: '酸', em: '🍋' },
  { id: '甜', em: '🍯' },
  { id: '苦', em: '🍵' },
  { id: '辣', em: '🌶️' },
  { id: '咸', em: '🧂' },
]

// 全国 18 城
export const cities: City[] = [
  { id: 'gaoyou', name: '高邮', icon: '🏠', tag: '故乡', home: true, region: '华东', foods: ['咸鸭蛋 · 高邮湖', '炒米焦屑 · 东大街', '蒲包肉 · 街头'], tastes: ['咸', '苦'] },
  { id: 'kunming', name: '昆明', icon: '🌸', tag: '第二故乡', home: true, region: '西南', foods: ['汽锅鸡 · "培养正气"', '过桥米线 · 翠湖', '牛肝菌 · 篆新农贸市场'], tastes: ['甜'] },
  { id: 'beijing', name: '北京', icon: '🏛️', tag: '定居', home: true, region: '华北', foods: ['豆汁儿焦圈 · 护国寺', '涮羊肉 · 东来顺', '豆腐 · 家常菜馆'], tastes: ['咸'] },
  { id: 'zjk', name: '张家口', icon: '🌾', tag: '下放', home: true, region: '华北', foods: ['马铃薯 · 沙岭子', '手把肉 · 草原', '莜面 · 坝上'], tastes: ['咸'] },
  { id: 'shanxi', name: '山西', icon: '🍶', region: '华北', foods: ['陈醋 · 太原', '杨树叶酸菜 · 大同'], tastes: ['酸'] },
  { id: 'liaoning', name: '辽宁', icon: '🍲', region: '东北', foods: ['酸菜白肉火锅 · 沈阳', '海鲜 · 大连'], tastes: ['酸', '咸'] },
  { id: 'fujian', name: '福建', icon: '🍊', region: '华南', foods: ['酸笋 · 福州', '泥蚶 · 厦门', '蜜柚 · 泉州'], tastes: ['酸', '甜'] },
  { id: 'guangxi', name: '广西', icon: '🍜', region: '华南', foods: ['酸笋 · 南宁', '老友面 · 南宁'], tastes: ['酸', '辣'] },
  { id: 'sichuan', name: '四川', icon: '🌶️', region: '西南', foods: ['灯影牛肉 · 成都', '麻辣 · 重庆'], tastes: ['辣'] },
  { id: 'dongbei', name: '东北', icon: '🥘', region: '东北', foods: ['白肉火锅 · 哈尔滨', '炖菜 · 长春'], tastes: ['咸'] },
  { id: 'hunan', name: '湖南', icon: '🥢', region: '华中', foods: ['臭豆腐 · 长沙火宫殿'], tastes: ['辣'] },
  { id: 'neimeng', name: '内蒙古', icon: '🍖', region: '华北', foods: ['手把肉 · 呼伦贝尔草原'], tastes: ['咸'] },
  { id: 'huaian', name: '淮安', icon: '🦁', region: '华东', foods: ['狮子头 · 淮安'], tastes: ['咸'] },
  { id: 'zhenjiang', name: '镇江', icon: '🥩', region: '华东', foods: ['肴蹄 · 镇江（配醋）'], tastes: ['酸', '咸'] },
  { id: 'shanghai', name: '上海', icon: '🍲', region: '华东', foods: ['腌笃鲜 · 本帮菜馆'], tastes: ['咸'] },
  { id: 'huizhou', name: '徽州', icon: '🐟', region: '华东', foods: ['臭鳜鱼 · 黄山、歙县'], tastes: ['咸', '辣'] },
  { id: 'jiangyin', name: '江阴', icon: '🐡', region: '华东', foods: ['河豚 · 江阴'], tastes: ['咸'] },
  { id: 'hangzhou', name: '杭州', icon: '🍵', region: '华东', foods: ['虎跑泉龙井 · 虎跑泉', '西湖醋鱼 · 西湖'], tastes: ['酸', '甜', '苦'] },
]

// 人生五阶段
export const stages: Stage[] = [
  { year: '1920 — 1939', title: '高邮童年', place: '🏠 江苏高邮 · 水乡',
    desc: '在水乡长大,咸鸭蛋的红油、冬至街巷的炒米香、田野里的野菜,是汪曾祺一生味觉的底色。',
    foods: ['🥚 咸鸭蛋', '🍚 炒米', '🌾 焦屑', '🌿 野菜', '🐚 螺蛳'] },
  { year: '1939 — 1946', title: '昆明联大', place: '🌸 云南昆明 · 西南联大七年',
    desc: '在西南联大读书七年,汽锅鸡、过桥米线、雨季的菌子,还有茶馆里泡着的半天时光。昆明成了他的"第二故乡"。',
    foods: ['🍲 汽锅鸡', '🍜 过桥米线', '🍄 牛肝菌', '🥮 火腿月饼', '🍵 茶馆'] },
  { year: '1946 — 1958', title: '辗转上海 / 北京', place: '✈️ 各地 · 风味初识',
    desc: '离滇北上,经上海到北京定居。一路尝遍各地风味,为日后的《四方食事》攒下素材。',
    foods: ['🦁 淮安狮子头', '🐟 江阴河豚', '🥬 上海腌笃鲜', '🐟 徽州臭鳜鱼'] },
  { year: '1958 — 1962', title: '张家口下放', place: '🌾 河北张家口 · 沙岭子',
    desc: '下放劳动,画《中国马铃薯图谱》。在沽源的荒凉里写出诗意,坝上的莜面与草原的手把肉,是苦日子里的暖。',
    foods: ['🥔 马铃薯', '🌾 莜面', '🍖 手把肉'] },
  { year: '1962 — 1997', title: '北京定居', place: '🏛️ 北京 · 定居至终',
    desc: '回到北京,喝豆汁儿、拌豆腐、写《四方食事》。把大半生的滋味,写成了这本《人间滋味》。',
    foods: ['🥣 豆汁儿', '🧇 烧饼焦圈', '🍘 豆腐', '🌶️ 韭菜花', '📖 四方食事'] },
]
