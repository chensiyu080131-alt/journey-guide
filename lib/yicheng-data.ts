// 遗承 · 虞山非遗手作 — 数据模块
// 非遗资源、工坊、传承人、社区作品

export type HeritageLevel = '国家级' | '省级'

export interface Heritage {
  id: string
  char: string          // 印章字
  title: string
  level: HeritageLevel
  tone: 'vermilion' | 'jade' | 'ink' | 'xuncheng'
  desc: string
  activity: string
  href: string
}

export interface Workshop {
  id: string
  cat: 'guqin' | 'lace' | 'furniture' | 'song' | 'craft'
  char: string
  tone: 'vermilion' | 'jade' | 'ink' | 'xuncheng'
  title: string
  level?: HeritageLevel
  venue: string
  master: string
  duration: string
  age: string
  slots: { time: string; full?: boolean }[]
}

export interface Master {
  id: string
  initial: string
  name: string
  role: string
  tone: 'vermilion' | 'jade' | 'ink' | 'xuncheng'
  bio: string
}

export interface Post {
  id: string
  tag: 'work' | 'qa' | 'live'
  char: string
  tone: 'vermilion' | 'jade' | 'ink' | 'xuncheng'
  authorRole: string
  author: string
  title: string
  desc: string
  likes: number
  comments: number
}

export const heritages: Heritage[] = [
  {
    id: 'guqin',
    char: '琴',
    title: '虞山琴派 · 古琴',
    level: '国家级',
    tone: 'vermilion',
    desc: '减字谱 AR 动态解析,指法三维演示,新手掌握《流水》前奏时间缩短 60%。',
    activity: '古琴制作 / 演奏',
    href: '/yicheng/ar',
  },
  {
    id: 'song',
    char: '歌',
    title: '白茆山歌',
    level: '国家级',
    tone: 'jade',
    desc: '吴语方言对唱体验,田野录音与曲谱对照,感受"江南民间音乐活化石"。',
    activity: '田野采风 / 对唱',
    href: '/yicheng/booking',
  },
  {
    id: 'lace',
    char: '边',
    title: '常熟花边',
    level: '省级',
    tone: 'ink',
    desc: '抽绣纹样拼图认知,AI 辅助纹样设计,完成"花边纹样与地理气候"探究报告。',
    activity: '抽绣 / 纹样设计',
    href: '/yicheng/booking',
  },
  {
    id: 'furniture',
    char: '具',
    title: '明式家具',
    level: '省级',
    tone: 'xuncheng',
    desc: '榫卯结构拆装体验,明式家具制作工艺全流程,感受"精、巧、雅"的江南匠心。',
    activity: '榫卯 / 制作工艺',
    href: '/yicheng/booking',
  },
]

export const workshops: Workshop[] = [
  {
    id: 'ws-guqin', cat: 'guqin', char: '琴', tone: 'vermilion',
    title: '古琴减字谱 · AR 手作工坊', level: '国家级',
    venue: '虞山琴派古琴艺术馆', master: '朱晞领衔', duration: '90 分钟', age: '8 岁+',
    slots: [
      { time: '周六 09:00' }, { time: '周六 14:00' },
      { time: '周日 10:00' }, { time: '周日 15:00', full: true },
    ],
  },
  {
    id: 'ws-lace', cat: 'lace', char: '边', tone: 'ink',
    title: '常熟花边 · 抽绣纹样体验', level: '省级',
    venue: '常熟花边社', master: '翁鲁瑛授课', duration: '120 分钟', age: '10 岁+',
    slots: [
      { time: '周六 09:30' }, { time: '周六 13:30' },
      { time: '周日 09:30' }, { time: '周日 13:30' },
    ],
  },
  {
    id: 'ws-furniture', cat: 'furniture', char: '具', tone: 'xuncheng',
    title: '明式家具 · 榫卯拆装体验', level: '省级',
    venue: '虞林世家非遗馆', master: '陆师傅带队', duration: '150 分钟', age: '12 岁+',
    slots: [
      { time: '周六 10:00' }, { time: '周六 14:00', full: true },
      { time: '周日 10:00' },
    ],
  },
  {
    id: 'ws-song', cat: 'song', char: '歌', tone: 'jade',
    title: '白茆山歌 · 吴语对唱田野课', level: '国家级',
    venue: '白茆山歌传习所', master: '徐老师', duration: '60 分钟', age: '6 岁+',
    slots: [{ time: '周日 09:00' }, { time: '周日 11:00' }],
  },
  {
    id: 'ws-paper', cat: 'craft', char: '纸', tone: 'xuncheng',
    title: '古法造纸 · 手工抄纸体验',
    venue: '虞山手作工坊', master: '工坊老师', duration: '90 分钟', age: '7 岁+',
    slots: [{ time: '周六 13:00' }, { time: '周日 13:00' }],
  },
  {
    id: 'ws-pancake', cat: 'craft', char: '饼', tone: 'vermilion',
    title: '盘香饼 · 常熟老味道手作',
    venue: '王四酒家非遗工坊', master: '工坊师傅', duration: '75 分钟', age: '5 岁+',
    slots: [{ time: '周六 15:00' }, { time: '周日 15:00' }],
  },
]

export const masters: Master[] = [
  { id: 'm1', initial: '朱', name: '朱晞', role: '国家级代表性传承人', tone: 'vermilion',
    bio: '虞山琴派古琴艺术 · 古琴演奏与减字谱教学,主持 AR 教学内容开发。' },
  { id: 'm2', initial: '翁', name: '翁鲁瑛', role: '省级传承人', tone: 'jade',
    bio: '常熟花边 · 抽绣技艺与纹样设计,领衔花边工坊与跨学科探究课程。' },
  { id: 'm3', initial: '陆', name: '陆师傅', role: '省级传承人', tone: 'ink',
    bio: '明式家具制作技艺 · 榫卯结构,虞林世家非遗馆驻馆,带队家具制作体验。' },
  { id: 'm4', initial: '徐', name: '徐老师', role: '白茆山歌传承人', tone: 'xuncheng',
    bio: '白茆山歌 · 吴语对唱,组织田野采风与"山歌进校园"活动。' },
]

export const posts: Post[] = [
  { id: 'p1', tag: 'work', char: '边', tone: 'vermilion', authorRole: '小小非遗推荐官', author: '林小满',
    title: '我的第一幅常熟花边书签', desc: '跟着翁鲁瑛老师学了抽绣针法,绣了一片虞山落叶纹样~',
    likes: 128, comments: 24 },
  { id: 'p2', tag: 'work', char: '琴', tone: 'ink', authorRole: '大学生主理人', author: '陈知行',
    title: '《流水》前奏 · AR 跟弹实录', desc: '用 AR 教学两周拿下前奏,附我的练习时间轴与踩坑笔记。',
    likes: 96, comments: 18 },
  { id: 'p3', tag: 'qa', char: '?', tone: 'jade', authorRole: '家长', author: '周女士',
    title: '花边纹样和气候有什么关系?', desc: '孩子中学探究报告选题,有老师能讲讲江南湿润气候对纹样的影响吗?',
    likes: 42, comments: 11 },
  { id: 'p4', tag: 'work', char: '具', tone: 'xuncheng', authorRole: '小侦探', author: '豆豆',
    title: '榫卯结构拼装挑战成功!', desc: '不用一颗钉子,我和爸爸拼好了一个明式小凳,太神奇了!',
    likes: 73, comments: 9 },
  { id: 'p5', tag: 'live', char: '播', tone: 'vermilion', authorRole: '传承人', author: '徐老师',
    title: '白茆山歌 · 田野录音直播预告', desc: '下周六带大家"云采风",走进白茆塘听原汁原味的吴语山歌。',
    likes: 51, comments: 7 },
  { id: 'p6', tag: 'work', char: '饼', tone: 'xuncheng', authorRole: '亲子家庭', author: '王先生',
    title: '盘香饼手作 · 老味道新体验', desc: '一家人在王四酒家非遗工坊做的盘香饼,孩子说比买的还香。',
    likes: 88, comments: 15 },
]

// 工坊筛选维度
export const workshopFilters = [
  { id: 'all', label: '全部工坊' },
  { id: 'guqin', label: '虞山琴派' },
  { id: 'song', label: '白茆山歌' },
  { id: 'lace', label: '常熟花边' },
  { id: 'furniture', label: '明式家具' },
  { id: 'craft', label: '造纸 / 盘香饼' },
] as const

// 社区 tab
export const communityTabs = [
  { id: 'all', label: '全部' },
  { id: 'work', label: '作品分享' },
  { id: 'qa', label: '技艺问答' },
  { id: 'live', label: '直播预告' },
] as const

// 配色映射 → tailwind class
export const toneBg: Record<string, string> = {
  vermilion: 'bg-vermilion',
  jade: 'bg-jade',
  ink: 'bg-charcoal',
  xuncheng: 'bg-xuncheng-500',
}
export const toneGrad: Record<string, string> = {
  vermilion: 'from-vermilion to-xuncheng-700',
  jade: 'from-jade to-jade',
  ink: 'from-charcoal to-charcoal-50',
  xuncheng: 'from-xuncheng-500 to-xuncheng-700',
}
