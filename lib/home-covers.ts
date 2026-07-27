export type HomeTab = '首页' | '📖 书籍' | '🏙️ 城市' | '🎮 游戏' | '🎵 音乐'
export type CoverCategory = '书籍' | '🎬 影视' | '🎮 游戏' | '🎵 音乐' | '🏃 运动' | '🏙️ 城市' | '🔍 搜索'

export interface CoverStyle {
  bg: string
  border: string
  title: string
  subtitle: string
  motif: 'book' | 'note' | 'game' | 'landscape' | 'city' | 'film' | 'sport' | 'search'
}

export interface HomeCover {
  id: string
  category: CoverCategory
  title: string
  subtitle: string
  route: string
  style: CoverStyle
  /** 若提供，则封面直接渲染该图片（覆盖默认的排版封面） */
  image?: string
  /** 首页总览封面：点击「开始探索」后切换到该版块，而非进入攻略 */
  targetTab?: HomeTab
  /** 覆盖封面上方的分类小标签展示文案 */
  eyebrow?: string
  /** 首页总览封面：背景堆叠的其它封面缩影，营造「多张封面」的视觉 */
  stack?: Array<{ bg: string; border: string; image?: string }>
}

// ──────────────────────────────────────
//  📖 书籍 Tab
// ──────────────────────────────────────
const bookCovers: HomeCover[] = [
  {
    id: 'renjianziwei',
    category: '书籍',
    title: '人间滋味',
    subtitle: '汪曾祺 · 高邮烟火',
    route: '/guide/renjianziwei',
    image: '/images/cover-renjianziwei.png',
    style: {
      bg: 'linear-gradient(165deg, #FDF8F2 0%, #E8D8CC 100%)',
      border: '#8B4545',
      title: '#6B3333',
      subtitle: '#8A6A5A',
      motif: 'book',
    },
  },
  {
    id: 'biancheng-book',
    category: '书籍',
    title: '边城',
    subtitle: '沈从文 · 湘西凤凰',
    route: '/guide/fenghuang',
    image: '/images/cover-biancheng.jpg',
    style: {
      bg: 'linear-gradient(165deg, #D4D8E0 0%, #A8B4C0 100%)',
      border: '#5A6878',
      title: '#2E3E4E',
      subtitle: '#5A6A7A',
      motif: 'book',
    },
  },
  {
    id: 'niehaifeng',
    category: '书籍',
    title: '孽海花',
    subtitle: '晚清文人 · 曾朴',
    route: '/guide/niehaifeng',
    image: '/images/cover-niehaifeng.jpg',
    style: {
      bg: 'linear-gradient(165deg, #D8E4E2 0%, #A8BFB8 100%)',
      border: '#5A7D78',
      title: '#3D5550',
      subtitle: '#6B8480',
      motif: 'book',
    },
  },
  {
    id: 'qianliu',
    category: '书籍',
    title: '柳如是别传',
    subtitle: '钱柳情缘 · 陈寅恪',
    route: '/guide/qianliu',
    image: '/images/cover-qianliu.jpg',
    style: {
      bg: 'linear-gradient(165deg, #EDE4D8 0%, #D4C8B8 100%)',
      border: '#8A7B6A',
      title: '#4A4238',
      subtitle: '#7A7064',
      motif: 'book',
    },
  },
  {
    id: 'wengtonghe',
    category: '书籍',
    title: '翁同龢传',
    subtitle: '两代帝师 · 常熟风骨',
    route: '/guide/wengtonghe',
    image: '/images/cover-wengtonghe.jpg',
    style: {
      bg: 'linear-gradient(165deg, #E8E4DC 0%, #C9C2B4 100%)',
      border: '#7A7368',
      title: '#454038',
      subtitle: '#7A7368',
      motif: 'book',
    },
  },
  {
    id: 'shajiabang',
    category: '书籍',
    title: '沙家浜',
    subtitle: '红色经典 · 芦苇荡',
    route: '/guide/shajiabang',
    image: '/images/cover-shajiabang.jpg',
    style: {
      bg: 'linear-gradient(165deg, #DDE5DC 0%, #B5C4B0 100%)',
      border: '#5C7260',
      title: '#3A4A3C',
      subtitle: '#6A7A6C',
      motif: 'book',
    },
  },
]

// ──────────────────────────────────────
//  🎬 影视 Tab
// ──────────────────────────────────────
const filmCovers: HomeCover[] = [
  {
    id: 'fanhua',
    category: '🎬 影视',
    title: '繁花',
    subtitle: '王家卫 · 上海弄堂',
    route: '/guide/shanghai',
    image: '/images/cover-fanhua.jpg',
    style: {
      bg: 'linear-gradient(165deg, #E8D4CC 0%, #C4A898 100%)',
      border: '#8A5A4A',
      title: '#4A2E24',
      subtitle: '#7A5A4A',
      motif: 'film',
    },
  },
  {
    id: 'biancheng-film',
    category: '🎬 影视',
    title: '边城',
    subtitle: '沈从文 · 湘西凤凰',
    route: '/guide/fenghuang',
    style: {
      bg: 'linear-gradient(165deg, #D4D8E0 0%, #A8B4C0 100%)',
      border: '#5A6878',
      title: '#2E3E4E',
      subtitle: '#5A6A7A',
      motif: 'film',
    },
  },
  {
    id: 'shajiabang-film',
    category: '🎬 影视',
    title: '沙家浜',
    subtitle: '京剧经典 · 芦苇荡传奇',
    route: '/guide/shajiabang',
    style: {
      bg: 'linear-gradient(165deg, #EDE8DF 0%, #D9D0C2 100%)',
      border: '#8A8278',
      title: '#4A4540',
      subtitle: '#8A8278',
      motif: 'film',
    },
  },
  {
    id: 'baishechuan',
    category: '🎬 影视',
    title: '白蛇传',
    subtitle: '千年传说 · 金山水漫',
    route: '/guide/zhenjiang',
    style: {
      bg: 'linear-gradient(165deg, #D8E0E8 0%, #B0C0D0 100%)',
      border: '#5A7088',
      title: '#2E4458',
      subtitle: '#5A7088',
      motif: 'film',
    },
  },
  {
    id: 'changan-film',
    category: '🎬 影视',
    title: '长安三万里',
    subtitle: '大唐诗仙 · 长安梦回',
    route: '/guide/xian',
    style: {
      bg: 'linear-gradient(165deg, #E0D0B8 0%, #C8A878 100%)',
      border: '#8A6A3A',
      title: '#4A3A1E',
      subtitle: '#7A5A2A',
      motif: 'film',
    },
  },
  {
    id: 'chaguan-film',
    category: '🎬 影视',
    title: '茶馆',
    subtitle: '老舍 · 北京人艺经典',
    route: '/guide/beijing',
    style: {
      bg: 'linear-gradient(165deg, #E0C8C0 0%, #C09888 100%)',
      border: '#8A4A3A',
      title: '#4A2E24',
      subtitle: '#7A4A3A',
      motif: 'film',
    },
  },
]

// ──────────────────────────────────────
//  🎮 游戏 Tab
// ──────────────────────────────────────
const gameCovers: HomeCover[] = [
  {
    id: 'yuanshen',
    category: '🎮 游戏',
    title: '原神',
    subtitle: '璃月取景 · 张家界巡礼',
    route: '/guide/zhangjiajie',
    image: '/images/cover-yuanshen.jpg',
    style: {
      bg: 'linear-gradient(165deg, #E0D8F0 0%, #B8A8D8 100%)',
      border: '#6A5A8A',
      title: '#3A2E5A',
      subtitle: '#6A5A8A',
      motif: 'game',
    },
  },
  {
    id: 'black-myth',
    category: '🎮 游戏',
    title: '黑神话·悟空',
    subtitle: '取景地 · 山西古建巡礼',
    route: '/guide/shanxi',
    style: {
      bg: 'linear-gradient(165deg, #E0D8D0 0%, #B8A898 100%)',
      border: '#7A6A58',
      title: '#4A3A28',
      subtitle: '#7A6A58',
      motif: 'game',
    },
  },
  {
    id: 'poem-challenge',
    category: '🎮 游戏',
    title: '诗词诵读',
    subtitle: '跟着原文 · 朗读挑战',
    route: '/guide/niehaifeng',
    style: {
      bg: 'linear-gradient(165deg, #D8E4E2 0%, #A8BFB8 100%)',
      border: '#5A7D78',
      title: '#3D5550',
      subtitle: '#6B8480',
      motif: 'game',
    },
  },
  {
    id: 'treasure-hunt',
    category: '🎮 游戏',
    title: '古籍寻宝',
    subtitle: '找错字 · 读原文',
    route: '/guide/wengtonghe',
    style: {
      bg: 'linear-gradient(165deg, #EDE4D8 0%, #D4C8B8 100%)',
      border: '#8A7B6A',
      title: '#4A4238',
      subtitle: '#7A7064',
      motif: 'game',
    },
  },
]

// ──────────────────────────────────────
//  🎵 音乐 Tab
// ──────────────────────────────────────
const musicCovers: HomeCover[] = [
  {
    id: 'yangzhou-song',
    category: '🎵 音乐',
    title: '扬州慢',
    subtitle: '姜夔 · 淮左名都',
    route: '/guide/yangzhou',
    style: {
      bg: 'linear-gradient(165deg, #D4E8E0 0%, #B8D4C8 100%)',
      border: '#5A7D78',
      title: '#3D5550',
      subtitle: '#6B8480',
      motif: 'note',
    },
  },
  {
    id: 'sjb-opera',
    category: '🎵 音乐',
    title: '沙家浜',
    subtitle: '京剧经典唱段',
    route: '/guide/shajiabang',
    style: {
      bg: 'linear-gradient(165deg, #EDE8DF 0%, #D9D0C2 100%)',
      border: '#8A8278',
      title: '#4A4540',
      subtitle: '#8A8278',
      motif: 'note',
    },
  },
  {
    id: 'yushan-qin',
    category: '🎵 音乐',
    title: '虞山古琴',
    subtitle: '虞山琴派 · UNESCO非遗',
    route: '/guide/niehaifeng',
    style: {
      bg: 'linear-gradient(165deg, #DDE8E4 0%, #B8CCC4 100%)',
      border: '#5A7D78',
      title: '#3D5550',
      subtitle: '#6B8480',
      motif: 'note',
    },
  },
  {
    id: 'jiangnan-tune',
    category: '🎵 音乐',
    title: '江南小调',
    subtitle: '吴侬软语 · 水乡',
    route: '/guide/niehaifeng',
    style: {
      bg: 'linear-gradient(165deg, #E8E0D4 0%, #CEC4B4 100%)',
      border: '#9A8E7E',
      title: '#4A4238',
      subtitle: '#8A8278',
      motif: 'note',
    },
  },
  {
    id: 'changan-yuefu',
    category: '🎵 音乐',
    title: '长安乐府',
    subtitle: '唐诗吟唱 · 盛唐遗音',
    route: '/guide/xian',
    style: {
      bg: 'linear-gradient(165deg, #E0D0B8 0%, #C8A878 100%)',
      border: '#8A6A3A',
      title: '#4A3A1E',
      subtitle: '#7A5A2A',
      motif: 'note',
    },
  },
  {
    id: 'chuanju-music',
    category: '🎵 音乐',
    title: '川剧变脸',
    subtitle: '蜀韵川腔 · 成都',
    route: '/guide/chengdu',
    style: {
      bg: 'linear-gradient(165deg, #C8E0C8 0%, #90C490 100%)',
      border: '#4A7A4A',
      title: '#2E4A2E',
      subtitle: '#5A7A5A',
      motif: 'note',
    },
  },
  {
    id: 'jingyun-dagu',
    category: '🎵 音乐',
    title: '京韵大鼓',
    subtitle: '胡同曲艺 · 北京',
    route: '/guide/beijing',
    style: {
      bg: 'linear-gradient(165deg, #E0C8C0 0%, #C09888 100%)',
      border: '#8A4A3A',
      title: '#4A2E24',
      subtitle: '#7A4A3A',
      motif: 'note',
    },
  },
  {
    id: 'miaoge-music',
    category: '🎵 音乐',
    title: '苗族飞歌',
    subtitle: '湘西苗寨 · 凤凰',
    route: '/guide/fenghuang',
    style: {
      bg: 'linear-gradient(165deg, #C8D0D8 0%, #98A8B8 100%)',
      border: '#5A6878',
      title: '#2E3E4E',
      subtitle: '#5A6A7A',
      motif: 'note',
    },
  },
  {
    id: 'shanghai-shidaiqu',
    category: '🎵 音乐',
    title: '上海时代曲',
    subtitle: '夜上海 · 繁花金曲',
    route: '/guide/shanghai',
    style: {
      bg: 'linear-gradient(165deg, #E8D4CC 0%, #C4A898 100%)',
      border: '#8A5A4A',
      title: '#4A2E24',
      subtitle: '#7A5A4A',
      motif: 'note',
    },
  },
]

/** 首页「城市」版块入口封面（自设计的城市名封面，点击进入城市版块） */
const suzhouCityCover: HomeCover = {
  id: 'city-suzhou',
  category: '🎬 影视',
  title: '苏州',
  subtitle: '姑苏城 · 园林诗画',
  route: '/guide/suzhou',
  targetTab: '🏙️ 城市',
  eyebrow: '🏙️ 城市',
  style: {
    bg: 'linear-gradient(165deg, #E4EEEA 0%, #A7C7BC 100%)',
    border: '#4E7A6E',
    title: '#26463C',
    subtitle: '#517468',
    motif: 'city',
  },
}

/** 由封面样式提取堆叠层缩影 */
function toStackLayer(c: HomeCover) {
  return { bg: c.style.bg, border: c.style.border, image: c.image }
}

/** 首页推荐：文化载体精选。点击「开始探索」→ 切换到对应版块进行封面选择。
 *  每个类别以「多张封面堆叠」的视觉呈现（stack 为背景缩影层）。 */
export const featuredCovers: HomeCover[] = [
  {
    ...bookCovers[0],
    targetTab: '📖 书籍',
    stack: [toStackLayer(bookCovers[5]), toStackLayer(bookCovers[2])],
  },
  {
    ...suzhouCityCover,
    stack: [toStackLayer(filmCovers[4]), toStackLayer(filmCovers[3])],
  },
  {
    ...gameCovers[0],
    targetTab: '🎮 游戏',
    stack: [toStackLayer(gameCovers[1]), toStackLayer(gameCovers[3])],
  },
  {
    ...musicCovers[0],
    targetTab: '🎵 音乐',
    stack: [toStackLayer(musicCovers[4]), toStackLayer(musicCovers[5])],
  },
]

// ──────────────────────────────────────
//  🏙️ 城市 Tab
// ──────────────────────────────────────

/** 「搜一座城」入口封面（AI 生成任意城市攻略）——城市 tab 的首要入口 */
const searchHeroCover: HomeCover = {
  id: 'souyizuocheng',
  category: '🔍 搜索',
  title: '搜一座城',
  subtitle: 'AI 生成 · 任意城市攻略',
  route: '/guide/destination',
  style: {
    bg: 'linear-gradient(165deg, #FBE7CF 0%, #E89B5A 100%)',
    border: '#C2410C',
    title: '#7C2D12',
    subtitle: '#9A3412',
    motif: 'search',
  },
}

const cityCovers: HomeCover[] = [
  searchHeroCover,
  { id: 'city-changshu', category: '🏙️ 城市', title: '常熟', subtitle: '虞山琴派 · 江南名城', route: '/guide/niehaifeng', style: { bg: 'linear-gradient(165deg, #DDE8E4 0%, #B8CCC4 100%)', border: '#5A7D78', title: '#3D5550', subtitle: '#6B8480', motif: 'city' } },
  { id: 'city-hangzhou', category: '🏙️ 城市', title: '杭州', subtitle: '钱塘湖 · 西湖烟雨', route: '/guide/hangzhou', style: { bg: 'linear-gradient(165deg, #C8E0D4 0%, #90C4A8 100%)', border: '#4A7A5A', title: '#2E4A38', subtitle: '#5A7A5A', motif: 'city' } },
  { id: 'city-beijing', category: '🏙️ 城市', title: '北京', subtitle: '帝都 · 胡同秋意', route: '/guide/beijing', style: { bg: 'linear-gradient(165deg, #E0C8C0 0%, #C09888 100%)', border: '#8A4A3A', title: '#4A2E24', subtitle: '#7A4A3A', motif: 'city' } },
  { id: 'city-shanghai', category: '🏙️ 城市', title: '上海', subtitle: '繁花 · 弄堂外滩', route: '/guide/shanghai', style: { bg: 'linear-gradient(165deg, #E8D4CC 0%, #C4A898 100%)', border: '#8A5A4A', title: '#4A2E24', subtitle: '#7A5A4A', motif: 'city' } },
  { id: 'city-chengdu', category: '🏙️ 城市', title: '成都', subtitle: '草堂 · 锦里烟火', route: '/guide/chengdu', style: { bg: 'linear-gradient(165deg, #C8E0C8 0%, #90C490 100%)', border: '#4A7A4A', title: '#2E4A2E', subtitle: '#5A7A5A', motif: 'city' } },
  { id: 'city-xian', category: '🏙️ 城市', title: '西安', subtitle: '长安 · 盛唐遗韵', route: '/guide/xian', style: { bg: 'linear-gradient(165deg, #E0D0B8 0%, #C8A878 100%)', border: '#8A6A3A', title: '#4A3A1E', subtitle: '#7A5A2A', motif: 'city' } },
  { id: 'city-yangzhou', category: '🏙️ 城市', title: '扬州', subtitle: '淮左名都 · 二分明月', route: '/guide/yangzhou', style: { bg: 'linear-gradient(165deg, #D4E8E0 0%, #B8D4C8 100%)', border: '#5A7D78', title: '#3D5550', subtitle: '#6B8480', motif: 'city' } },
  { id: 'city-fenghuang', category: '🏙️ 城市', title: '凤凰', subtitle: '边城 · 沱江吊脚楼', route: '/guide/fenghuang', style: { bg: 'linear-gradient(165deg, #C8D0D8 0%, #98A8B8 100%)', border: '#5A6878', title: '#2E3E4E', subtitle: '#5A6A7A', motif: 'city' } },
  { id: 'city-zhangjiajie', category: '🏙️ 城市', title: '张家界', subtitle: '奇峰 · 原神取景', route: '/guide/zhangjiajie', style: { bg: 'linear-gradient(165deg, #D4E8D4 0%, #A8C8A8 100%)', border: '#5A7A5A', title: '#3A4A3A', subtitle: '#6A8A6A', motif: 'city' } },
]

export function getCoversForTab(tab: HomeTab): HomeCover[] {
  switch (tab) {
    case '📖 书籍': return bookCovers
    case '🏙️ 城市': return cityCovers
    default: return featuredCovers
  }
}

/** 待开发的 Tab：中部显示占位提示，不展示封面 */
export const underDevelopmentTabs: HomeTab[] = ['🎮 游戏', '🎵 音乐']

export const homeTabs: HomeTab[] = ['首页', '📖 书籍', '🏙️ 城市', '🎮 游戏', '🎵 音乐']
