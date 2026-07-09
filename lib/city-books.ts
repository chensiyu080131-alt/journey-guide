import { CoverStyle } from './home-covers'

export interface CityBookEntry {
  id: string
  /** 点击后进入的攻略 id */
  guideId: string
  title: string
  author: string
  intro: string
  style: CoverStyle
}

export interface CityBooksMeta {
  citySlug: string
  cityName: string
  province: string
  tagline: string
  intro: string
  books: CityBookEntry[]
}

const bookStyle = (
  bg: string,
  border: string,
  title: string,
  subtitle: string
): CoverStyle => ({
  bg,
  border,
  title,
  subtitle,
  motif: 'book',
})

/** 城市 → 相关书籍（中间页数据） */
export const cityBooksMap: Record<string, CityBooksMeta> = {
  yangzhou: {
    citySlug: 'yangzhou',
    cityName: '扬州',
    province: '江苏',
    tagline: '淮左名都 · 烟花三月',
    intro:
      '「烟花三月下扬州」——李白让扬州成为中国最诗意的城市。姜夔《扬州慢》、汪曾祺笔下的高邮食事，都与这片淮扬大地相连。选一本书，跟着文字走进扬州。',
    books: [
      {
        id: 'yangzhou-man',
        guideId: 'yangzhou',
        title: '扬州慢',
        author: '姜夔 · 李白',
        intro: '二十四桥仍在，波心荡，冷月无声。跟着诗词游瘦西湖、个园与东关街。',
        style: bookStyle(
          'linear-gradient(165deg, #D4E8E0 0%, #9BBFB2 100%)',
          '#4A7A6E',
          '#2E4A42',
          '#5A7A70'
        ),
      },
      {
        id: 'renjianziwei-gy',
        guideId: 'renjianziwei',
        title: '人间滋味',
        author: '汪曾祺',
        intro: '高邮咸鸭蛋、界首茶干、运河畔烟火——汪曾祺故乡就在扬州城北。',
        style: bookStyle(
          'linear-gradient(165deg, #FDF8F2 0%, #E8D8CC 100%)',
          '#8B4545',
          '#6B3333',
          '#8A6A5A'
        ),
      },
    ],
  },
  nanjing: {
    citySlug: 'nanjing',
    cityName: '南京',
    province: '江苏',
    tagline: '六朝金陵 · 桨声灯影',
    intro:
      '朱自清《桨声灯影里的秦淮河》写尽了夫子庙的夜色。金陵城有六朝的烟水，也有鸭血粉丝与鸡鸣寺樱花。选一本书，开始你的南京之旅。',
    books: [
      {
        id: 'nanjing-qinhuai',
        guideId: 'nanjing',
        title: '桨声灯影里的秦淮河',
        author: '朱自清',
        intro: '秦淮河、夫子庙、老门东——跟着散文夜游六朝金陵。',
        style: bookStyle(
          'linear-gradient(165deg, #E0DDD6 0%, #B8B0A4 100%)',
          '#6B6560',
          '#3D3832',
          '#8A8278'
        ),
      },
      {
        id: 'niehaifeng-nj',
        guideId: 'niehaifeng',
        title: '孽海花',
        author: '曾朴',
        intro: '晚清文人浮世绘，曾朴笔下有金陵风月与江南士风。（路线含常熟·南京关联）',
        style: bookStyle(
          'linear-gradient(165deg, #D8E4E2 0%, #A8BFB8 100%)',
          '#5A7D78',
          '#3D5550',
          '#6B8480'
        ),
      },
    ],
  },
  suzhou: {
    citySlug: 'suzhou',
    cityName: '苏州',
    province: '江苏',
    tagline: '姑苏城外 · 园林水巷',
    intro:
      '「姑苏城外寒山寺，夜半钟声到客船。」沈复《浮生六记》写尽姑苏日常。拙政园、平江路、虎丘——选一本书，走进苏州。',
    books: [
      {
        id: 'suzhou-fusheng',
        guideId: 'suzhou',
        title: '浮生六记',
        author: '沈复 · 张继',
        intro: '园林、水巷、寒山寺——江南生活的细腻与诗意。',
        style: bookStyle(
          'linear-gradient(165deg, #D8E4E2 0%, #A8BFB8 100%)',
          '#5A7D78',
          '#3D5550',
          '#6B8480'
        ),
      },
      {
        id: 'qianliu-sz',
        guideId: 'qianliu',
        title: '柳如是别传',
        author: '陈寅恪',
        intro: '钱柳情缘与江南文脉，常熟虞山与苏州水巷相隔不远。',
        style: bookStyle(
          'linear-gradient(165deg, #EDE4D8 0%, #D4C8B8 100%)',
          '#8A7B6A',
          '#4A4238',
          '#7A7064'
        ),
      },
    ],
  },
  wuxi: {
    citySlug: 'wuxi',
    cityName: '无锡',
    province: '江苏',
    tagline: '太湖佳绝 · 鼋头渚',
    intro:
      '「太湖佳绝处，毕竟在鼋头」。无锡有樱花、小笼与惠山泥人。选一本书，感受江南另一种温润。',
    books: [
      {
        id: 'wuxi-taihu',
        guideId: 'wuxi',
        title: '太湖志',
        author: '郭沫若',
        intro: '鼋头渚、惠山古镇、南长街——太湖边的城市漫步。',
        style: bookStyle(
          'linear-gradient(165deg, #DDE8F0 0%, #A8C4D8 100%)',
          '#5A7A8A',
          '#2E4A58',
          '#5A7A88'
        ),
      },
    ],
  },
  zhenjiang: {
    citySlug: 'zhenjiang',
    cityName: '镇江',
    province: '江苏',
    tagline: '三山镇江 · 长江风',
    intro:
      '金山焦山、西津渡，再加一碗锅盖面。王安石写「京口瓜洲一水间」，镇江与扬州隔江相望。选一本书，开始探索。',
    books: [
      {
        id: 'zhenjiang-baishe',
        guideId: 'zhenjiang',
        title: '白蛇传',
        author: '民间传说 · 王安石',
        intro: '金山寺、焦山、西津渡——传奇与长江风物。',
        style: bookStyle(
          'linear-gradient(165deg, #EDE4D8 0%, #C9BAA8 100%)',
          '#8A7B6A',
          '#4A4238',
          '#7A7064'
        ),
      },
    ],
  },
}

export const CITY_BOOK_SLUGS = Object.keys(cityBooksMap)

export function getCityBooks(citySlug: string): CityBooksMeta | null {
  return cityBooksMap[citySlug] ?? null
}

export function isCityBookHub(citySlug: string): boolean {
  return citySlug in cityBooksMap
}
