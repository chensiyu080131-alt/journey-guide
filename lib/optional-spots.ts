import { BudgetLevel, Guide, InterestTag, OptionalRecommendSpot } from '@/types'
import { PlanAspect } from './guide-category'

// ============================================================
//  常熟非遗池（沙家浜 / 孽海花 / 翁同龢 / 柳如是 四本书共享）
//  依据：常熟市文旅局 + 中国非遗网公开名录
// ============================================================
const changshuHeritage: OptionalRecommendSpot[] = [
  {
    id: 'cs-guqin',
    name: '虞山派古琴雅集',
    emoji: '🎼',
    desc: '中国古琴艺术三大流派之一，虞山琴派「清微淡远」',
    duration: '1小时',
    category: '非遗文化',
    heritage: '古琴艺术·虞山琴派 · 联合国人类非遗 / 国家级',
    location: { lat: 31.6490, lng: 120.7320 },
    address: '常熟市虞山脚下·古琴艺术馆',
    story: '虞山琴派由明代常熟人严澂创立，以「清、微、淡、远」为宗，是古琴艺术的重要流派。虞山脚下的古琴馆常有雅集，可近距离听一曲《平沙落雁》。',
    tags: ['文化', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '雅集体验约80元',
  },
  {
    id: 'cs-baimao',
    name: '白茆山歌馆',
    emoji: '🎶',
    desc: '吴歌代表，田间地头唱了千年的江南民歌',
    duration: '45分钟',
    category: '民俗体验',
    heritage: '吴歌·白茆山歌 · 国家级非物质文化遗产',
    location: { lat: 31.7280, lng: 120.8600 },
    address: '常熟市古里镇白茆山歌馆',
    story: '白茆山歌是吴歌的重要分支，源于稻作劳动时的即兴对唱，题材从爱情到农事无所不包，2006年入选首批国家级非遗。山歌馆有定期展演。',
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '免费展演',
  },
  {
    id: 'cs-lace',
    name: '常熟花边制作技艺',
    emoji: '🧵',
    desc: '「常熟花边」雕绣抽纱，一针一线的江南巧手',
    duration: '1小时',
    category: '非遗文化',
    heritage: '常熟花边制作技艺 · 省级非物质文化遗产',
    location: { lat: 31.6540, lng: 120.7530 },
    address: '常熟市区·花边艺术馆',
    story: '常熟花边（雕绣）以抽纱、镂空、刺绣结合，图案清雅，曾远销海外。可在艺术馆体验一小块手帕的雕绣工序，感受「针尖上的常熟」。',
    tags: ['文化', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '手作体验约60元',
  },
  {
    id: 'cs-seal',
    name: '虞山派篆刻·拓印',
    emoji: '🔖',
    desc: '虞山印派金石之艺，亲手拓一方印',
    duration: '45分钟',
    category: '非遗文化',
    heritage: '虞山派篆刻艺术 · 省级非物质文化遗产',
    location: { lat: 31.6510, lng: 120.7350 },
    address: '常熟市虞山印社',
    story: '虞山印派由明清常熟印人开创，讲究刀法古雅、章法自然，与虞山画派、琴派并为「虞山文脉」。可体验拓印与钤印。',
    tags: ['文化', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '拓印体验约40元',
  },
  {
    id: 'cs-baojuan',
    name: '常熟宝卷·宣卷',
    emoji: '📿',
    desc: '茶馆里的说唱古艺，一人一桌讲善劝世',
    duration: '1小时',
    category: '民俗体验',
    heritage: '常熟宝卷 · 省级非物质文化遗产',
    location: { lat: 31.6520, lng: 120.7500 },
    address: '常熟市老茶馆',
    story: '宣卷是流行于常熟乡间的说唱曲艺，艺人「宣」讲宝卷故事，听众「和」佛号，是江南水乡独特的民俗记忆。老茶馆偶有宣卷场。',
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '茶馆宣卷·免费（茶资自付）',
  },
  {
    id: 'cs-tea',
    name: '虞山绿茶采制体验',
    emoji: '🍵',
    desc: '虞山「剑门」绿茶，清明前后上山采一篓',
    duration: '2小时',
    category: '非遗文化',
    heritage: '虞山绿茶制作技艺 · 市级非物质文化遗产',
    location: { lat: 31.6420, lng: 120.7220 },
    address: '常熟市虞山茶场',
    story: '虞山绿茶以「剑门」牌最著名，条索紧结、香高味醇。清明前后可上山体验采茶、杀青、揉捻、炒制全过程，一杯明前茶的来处尽在指间。',
    tags: ['美食', '自然', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '采茶炒茶约50元（清明前后）',
  },
  {
    id: 'cs-chicken',
    name: '王四酒家叫化鸡技艺',
    emoji: '🍗',
    desc: '百年老店，看整鸡如何裹黄泥入火煨制',
    duration: '1小时',
    category: '非遗文化',
    heritage: '常熟叫化鸡制作技艺 · 王四酒家（中华老字号）',
    location: { lat: 31.6530, lng: 120.7410 },
    address: '常熟市虞山脚下·王四酒家',
    story: '常熟叫化鸡以荷叶、黄泥裹鸡煨烤，掰壳时香气扑鼻。王四酒家为百年老店，可参观其制作技艺并现尝。',
    tags: ['美食', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '整鸡约80元',
  },
]

// ============================================================
//  高邮非遗池（人间滋味 · 汪曾祺）
// ============================================================
const gaoyouHeritage: OptionalRecommendSpot[] = [
  {
    id: 'gy-folksong',
    name: '高邮民歌展演',
    emoji: '🎶',
    desc: '《数鸭蛋》唱响运河畔，触景生情的即兴民歌',
    duration: '45分钟',
    category: '民俗体验',
    heritage: '高邮民歌 · 国家级非物质文化遗产',
    location: { lat: 32.7850, lng: 119.4430 },
    address: '高邮市运河·盂城驿街区',
    story: '高邮民歌多为群众触景生情的即兴之作，《数鸭蛋》《高邮西北乡》等曲调独特。盂城驿街区常有展演，运河边听一曲最应景。',
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '免费展演',
  },
  {
    id: 'gy-egg',
    name: '高邮咸鸭蛋腌制技艺',
    emoji: '🥚',
    desc: '「滚泥滚灰」腌双黄，筷子一扎红油冒',
    duration: '1小时',
    category: '非遗文化',
    heritage: '高邮咸鸭蛋制作技艺 · 省级非物质文化遗产',
    location: { lat: 32.7900, lng: 119.4460 },
    address: '高邮市·双黄鸭蛋原产地',
    story: '高邮咸鸭蛋以「滚泥」「滚灰」传统工艺腌制，讲究按季节气温精准配料。汪曾祺在《端午的鸭蛋》里写：「筷子头一扎下去，吱——红油就冒出来了。」可体验滚泥腌蛋。',
    tags: ['美食', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '腌制体验约40元',
  },
  {
    id: 'gy-chagan',
    name: '界首茶干制作技艺',
    emoji: '🟤',
    desc: '运河驿站的茶干，汪曾祺《茶干》里的乡味',
    duration: '45分钟',
    category: '非遗文化',
    heritage: '界首茶干制作技艺 · 省级非物质文化遗产',
    location: { lat: 32.8950, lng: 119.4200 },
    address: '高邮市界首镇',
    story: '界首茶干色泽酱红、咸香有嚼劲，是运河古镇界首的名产。汪曾祺专门写过《茶干》一文，可在界首镇看点卤压制、现尝一块。',
    tags: ['美食', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '品尝约20元',
  },
  {
    id: 'gy-dongtang',
    name: '秦邮董糖制作技艺',
    emoji: '🍬',
    desc: '芝麻绵白糖层层裹，高邮传统茶点',
    duration: '30分钟',
    category: '非遗文化',
    heritage: '秦邮董糖制作技艺 · 省级非物质文化遗产',
    location: { lat: 32.7880, lng: 119.4470 },
    address: '高邮市·老字号茶食店',
    story: '秦邮董糖以芝麻、绵白糖、饴糖手工折叠制成，入口酥松清甜，是高邮传统茶食。可看老师傅折糖、切片。',
    tags: ['美食', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '约30元',
  },
  {
    id: 'gy-puppet',
    name: '临泽高跷 · 杖头木偶',
    emoji: '🎭',
    desc: '运河乡镇的民间绝活，踩高跷、耍木偶',
    duration: '1小时',
    category: '民俗体验',
    heritage: '临泽高跷 / 杖头木偶戏 · 省级非物质文化遗产',
    location: { lat: 32.8500, lng: 119.3600 },
    address: '高邮市临泽镇 / 盂城驿展演',
    story: '临泽高跷与杖头木偶戏是高邮乡镇的传统民间表演，逢年过节走街串巷。盂城驿街区节庆时可观看，热闹非凡。',
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '免费展演（节庆）',
  },
  {
    id: 'gy-yuchengyi',
    name: '盂城驿',
    emoji: '🏯',
    desc: '全国规模最大的明代驿站，运河漕运活化石',
    duration: '1.5小时',
    category: '历史文化',
    heritage: '盂城驿 · 全国重点文物保护单位 · 非遗展演地',
    location: { lat: 32.7845, lng: 119.4435 },
    address: '高邮市南门大街馆驿巷',
    story: '盂城驿始建于明洪武八年，是全国现存规模最大的古代驿站，见证了京杭大运河的漕运繁华，也是高邮各类非遗集中展演的场所。',
    tags: ['文化'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '门票约30元',
  },
]

// ============================================================
//  凤凰 / 湘西非遗池（边城 · 沈从文）
//  依据：湖南省文旅厅 + 湘西州非遗名录
// ============================================================
const fenghuangHeritage: OptionalRecommendSpot[] = [
  {
    id: 'fh-silver',
    name: '苗族银饰锻制技艺',
    emoji: '🥈',
    desc: '千锤百炼的苗家银饰，环佩叮当的盛装之魂',
    duration: '1小时',
    category: '非遗文化',
    heritage: '苗族银饰锻制技艺 · 国家级非物质文化遗产',
    location: { lat: 27.9470, lng: 109.5985 },
    address: '凤凰古城·银饰工坊',
    story: '苗族银饰种类繁多、造型奇特，是苗族女子盛装的灵魂。凤凰设有苗族银饰锻制技艺生产性保护基地，可看匠人化银、拉丝、锻打、錾刻全过程。',
    tags: ['文化', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '锻制体验约80元',
  },
  {
    id: 'fh-embroidery',
    name: '苗绣体验',
    emoji: '🧵',
    desc: '「穿在身上的史诗」，与湘苏蜀粤绣并称',
    duration: '1小时',
    category: '非遗文化',
    heritage: '苗绣（苗族服饰）· 国家级非物质文化遗产',
    location: { lat: 27.9490, lng: 109.5995 },
    address: '凤凰古城·苗绣工坊',
    story: '苗绣针法繁复、图案古朴，被誉为「穿在身上的史诗」。2008年苗族服饰入选国家级非遗，可在古城工坊亲手绣一方小片。',
    tags: ['文化', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '绣片体验约50元',
  },
  {
    id: 'fh-dye',
    name: '凤凰扎染·蜡染',
    emoji: '🎨',
    desc: '「守住古城那一抹蓝」，草木靛蓝染方巾',
    duration: '45分钟',
    category: '非遗文化',
    heritage: '凤凰扎染技艺 · 省级非物质文化遗产',
    location: { lat: 27.9465, lng: 109.6005 },
    address: '凤凰古城·染坊',
    story: '凤凰扎染、蜡染以靛蓝为底，纹样取自苗家生活。捆扎、浸染、氧化、拆线，一方蓝白方巾便成，是古城最受欢迎的手作。',
    tags: ['文化', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '扎染方巾约40元',
  },
  {
    id: 'fh-drum',
    name: '湘西苗族鼓舞',
    emoji: '🥁',
    desc: '一人击鼓、众人相和的苗家欢腾',
    duration: '40分钟',
    category: '民俗体验',
    heritage: '湘西苗族鼓舞 · 国家级非物质文化遗产',
    location: { lat: 27.9500, lng: 109.5980 },
    address: '凤凰古城·广场展演',
    story: '苗族鼓舞集歌、舞、鼓于一体，节奏明快、动作粗犷。古城广场常有展演，逢节庆更是万人相和。',
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '古城展演·免费',
  },
  {
    id: 'fh-opera',
    name: '阳戏 · 傩堂戏',
    emoji: '🎭',
    desc: '沈从文笔下的古老酬神戏，面具与楚巫遗风',
    duration: '1小时',
    category: '民俗体验',
    heritage: '阳戏 / 傩堂戏 · 省级非物质文化遗产',
    location: { lat: 27.9455, lng: 109.5975 },
    address: '凤凰古城·古戏台',
    story: '阳戏、傩堂戏源于楚地酬神祭祀，戴面具、唱古腔，是沈从文《边城》世界里湘西民俗的底色。古戏台偶有展演。',
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '古戏台展演·免费',
  },
  {
    id: 'fh-ginger',
    name: '凤凰姜糖制作技艺',
    emoji: '🍬',
    desc: '现熬现拉的琥珀色姜糖，古城巷口的暖味',
    duration: '30分钟',
    category: '非遗文化',
    heritage: '凤凰姜糖制作技艺 · 地方传统技艺',
    location: { lat: 27.9485, lng: 109.6000 },
    address: '凤凰古城·姜糖老铺',
    story: '凤凰姜糖以老姜、红糖手工熬制、反复拉扯成型，辛甜暖胃。古城巷口随处可见师傅拉糖，是最有烟火气的一味。',
    tags: ['美食', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '现熬品尝约15元',
  },
  {
    id: 'fh-costume',
    name: '苗族服饰盛装体验',
    emoji: '👗',
    desc: '披银戴冠着盛装，在沱江边拍一组苗家写真',
    duration: '1小时',
    category: '非遗文化',
    heritage: '苗族服饰 · 国家级非物质文化遗产',
    location: { lat: 27.9475, lng: 109.5990 },
    address: '凤凰古城·沱江畔',
    story: '苗族盛装以银冠、银项圈、绣衣层层叠叠，是「研究民族历史文化的活化石」。可租盛装在沱江吊脚楼前拍照留念。',
    tags: ['文化', '体验'],
    budgetLevels: ['舒适', '轻奢'],
    budgetHint: '盛装拍照约60元',
  },
]

/** 沙家浜专属可选项（保留原有京剧展演） */const shajiabangSpecific: OptionalRecommendSpot[] = [
  {
    id: 'opt-sb-1',
    name: '沙家浜京剧表演',
    emoji: '🎭',
    desc: '景区内定时上演《沙家浜》经典选段',
    duration: '1小时',
    category: '民俗体验',
    heritage: '京剧 · 沙家浜样板戏',
    location: { lat: 31.5240, lng: 120.7290 },
    address: '常熟市沙家浜风景区',
    story: '沙家浜景区内定时上演《沙家浜》"智斗"等经典选段，阿庆嫂、刁德一同台，京韵铿锵。',
    insertDay: 1,
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '含在景区门票内',
  },
]

/** 各路线沿途可选推荐点位 */
const OPTIONAL_BY_GUIDE: Record<string, OptionalRecommendSpot[]> = {
  renjianziwei: [
    {
      id: 'opt-rjz-1',
      name: '高邮湖湿地野菜采摘',
      emoji: '🌿',
      desc: '蒌蒿、枸杞、荠菜、马齿苋——《故乡的野菜》',
      duration: '1小时',
      category: '历史文化',
      heritage: '汪曾祺笔下的故乡田野',
      location: { lat: 32.7550, lng: 119.3100 },
      insertDay: 1,
      story: '春天去高邮湖湿地周边，可体验野菜采摘，对应《故乡的野菜》篇。',
      tags: ['美食', '自然', '体验'],
      budgetLevels: ['穷游', '舒适', '轻奢'],
      budgetHint: '免费（自驾）',
    },
    ...gaoyouHeritage,
  ],
  shajiabang: [...shajiabangSpecific, ...changshuHeritage],
  niehaifeng: [...changshuHeritage],
  wengtonghe: [...changshuHeritage],
  qianliu: [...changshuHeritage],
  fenghuang: [...fenghuangHeritage],
  yangzhou: [
    {
      id: 'opt-yz-1',
      name: '扬州剪纸体验馆',
      emoji: '✂️',
      desc: '国家级非遗，体验「三把刀」之一的剪纸技艺',
      duration: '45分钟',
      category: '非遗文化',
      heritage: '扬州剪纸 · 国家级非物质文化遗产',
      location: { lat: 32.3965, lng: 119.4545 },
      address: '扬州市广陵区东关街文化街区',
      insertAfterSpotId: 'yz-4',
      insertDay: 1,
      story: '扬州剪纸与淮扬菜、理发并称「三把刀」，图案多取材园林与诗词意境。',
      tags: ['文化', '体验'],
      budgetLevels: ['舒适', '轻奢'],
      budgetHint: '体验费约30元',
    },
    {
      id: 'opt-yz-2',
      name: '扬州漆器陈列馆',
      emoji: '🎨',
      desc: '螺钿镶嵌、雕漆工艺，千年漆艺传承',
      duration: '40分钟',
      category: '非遗文化',
      heritage: '扬州漆器 · 国家级非物质文化遗产',
      location: { lat: 32.4005, lng: 119.4485 },
      address: '扬州市广陵区盐阜东路',
      insertAfterSpotId: 'yz-2',
      insertDay: 1,
      story: '扬州漆器始于战国，螺钿工艺在明清达到巅峰，个园一带曾是盐商聚集区。',
      tags: ['文化'],
      budgetLevels: ['穷游', '舒适', '轻奢'],
      budgetHint: '免费参观',
    },
    {
      id: 'opt-yz-3',
      name: '平山堂欧阳修纪念馆',
      emoji: '📜',
      desc: '欧阳修守扬州时所建，苏轼、秦观皆曾登临赋诗',
      duration: '50分钟',
      category: '历史文化',
      location: { lat: 32.4230, lng: 119.4140 },
      address: '扬州市邗江区大明寺西侧',
      insertAfterSpotId: 'yz-3',
      insertDay: 1,
      originalText: '山横翠霭千层合，水抱芳洲两岸分。',
      originalSource: '欧阳修《题平山堂》',
      story: '平山堂与大明寺相邻，是理解扬州文人传统的重要地标。',
      tags: ['文化'],
      budgetLevels: ['穷游', '舒适', '轻奢'],
      budgetHint: '免费',
    },
    {
      id: 'opt-yz-4',
      name: '扬州评话书场',
      emoji: '🎭',
      desc: '国家级非遗，听一段《三国》或《水浒》',
      duration: '1小时',
      category: '民俗体验',
      heritage: '扬州评话 · 国家级非物质文化遗产',
      location: { lat: 32.3955, lng: 119.4560 },
      address: '扬州市广陵区东关街',
      insertAfterSpotId: 'yz-4',
      insertDay: 2,
      story: '扬州评话与清曲、弹词并称，是江淮地区最具代表性的口头文学。',
      tags: ['文化', '体验'],
      budgetLevels: ['穷游', '舒适', '轻奢'],
      budgetHint: '约20-40元',
    },
  ],
  nanjing: [
    {
      id: 'opt-nj-1',
      name: '金陵刻经处',
      emoji: '📖',
      desc: '中国近代佛教典籍刻印中心，雕版印刷技艺',
      duration: '40分钟',
      category: '非遗文化',
      heritage: '金陵刻经 · 国家级非物质文化遗产',
      location: { lat: 32.0450, lng: 118.7780 },
      address: '南京市秦淮区淮海街',
      insertDay: 1,
      tags: ['文化'],
      budgetLevels: ['穷游', '舒适', '轻奢'],
      budgetHint: '免费',
    },
  ],
  suzhou: [
    {
      id: 'opt-sz-1',
      name: '苏绣博物馆',
      emoji: '🧵',
      desc: '四大名绣之一，双面绣技艺现场展示',
      duration: '45分钟',
      category: '非遗文化',
      heritage: '苏绣 · 国家级非物质文化遗产',
      location: { lat: 31.3180, lng: 120.6320 },
      address: '苏州市姑苏区人民路',
      insertDay: 1,
      tags: ['文化', '体验'],
      budgetLevels: ['穷游', '舒适', '轻奢'],
      budgetHint: '门票约10元',
    },
  ],
}

/** 从在地体验生成通用可选项 */
function fromLocalExperiences(guide: Guide): OptionalRecommendSpot[] {
  return (guide.localExperiences || []).map((exp, i) => ({
    id: `opt-${guide.id}-le-${i}`,
    name: exp.name,
    emoji: exp.type === '手艺' ? '🛠️' : exp.type === '民俗' ? '🎭' : '🌸',
    desc: exp.desc,
    duration: '约1小时',
    category: exp.type === '手艺' ? '非遗文化' as const : exp.type === '民俗' ? '民俗体验' as const : '历史文化' as const,
    heritage: exp.type === '手艺' ? `${guide.city}传统手艺` : undefined,
    insertDay: 1,
    story: exp.desc,
    tags: ['文化', '体验'],
    budgetLevels: ['穷游', '舒适', '轻奢'],
    budgetHint: '视体验项目而定',
  }))
}

export function getOptionalSpotsForGuide(guideId: string, guide?: Guide): OptionalRecommendSpot[] {
  const specific = OPTIONAL_BY_GUIDE[guideId] || []
  if (specific.length > 0) return specific
  if (guide) return fromLocalExperiences(guide)
  return []
}

/**
 * 按当前方案（天数/预算/喜好）过滤并排序沿途非遗推荐。
 * - 预算：保留适配该预算档的项，并标记推荐（穷游→免费类；轻奢→手作/雅集类）
 * - 喜好：命中主题 tag 的项置顶并标记推荐
 * - 天数：限制数量（1天≈2，2天≈4，3天=全部），并推荐国家级项目
 */
export function getOptionalSpotsForAspect(
  guideId: string,
  guide: Guide | undefined,
  aspect: PlanAspect,
  variantId: string
): OptionalRecommendSpot[] {
  let result = getOptionalSpotsForGuide(guideId, guide).map(o => ({ ...o, recommend: false }))

  if (aspect === 'budget') {
    const level = variantId as BudgetLevel
    result = result.filter(o => !o.budgetLevels || o.budgetLevels.includes(level))
    result.forEach(o => {
      const free = (o.budgetHint || '').includes('免费')
      if (level === '穷游') o.recommend = free
      else if (level === '轻奢') o.recommend = !free
      else o.recommend = false
    })
  } else if (aspect === 'interests') {
    const tag = variantId as InterestTag
    result.forEach(o => { o.recommend = (o.tags || []).includes(tag) })
    result.sort((a, b) => (b.recommend ? 1 : 0) - (a.recommend ? 1 : 0))
  } else {
    // days
    const days = parseInt(variantId, 10) || guide?.days || 1
    result.forEach(o => { o.recommend = (o.heritage || '').includes('国家级') })
    const cap = days <= 1 ? 2 : days === 2 ? 4 : result.length
    // 推荐项优先保留
    result.sort((a, b) => (b.recommend ? 1 : 0) - (a.recommend ? 1 : 0))
    result = result.slice(0, cap)
  }

  return result
}

export function optionalToSpot(opt: OptionalRecommendSpot): import('@/types').Spot {
  return {
    id: opt.id,
    name: opt.name,
    desc: opt.desc,
    duration: opt.duration,
    tags: opt.tags || ['文化'],
    timeSlot: '下午',
    location: opt.location,
    address: opt.address,
    story: opt.story,
    type: '体验',
    budgetHint: opt.budgetHint,
    emoji: opt.emoji,
    originalText: opt.originalText,
    originalSource: opt.originalSource,
  }
}
