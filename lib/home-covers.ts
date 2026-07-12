export type HomeTab = '首页' | '城市' | '书籍' | '音乐' | '游戏'
export type CoverCategory = '城市' | '书籍' | '音乐' | '游戏'

export interface CoverStyle {
  bg: string
  border: string
  title: string
  subtitle: string
  motif: 'book' | 'note' | 'game' | 'landscape' | 'city'
}

export interface HomeCover {
  id: string
  category: CoverCategory
  title: string
  subtitle: string
  route: string
  style: CoverStyle
}

const cityCovers: HomeCover[] = [
  {
    id: 'yangzhou',
    category: '城市',
    title: '扬州',
    subtitle: '烟花三月 · 淮左名都',
    route: '/guide/yangzhou/books',
    style: {
      bg: 'linear-gradient(165deg, #D4E8E0 0%, #9BBFB2 100%)',
      border: '#4A7A6E',
      title: '#2E4A42',
      subtitle: '#5A7A70',
      motif: 'city',
    },
  },
  {
    id: 'nanjing',
    category: '城市',
    title: '南京',
    subtitle: '桨声灯影 · 六朝金陵',
    route: '/guide/nanjing/books',
    style: {
      bg: 'linear-gradient(165deg, #E0DDD6 0%, #B8B0A4 100%)',
      border: '#6B6560',
      title: '#3D3832',
      subtitle: '#8A8278',
      motif: 'city',
    },
  },
  {
    id: 'suzhou',
    category: '城市',
    title: '苏州',
    subtitle: '姑苏浮生 · 园林水巷',
    route: '/guide/suzhou/books',
    style: {
      bg: 'linear-gradient(165deg, #D8E4E2 0%, #A8BFB8 100%)',
      border: '#5A7D78',
      title: '#3D5550',
      subtitle: '#6B8480',
      motif: 'landscape',
    },
  },
  {
    id: 'wuxi',
    category: '城市',
    title: '无锡',
    subtitle: '太湖鼋头 · 樱花小笼',
    route: '/guide/wuxi/books',
    style: {
      bg: 'linear-gradient(165deg, #DDE8F0 0%, #A8C4D8 100%)',
      border: '#5A7A8A',
      title: '#2E4A58',
      subtitle: '#5A7A88',
      motif: 'landscape',
    },
  },
  {
    id: 'zhenjiang',
    category: '城市',
    title: '镇江',
    subtitle: '三山镇江 · 锅盖面',
    route: '/guide/zhenjiang/books',
    style: {
      bg: 'linear-gradient(165deg, #EDE4D8 0%, #C9BAA8 100%)',
      border: '#8A7B6A',
      title: '#4A4238',
      subtitle: '#7A7064',
      motif: 'city',
    },
  },
]

const bookCovers: HomeCover[] = [
  {
    id: 'renjianziwei',
    category: '书籍',
    title: '人间滋味',
    subtitle: '汪曾祺 · 高邮烟火',
    route: '/guide/renjianziwei',
    style: {
      bg: 'linear-gradient(165deg, #FDF8F2 0%, #E8D8CC 100%)',
      border: '#8B4545',
      title: '#6B3333',
      subtitle: '#8A6A5A',
      motif: 'book',
    },
  },
  {
    id: 'niehaifeng',
    category: '书籍',
    title: '孽海花',
    subtitle: '晚清文人 · 曾朴',
    route: '/guide/niehaifeng',
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
    style: {
      bg: 'linear-gradient(165deg, #DDE5DC 0%, #B5C4B0 100%)',
      border: '#5C7260',
      title: '#3A4A3C',
      subtitle: '#6A7A6C',
      motif: 'landscape',
    },
  },
]

const musicCovers: HomeCover[] = [
  {
    id: 'yangzhou-song',
    category: '音乐',
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
    category: '音乐',
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
    category: '音乐',
    title: '虞山古琴',
    subtitle: '琴韵虞山 · 翁同龢',
    route: '/guide/wengtonghe',
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
    category: '音乐',
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
]

const gameCovers: HomeCover[] = [
  {
    id: 'yangzhou-poem',
    category: '游戏',
    title: '诗词诵读',
    subtitle: '烟花三月 · 朗读挑战',
    route: '/guide/yangzhou',
    style: {
      bg: 'linear-gradient(165deg, #D4E8E0 0%, #9BBFB2 100%)',
      border: '#4A7A6E',
      title: '#2E4A42',
      subtitle: '#5A7A70',
      motif: 'game',
    },
  },
  {
    id: 'poem-challenge',
    category: '游戏',
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
    category: '游戏',
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
  {
    id: 'calligraphy',
    category: '游戏',
    title: '书法临摹',
    subtitle: '帝师笔意 · 虞山风骨',
    route: '/guide/wengtonghe',
    style: {
      bg: 'linear-gradient(165deg, #E8E4DC 0%, #C9C2B4 100%)',
      border: '#7A7368',
      title: '#454038',
      subtitle: '#7A7368',
      motif: 'game',
    },
  },
]

/** 首页推荐：城市展示优先 */
export const featuredCovers: HomeCover[] = [
  cityCovers[0],
  bookCovers[0],
  cityCovers[1],
  musicCovers[0],
]

export function getCoversForTab(tab: HomeTab): HomeCover[] {
  switch (tab) {
    case '城市': return cityCovers
    case '书籍': return bookCovers
    case '音乐': return musicCovers
    case '游戏': return gameCovers
    default: return featuredCovers
  }
}

export const homeTabs: HomeTab[] = ['首页', '城市', '书籍', '音乐', '游戏']

const comingSoonTabs = new Set<HomeTab>(['音乐', '游戏'])

export function isComingSoonTab(tab: HomeTab): boolean {
  return comingSoonTabs.has(tab)
}
