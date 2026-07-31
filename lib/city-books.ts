import { CoverStyle } from './home-covers'

export interface CityBookEntry {
  id: string
  /** 点击后进入的攻略 id（无 checkinSlug 时使用） */
  guideId: string
  /** 可打卡路线 slug；有则优先进 /route */
  checkinSlug?: string
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
        checkinSlug: 'yangzhou-man-jiangkui',
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
        checkinSlug: 'yangzhou-wangzengqi-zaocha',
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
      {
        id: 'yangzhou-shouxihu',
        guideId: 'yangzhou',
        checkinSlug: 'yangzhou-shouxihu-dumu',
        title: '瘦西湖诗画',
        author: '杜牧',
        intro: '二十四桥明月夜——可打卡的瘦西湖诗词线。',
        style: bookStyle(
          'linear-gradient(165deg, #E0E8E4 0%, #B0C8BC 100%)',
          '#5A7A6E',
          '#2E4A42',
          '#5A7A70'
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
        checkinSlug: 'nanjing-qinhuaihe-zhuziqing',
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
        id: 'nanjing-fuzimiao',
        guideId: 'nanjing',
        checkinSlug: 'nanjing-fuzimiao-shishuoxinyu',
        title: '世说新语 · 建康',
        author: '刘义庆',
        intro: '六朝烟水，夫子庙一带可对读的人物行旅。',
        style: bookStyle(
          'linear-gradient(165deg, #E4E0D8 0%, #C0B8A8 100%)',
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
        checkinSlug: 'suzhou-pingjiang-fushengliuji',
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
        id: 'suzhou-hanshan',
        guideId: 'suzhou',
        checkinSlug: 'suzhou-hanshansi-fengqiao',
        title: '枫桥夜泊',
        author: '张继',
        intro: '寒山寺钟声，可打卡的夜泊诗路线。',
        style: bookStyle(
          'linear-gradient(165deg, #D0DCE0 0%, #A0B8C0 100%)',
          '#5A7078',
          '#2E4048',
          '#5A7078'
        ),
      },
      {
        id: 'suzhou-zhuozheng',
        guideId: 'suzhou',
        checkinSlug: 'suzhou-zhuozhengyuan-wenzhengming',
        title: '拙政园',
        author: '文徵明',
        intro: '园林诗画对照的可打卡线。',
        style: bookStyle(
          'linear-gradient(165deg, #D8E8D8 0%, #A8C8A8 100%)',
          '#5A7A5A',
          '#2E4A2E',
          '#5A7A5A'
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
  fenghuang: {
    citySlug: 'fenghuang',
    cityName: '凤凰',
    province: '湖南',
    tagline: '边城凤凰 · 沈从文',
    intro:
      '「由四川过湖南去……有一小溪，溪边有座白色小塔。」沈从文《边城》开篇写的就是这片湘西土地。沱江、吊脚楼、跳岩——选一本书，走进边城。',
    books: [
      {
        id: 'fenghuang-biancheng',
        guideId: 'fenghuang',
        checkinSlug: 'fenghuang-shencongwen-biancheng',
        title: '边城',
        author: '沈从文',
        intro: '翠翠与白塔、渡船与黄狗，湘西最纯美的故事。沱江泛舟、跳岩、虹桥——跟着《边城》走进凤凰。',
        style: bookStyle(
          'linear-gradient(165deg, #C8D0D8 0%, #98A8B8 100%)',
          '#5A6878',
          '#2E3E4E',
          '#5A6A7A'
        ),
      },
    ],
  },
  shanghai: {
    citySlug: 'shanghai',
    cityName: '上海',
    province: '上海',
    tagline: '繁花上海 · 不响',
    intro:
      '「做生意要先学会两个字，不响。」金宇澄《繁花》写尽上海人的精明与深情，张爱玲在常德公寓写下《倾城之恋》，鲁迅在山阴路度过最后的岁月。选一本书，走进上海。',
    books: [
      {
        id: 'shanghai-fanhua',
        guideId: 'shanghai',
        title: '繁花',
        author: '金宇澄 · 王家卫',
        intro: '黄河路、进贤路、和平饭店——跟着《繁花》走进90年代的上海繁华。',
        style: bookStyle(
          'linear-gradient(165deg, #E8D4CC 0%, #C4A898 100%)',
          '#8A5A4A',
          '#4A2E24',
          '#7A5A4A'
        ),
      },
      {
        id: 'shanghai-eileen',
        guideId: 'shanghai',
        title: '倾城之恋',
        author: '张爱玲',
        intro: '常德公寓里写出的传世之作，上海弄堂里的爱情与苍凉。',
        style: bookStyle(
          'linear-gradient(165deg, #E8D8E0 0%, #C8B0C0 100%)',
          '#7A5A6A',
          '#4A2E3A',
          '#7A5A6A'
        ),
      },
      {
        id: 'shanghai-luxun',
        guideId: 'shanghai',
        title: '野草',
        author: '鲁迅',
        intro: '虹口山阴路"老虎尾巴"书房诞生的经典，上海最后的鲁迅足迹。',
        style: bookStyle(
          'linear-gradient(165deg, #D8D4CC 0%, #B8B0A4 100%)',
          '#6B6560',
          '#3D3832',
          '#8A8278'
        ),
      },
    ],
  },
  hangzhou: {
    citySlug: 'hangzhou',
    cityName: '杭州',
    province: '浙江',
    tagline: '诗画杭州 · 西湖',
    intro:
      '「未能抛得杭州去，一半勾留是此湖。」白居易、苏轼、郁达夫，千年文人在西湖边写下了最美的诗句。选一本书，走进杭州。',
    books: [
      {
        id: 'hangzhou-baijuyi',
        guideId: 'hangzhou',
        checkinSlug: 'hangzhou-baidi-baijiuyi',
        title: '钱塘湖春行',
        author: '白居易 · 苏轼',
        intro: '白堤、苏堤、灵隐寺——跟着唐诗宋词漫步西湖。',
        style: bookStyle(
          'linear-gradient(165deg, #C8E0D4 0%, #90C4A8 100%)',
          '#4A7A5A',
          '#2E4A38',
          '#5A7A5A'
        ),
      },
      {
        id: 'hangzhou-sudi',
        guideId: 'hangzhou',
        checkinSlug: 'hangzhou-sudi-sushi',
        title: '苏堤春晓',
        author: '苏轼',
        intro: '可打卡的苏堤西湖线。',
        style: bookStyle(
          'linear-gradient(165deg, #D0E4D8 0%, #98C4A8 100%)',
          '#4A7A5A',
          '#2E4A38',
          '#5A7A5A'
        ),
      },
      {
        id: 'hangzhou-chiguihua',
        guideId: 'hangzhou',
        title: '迟桂花',
        author: '郁达夫',
        intro: '翁家山的桂花比满觉陇晚开十几天，郁达夫在此写下"迟"与"慢"的诗意。',
        style: bookStyle(
          'linear-gradient(165deg, #E8DCC8 0%, #C8B898 100%)',
          '#8A7A5A',
          '#4A4228',
          '#7A6A4A'
        ),
      },
    ],
  },
  beijing: {
    citySlug: 'beijing',
    cityName: '北京',
    province: '北京',
    tagline: '北平之秋 · 胡同深处',
    intro:
      '「北平之秋便是天堂。」老舍笔下的北京，有丹柿小院的柿子树，有地坛银杏大道的长椅。选一本书，读一座城的精神史。',
    books: [
      {
        id: 'beijing-sishitongtang',
        guideId: 'beijing',
        checkinSlug: 'beijing-laoshe-chaguan',
        title: '四世同堂 · 茶馆',
        author: '老舍',
        intro: '茶馆与胡同——可打卡的老舍北京线；小杨家胡同、白塔寺亦可对照阅读。',
        style: bookStyle(
          'linear-gradient(165deg, #E0C8C0 0%, #C09888 100%)',
          '#8A4A3A',
          '#4A2E24',
          '#7A4A3A'
        ),
      },
      {
        id: 'beijing-ditan',
        guideId: 'beijing',
        title: '我与地坛',
        author: '史铁生',
        intro: '地坛银杏大道的长椅，史铁生"常坐的那棵柏树"旁——文学圣殿。',
        style: bookStyle(
          'linear-gradient(165deg, #D8D4C0 0%, #B8B498 100%)',
          '#7A7658',
          '#4A4638',
          '#7A7658'
        ),
      },
    ],
  },
  chengdu: {
    citySlug: 'chengdu',
    cityName: '成都',
    province: '四川',
    tagline: '诗圣故里 · 巴适安逸',
    intro:
      '「安得广厦千万间，大庇天下寒士俱欢颜。」杜甫在草堂写下千古名句，巴金在《家》中写尽成都。选一本书，感受成都的慢与诗。',
    books: [
      {
        id: 'chengdu-dufu',
        guideId: 'chengdu',
        title: '茅屋为秋风所破歌',
        author: '杜甫',
        intro: '草堂、浣花溪、武侯祠——诗圣在成都留下的千古足迹。',
        style: bookStyle(
          'linear-gradient(165deg, #C8E0C8 0%, #90C490 100%)',
          '#4A7A4A',
          '#2E4A2E',
          '#5A7A5A'
        ),
      },
      {
        id: 'chengdu-bajin',
        guideId: 'chengdu',
        title: '家',
        author: '巴金',
        intro: '慧园还原高家大院格局，觉慧的呐喊——读懂巴金笔下成都的旧与新。',
        style: bookStyle(
          'linear-gradient(165deg, #D8E8D4 0%, #A8C8A0 100%)',
          '#5A7A5A',
          '#3A4A38',
          '#6A8A68'
        ),
      },
    ],
  },
  xian: {
    citySlug: 'xian',
    cityName: '西安',
    province: '陕西',
    tagline: '盛唐长安 · 千年帝都',
    intro:
      '「春风得意马蹄疾，一日看尽长安花。」李白、杜甫、白居易，唐诗里的长安气象万千。贾平凹写当代西安的厚重与苍凉。选一本书，梦回千年帝都。',
    books: [
      {
        id: 'xian-tangshi',
        guideId: 'xian',
        title: '唐诗三百首',
        author: '李白 · 杜甫 · 白居易',
        intro: '大雁塔、城墙、华清宫——唐诗里的长安，脚下都能走到。',
        style: bookStyle(
          'linear-gradient(165deg, #E0D0B8 0%, #C8A878 100%)',
          '#8A6A3A',
          '#4A3A1E',
          '#7A5A2A'
        ),
      },
      {
        id: 'xian-jiapingwa',
        guideId: 'xian',
        title: '废都',
        author: '贾平凹',
        intro: '贾平凹文化艺术馆、棣花古镇——当代文学与古都的对话。',
        style: bookStyle(
          'linear-gradient(165deg, #D8CCC0 0%, #B8A898 100%)',
          '#7A6A5A',
          '#4A3A28',
          '#7A6A58'
        ),
      },
    ],
  },
  shaoxing: {
    citySlug: 'shaoxing',
    cityName: '绍兴',
    province: '浙江',
    tagline: '鲁迅故里 · 沈园遗恨',
    intro:
      '百草园、三味书屋、咸亨酒店，鲁迅把童年写进了中国人的共同记忆；沈园一壁《钗头凤》，陆游与唐琬的故事仍在园中。',
    books: [
      {
        id: 'shaoxing-luxun',
        guideId: 'shaoxing',
        checkinSlug: 'shaoxing-luxun-baicaoyuan',
        title: '从百草园到三味书屋',
        author: '鲁迅',
        intro: '5 个点位可打卡：百草园、三味书屋、咸亨酒店……',
        style: bookStyle(
          'linear-gradient(165deg, #E8E0D0 0%, #C8B898 100%)',
          '#7A6A48',
          '#4A3E28',
          '#7A6A50'
        ),
      },
      {
        id: 'shaoxing-luyou',
        guideId: 'shaoxing',
        checkinSlug: 'shaoxing-luyou-shenyuan',
        title: '钗头凤 · 沈园',
        author: '陆游',
        intro: '园内走完相遇与凭吊：钗头凤壁、伤心桥、孤鹤亭。',
        style: bookStyle(
          'linear-gradient(165deg, #E8DCE0 0%, #C8B0B8 100%)',
          '#7A5A68',
          '#4A2E3A',
          '#7A5A68'
        ),
      },
    ],
  },
  harbin: {
    citySlug: 'harbin',
    cityName: '哈尔滨',
    province: '黑龙江',
    tagline: '呼兰河传 · 萧红',
    intro: '从呼兰故居的后花园，走到呼兰河畔，再望向中央大街——把《呼兰河传》走成可打卡的北国路线。',
    books: [
      {
        id: 'harbin-xiaohong',
        guideId: 'harbin',
        checkinSlug: 'harbin-xiaohong-hulanhe',
        title: '呼兰河传',
        author: '萧红',
        intro: '萧红故居、后花园、呼兰河——童年小城的现场对读。',
        style: bookStyle(
          'linear-gradient(165deg, #D0DCE8 0%, #A0B8D0 100%)',
          '#4A6A8A',
          '#2E4458',
          '#5A7088'
        ),
      },
    ],
  },
  jinan: {
    citySlug: 'jinan',
    cityName: '济南',
    province: '山东',
    tagline: '泉城冬天 · 老舍',
    intro: '趵突泉翻滚、大明湖秋色——跟着老舍把济南的冬天与泉水走一遍。',
    books: [
      {
        id: 'jinan-laoshe',
        guideId: 'jinan',
        checkinSlug: 'jinan-laoshe-baotuquan',
        title: '济南的冬天',
        author: '老舍',
        intro: '趵突泉、大明湖等泉城点位可打卡。',
        style: bookStyle(
          'linear-gradient(165deg, #D8E4F0 0%, #A8C0D8 100%)',
          '#5A7A98',
          '#2E4860',
          '#5A7890'
        ),
      },
    ],
  },
  wuzhen: {
    citySlug: 'wuzhen',
    cityName: '乌镇',
    province: '浙江',
    tagline: '林家铺子 · 茅盾',
    intro: '茅盾故居与水乡市镇——《林家铺子》的现场对照（版权待核）。',
    books: [
      {
        id: 'wuzhen-maodun',
        guideId: 'wuzhen',
        checkinSlug: 'wuzhen-maodun-linjiapuzi',
        title: '林家铺子',
        author: '茅盾',
        intro: '故居、铺面印象、水乡市镇——5 点可打卡。',
        style: bookStyle(
          'linear-gradient(165deg, #E0D8D0 0%, #C0B0A0 100%)',
          '#7A6A58',
          '#4A3A2E',
          '#7A6A58'
        ),
      },
    ],
  },
  changshu: {
    citySlug: 'changshu',
    cityName: '常熟',
    province: '江苏',
    tagline: '沙家浜 · 芦苇荡',
    intro: '跟着京剧《沙家浜》走常熟芦苇荡——可交付文旅局的可打卡文学线。',
    books: [
      {
        id: 'changshu-shajiabang',
        guideId: 'shajiabang',
        checkinSlug: 'changshu-shajiabang-jingju',
        title: '沙家浜',
        author: '京剧经典',
        intro: '芦苇荡现场打卡线。',
        style: bookStyle(
          'linear-gradient(165deg, #DDE5DC 0%, #B5C4B0 100%)',
          '#5C7260',
          '#3A4A3C',
          '#6A7A6C'
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
