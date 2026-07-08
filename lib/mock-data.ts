import { Guide, Spot, EntryCard } from '@/types'

// ============================================================
//  寻城 v2 Mock 数据 — 常熟："跟着书本去旅行"
//  三条主线：沙家浜 / 孽海花 / 翁同龢
//  数据面向黑客松路演，常熟文旅局可直接落地
// ============================================================

// ──────────────────────────────────────
//  路线1：《沙家浜》— 红色经典 + 实地路线
// ──────────────────────────────────────
const shajiabangSpots: Spot[] = [
  {
    id: 'sjb-1', name: '春来茶馆', desc: '阿庆嫂的春来茶馆，戏里的故事从这里开始',
    duration: '1.5小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.5250, lng: 120.7280 }, address: '常熟市沙家浜风景区内',
    story: '春来茶馆是京剧《沙家浜》的核心场景。阿庆嫂以茶馆老板娘的身份掩护新四军伤员，在日伪军面前周旋。历史上沙家浜确实有地下交通站，当年多位"阿庆嫂"式的人物在此活动。',
    type: '景点', budgetHint: '含景区门票', goodNow: true, goodNowReason: '上午游客少，适合慢慢品', photoSpot: true, emoji: '🍵',
    originalText: '"来的都是客，全凭嘴一张。相逢开口笑，过后不思量。"',
    originalSource: '京剧《沙家浜》·阿庆嫂唱词',
    realityNote: '如今的春来茶馆按戏中场景1:1还原，可入内喝茶，八仙桌、长条凳，和阿庆嫂时代别无二致。',
  },
  {
    id: 'sjb-2', name: '沙家浜芦苇荡', desc: '千亩芦苇荡，新四军藏身的水上迷宫',
    duration: '2.5小时', tags: ['自然', '历史'], timeSlot: '上午',
    location: { lat: 31.5220, lng: 120.7350 }, address: '沙家浜风景区',
    story: '芦苇荡是沙家浜的标志性景观，也是当年新四军伤员藏身之处。迷宫般的芦苇水道让日伪军无从搜寻。如今可以坐手摇船穿行芦苇丛中，感受当年水上游击的惊险。',
    type: '体验', budgetHint: '船票60元', goodNow: true, goodNowReason: '上午芦苇间光线最美', photoSpot: true, emoji: '🌾',
    originalText: '"芦花放，稻谷香，岸柳成行。"',
    originalSource: '京剧《沙家浜》·郭建光唱词',
    realityNote: '秋天来最应景——芦花飞雪，稻谷金黄，和戏中唱的一模一样。手摇船穿过芦苇迷宫，水道至今保持着当年的走势。',
  },
  {
    id: 'sjb-3', name: '阳澄湖大闸蟹', desc: '就在阳澄湖边，吃的就是湖里捞上来的',
    duration: '1.5小时', tags: ['美食'], timeSlot: '下午',
    location: { lat: 31.5300, lng: 120.7400 }, address: '沙家浜镇蟹庄',
    story: '沙家浜就在阳澄湖畔，这里是阳澄湖大闸蟹的核心产区。不同于上海苏州的蟹庄溢价，在产地吃不仅更新鲜，价格也实在。九月开捕季来，一蟹三吃（清蒸、蟹粉豆腐、蟹黄面）能鲜到怀疑人生。',
    type: '美食', budgetHint: '人均100-180元', goodNow: false, goodNowReason: '9-11月蟹季最佳', emoji: '🦀',
    originalText: '"西风响，蟹脚痒。"',
    originalSource: '江南谚语',
    realityNote: '阳澄湖边的蟹庄每年9月开捕，当地人认准"戴戒指"（防伪扣）的湖蟹。在沙家浜吃蟹，窗外就是阳澄湖。',
  },
  {
    id: 'sjb-4', name: '横泾老街', desc: '《沙家浜》影视剧取景地，老街还是那个老街',
    duration: '1.5小时', tags: ['文化', '体验'], timeSlot: '下午',
    location: { lat: 31.5260, lng: 120.7300 }, address: '沙家浜镇横泾',
    story: '横泾老街保留了江南水乡的原始格局，是电视剧《沙家浜》的取景地。石板路沿河铺开，老房子里还住着当地人。比起周庄同里，这里安静得不像景区。',
    type: '景点', budgetHint: '免费', goodNow: true, goodNowReason: '下午散步最佳', photoSpot: true, emoji: '🏘️',
    originalText: '"朝霞映在阳澄湖上，芦花放稻谷香岸柳成行。"',
    originalSource: '京剧《沙家浜》·开场合唱',
    realityNote: '走在横泾老街的石板路上，河对岸白墙黛瓦倒映水中，和半个世纪前剧组看到的风景几乎一样。',
  },
  {
    id: 'sjb-5', name: '沙家浜革命历史纪念馆', desc: '那些真实发生过的事，比戏更震撼',
    duration: '1小时', tags: ['文化', '历史'], timeSlot: '下午',
    location: { lat: 31.5240, lng: 120.7290 }, address: '沙家浜风景区',
    story: '纪念馆用大量实物和影像还原了当年新四军在阳澄湖畔养伤、斗争的真实历史。最触动的是"36个伤病员"的故事——他们在芦苇荡中养伤，在当地百姓掩护下全部康复归队。这段历史比任何戏剧都更动人。',
    type: '景点', budgetHint: '含景区门票', emoji: '🏛️',
    originalText: '"要学那泰山顶上一青松，挺然屹立傲苍穹。"',
    originalSource: '京剧《沙家浜》·郭建光唱段',
    realityNote: '馆内陈列着当年新四军使用过的医疗器械、武器和百姓的掩护用具。实物比戏更有力量。',
  },
  {
    id: 'sjb-6', name: '叫花鸡', desc: '常熟招牌菜，黄泥裹了煨，掰开满屋香',
    duration: '1小时', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 31.5280, lng: 120.7320 }, address: '沙家浜镇餐馆',
    story: '叫花鸡是常熟最有名的菜，传说是一个叫花子偷了鸡用泥裹了烤，没想到歪打正着做出了绝世美味。现在正规做法是用黄泥裹鸡，加入火腿、香菇等馅料，煨3小时。沙家浜镇上的叫花鸡比虞山脚下的更接地气。',
    type: '美食', budgetHint: '60-80元/只', goodNow: true, goodNowReason: '晚上提前预约正好', emoji: '🍗',
    originalText: '"叫花子没路走，拿了鸡就用黄泥裹了烤。"',
    originalSource: '常熟民间传说',
    realityNote: '常熟叫花鸡发源地就在虞山一带。现在的做法比传说讲究多了，但那个掰开泥壳满屋飘香的仪式感，几百年没变。',
  },
]

// ──────────────────────────────────────
//  路线2：《孽海花》— 常熟文人曾朴的晚清浮世绘
// ──────────────────────────────────────
const niehaifengSpots: Spot[] = [
  {
    id: 'nhf-1', name: '曾园（虚廓园）', desc: '曾朴家的园子，小说里写的那些事就在这儿发生',
    duration: '2小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.6500, lng: 120.7400 }, address: '常熟市翁府前',
    story: '曾园是晚清常熟望族曾家的私家园林，《孽海花》作者曾朴就生长于此。园中亭台楼阁、小桥流水，处处透着江南文人园林的精致。曾朴在这里度过的少年时光，成为小说中许多场景的原型。',
    type: '景点', budgetHint: '免费', goodNow: true, goodNowReason: '清晨园中无人，最可体味', photoSpot: true, emoji: '🏡',
    originalText: '"那园子虽不甚大，却也亭台曲折，花木扶疏，颇有几分雅致。"',
    originalSource: '曾朴《孽海花》第一回',
    realityNote: '曾园现为虞山公园的一部分，免费开放。园中照山楼、不碍云山楼等建筑保存完好，和曾朴笔下的格局基本一致。',
  },
  {
    id: 'nhf-2', name: '铁琴铜剑楼', desc: '中国四大藏书楼之一，瞿氏五代人守了一百年的书',
    duration: '1.5小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.6550, lng: 120.7500 }, address: '常熟市古里镇',
    story: '铁琴铜剑楼是清代四大私家藏书楼之一，与宁波天一阁齐名。瞿氏家族五代人倾尽家财收藏古籍善本，最盛时藏书十余万卷。抗战时期，瞿家后人冒死将珍本转移，使大量孤本免于战火。这种"以命护书"的精神，和《孽海花》中描写的晚清文人风骨一脉相承。',
    type: '景点', budgetHint: '免费', emoji: '📚',
    originalText: '"铁琴铮铮，铜剑光寒。藏书万卷，不负青山。"',
    originalSource: '瞿氏铁琴铜剑楼旧联',
    realityNote: '铁琴铜剑楼已修复开放，可看到瞿家当年藏书的楼阁原貌。楼内有部分珍贵刻本展出，值得细细看。',
  },
  {
    id: 'nhf-3', name: '蕈油面', desc: '虞山野蕈熬的浇头面，鲜到眉毛掉',
    duration: '1小时', tags: ['美食'], timeSlot: '下午',
    location: { lat: 31.6510, lng: 120.7380 }, address: '虞山脚下兴福寺旁',
    story: '蕈油面是常熟独有的面食，用虞山上采的野生蕈（一种菌菇）熬成浇头。蕈的鲜味是人工菌菇无法比的，每年只在特定季节才有。兴福寺旁的面馆是老常熟人的首选，一碗面、一壶茶，就是常熟文人最惬意的午后。',
    type: '美食', budgetHint: '25-40元', goodNow: true, goodNowReason: '午时最新鲜', emoji: '🍜',
    originalText: '"常熟人的清晨是从一碗面开始的。"',
    originalSource: '常熟饮食文化',
    realityNote: '兴福寺旁的望岳楼老面馆，开了几十年。蕈油面的关键在于蕈——虞山松林里的野生蕈，只有懂行的山民才找得到。',
  },
  {
    id: 'nhf-4', name: '虞山剑门', desc: '虞山最险处，曾朴笔下文人的退隐之地',
    duration: '2小时', tags: ['自然', '文化'], timeSlot: '下午',
    location: { lat: 31.6450, lng: 120.7200 }, address: '虞山国家森林公园',
    story: '剑门是虞山最险峻的景观，两块巨石对峙如剑劈开，传说吴王夫差在此试剑。登上剑门，常熟全城和尚湖尽收眼底。常熟文人历来有"退隐虞山"的传统，曾朴晚年也常在虞山徘徊。',
    type: '景点', budgetHint: '虞山免费/索道30元', goodNow: true, goodNowReason: '下午光线好，拍照绝', photoSpot: true, emoji: '⚔️',
    originalText: '"虞山之阳，有石如剑劈，名曰剑门。登之则百里之远，尽在目前。"',
    originalSource: '常熟县志·虞山篇',
    realityNote: '剑门观景台是虞山最高处的最佳观景点。天气好时可以看到阳澄湖和远处的苏州城，和古人看到的视野一样辽阔。',
  },
  {
    id: 'nhf-5', name: '方塔', desc: '南宋古塔，常熟城里最老的建筑',
    duration: '1小时', tags: ['文化', '历史'], timeSlot: '下午',
    location: { lat: 31.6480, lng: 120.7450 }, address: '常熟市方塔街',
    story: '方塔建于南宋建炎四年（1130年），因塔身呈方形而得名，是常熟现存最古老的建筑。塔下有南宋古井和银杏树，树龄超过800年。曾朴在《孽海花》中多次写到方塔——这是常熟城的标志，文人墨客的地理锚点。',
    type: '景点', budgetHint: '方塔园免费/登塔10元', photoSpot: true, emoji: '🗼',
    originalText: '"方塔耸立，飞檐如翼，城中望之，如在目前。"',
    originalSource: '曾朴《孽海花》相关描写',
    realityNote: '方塔周围已辟为方塔园，园内古井、古银杏均为南宋遗物。塔身可登，九层四面，每层都是常熟城不同角度的画卷。',
  },
  {
    id: 'nhf-6', name: '桂花酒酿圆子', desc: '虞山脚下小摊的甜，常熟文人的下午茶',
    duration: '30分钟', tags: ['美食'], timeSlot: '下午',
    location: { lat: 31.6505, lng: 120.7390 }, address: '虞山脚下',
    story: '桂花酒酿圆子是常熟秋季的限定甜品，小圆子煮在酒酿里，撒上新鲜桂花。虞山脚下的小摊做了几十年，桂花是山上的，酒酿是自己酿的。这碗甜品的季节性极强——桂花只在深秋开两周。',
    type: '美食', budgetHint: '8-12元', goodNow: false, goodNowReason: '10月桂花季最佳', emoji: '🍡',
    originalText: '"桂花蒸过，酒酿新熟，小圆子一颗颗浮起来，就是秋天的味道。"',
    originalSource: '常熟饮食文化',
    realityNote: '这碗甜品只能在常熟吃到正宗的。虞山上的桂花、本地的酒酿，换一个地方就不是那个味。',
  },
]

// ──────────────────────────────────────
//  路线3：翁同龢 — 两代帝师的常熟足迹
// ──────────────────────────────────────
const wengtongheSpots: Spot[] = [
  {
    id: 'wth-1', name: '彩衣堂（翁同龢纪念馆）', desc: '翁家老宅，帝师从这里走出',
    duration: '2小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.6520, lng: 120.7420 }, address: '常熟市翁家巷门2号',
    story: '彩衣堂是翁同龢的出生地和少年居所，始建于明代，是江南保存最完好的明代建筑群之一。翁同龢在此度过了18年，从蒙童到状元。"彩衣"取自"老莱子彩衣娱亲"的典故，是翁家孝道家风的象征。堂内明代彩绘建筑至今色彩可辨，全国罕见。',
    type: '景点', budgetHint: '20元', goodNow: true, goodNowReason: '上午人少，可静心感受', photoSpot: true, emoji: '🏛️',
    originalText: '"每念先帝付托之重，不敢以老病自懈。"',
    originalSource: '翁同龢日记·光绪二十四年',
    realityNote: '彩衣堂内最珍贵的是明代建筑彩绘——500多年前的苏式彩画，在国内民居中极为罕见。翁同龢的书房按原样布置，笔墨纸砚如旧。',
  },
  {
    id: 'wth-2', name: '读书台', desc: '翁同龢少年读书处，虞山腰上的一方净土',
    duration: '1.5小时', tags: ['文化', '自然'], timeSlot: '上午',
    location: { lat: 31.6460, lng: 120.7300 }, address: '虞山国家森林公园',
    story: '读书台在虞山半腰，是昭明太子萧统编《文选》的遗迹，也是翁同龢少年时读书的地方。一块巨石平整如台，上有石刻"读书台"三字。翁同龢常在此处读书习字，虞山的灵秀和先贤的遗风，塑造了他的文人风骨。',
    type: '景点', budgetHint: '免费', emoji: '📖',
    originalText: '"读书台畔松风过，犹闻萧统编书声。"',
    originalSource: '常熟古迹诗咏',
    realityNote: '读书台至今保存完好，石台可坐。周围古木参天，松涛阵阵，和翁同龢读书时听到的声音一样。',
  },
  {
    id: 'wth-3', name: '蕈油面', desc: '帝师也爱的一碗面，虞山野蕈浇头',
    duration: '1小时', tags: ['美食'], timeSlot: '下午',
    location: { lat: 31.6510, lng: 120.7380 }, address: '虞山脚下兴福寺旁',
    story: '翁同龢日记中多次提到虞山脚下的素面。他罢官回乡后常去兴福寺，寺旁的素面就是今天的蕈油面的前身。用虞山野蕈做浇头，不加荤油，清鲜无比。这碗面连接着两代帝师和常素百姓共同的味觉记忆。',
    type: '美食', budgetHint: '25-40元', goodNow: true, goodNowReason: '午时现做最鲜', emoji: '🍜',
    originalText: '"晨起，步至兴福寺，食素面一盂。"',
    originalSource: '翁同龢日记',
    realityNote: '翁同龢在日记中多次记载到兴福寺吃面。如今兴福寺旁的面馆仍用虞山野蕈做浇头，面汤清亮，和他当年吃到的是同一种鲜。',
  },
  {
    id: 'wth-4', name: '翁同龢墓', desc: '帝师归葬虞山，墓碑上只有"翁文恭公墓"六字',
    duration: '1小时', tags: ['文化', '历史'], timeSlot: '下午',
    location: { lat: 31.6350, lng: 120.7150 }, address: '虞山鹁鸽峰下',
    story: '翁同龢墓位于虞山鹁鸽峰麓，是他生前选定的归葬之所。墓极简朴——没有华表、没有石像生，只有一块石碑刻"翁文恭公墓"。这位两代帝师、戊戌变法推手，最终选择以最朴素的方式长眠于虞山。这种反差，比任何碑文都更震撼。',
    type: '景点', budgetHint: '免费', emoji: '🪦',
    originalText: '"六十年中事，伤心到盖棺。不将两行泪，暗向众人弹。"',
    originalSource: '翁同龢临终诗',
    realityNote: '翁墓如今仍极简朴，和百年前一样。墓前有翁同龢自撰的墓志铭，字迹已被风雨侵蚀，但精神永在。',
  },
  {
    id: 'wth-5', name: '虞山城墙', desc: '腾山而建的明代城墙，走在上面半个常熟尽收眼底',
    duration: '1.5小时', tags: ['自然', '文化'], timeSlot: '下午',
    location: { lat: 31.6480, lng: 120.7250 }, address: '虞山国家森林公园',
    story: '虞山城墙是明代修建的，城墙沿山脊蜿蜒而上，被称为"江南小长城"。翁同龢罢官回乡后常在城墙上散步，远眺尚湖。他曾在日记中写道："登城远望，湖山如画。"如今走在城墙上，看到的风景和他看到的几乎一样。',
    type: '景点', budgetHint: '免费', goodNow: true, goodNowReason: '下午登城，日落绝佳', photoSpot: true, emoji: '🏯',
    originalText: '"登城远望，湖山如画，城郭如带。"',
    originalSource: '翁同龢日记',
    realityNote: '虞山城墙是常熟最美的步行道。城墙沿山脊而建，一面是虞山苍翠，一面是尚湖碧波，和翁同龢日记中的描写一模一样。',
  },
  {
    id: 'wth-6', name: '叫花鸡', desc: '翁同龢也写进日记的常熟头牌菜',
    duration: '1小时', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 31.6530, lng: 120.7410 }, address: '虞山脚下',
    story: '叫花鸡是常熟最著名的菜肴，连翁同龢也在日记中提到过。传统做法是将整鸡用黄泥裹了，入火煨制。如今虞山脚下有多家老字号，最地道的做法仍然坚持黄泥煨制——掰开泥壳的瞬间，香气能飘出十米远。',
    type: '美食', budgetHint: '60-80元/只', emoji: '🍗',
    originalText: '"晚食叫花鸡，味甚佳。"',
    originalSource: '翁同龢日记',
    realityNote: '翁同龢确实在日记中记载过吃叫花鸡。虞山脚下的王四酒家是百年老店，叫花鸡是招牌。',
  },
]

// ============================================================
//  组装完整攻略
// ============================================================

function buildDayPlans(spots: Spot[], days: number) {
  const dayPlans = []
  // 按上午/下午/晚上排序后分组
  const sorted = [...spots].sort((a, b) => {
    const order: Record<string, number> = { '上午': 0, '中午': 1, '下午': 2, '晚上': 3 }
    return (order[a.timeSlot] ?? 0) - (order[b.timeSlot] ?? 0)
  })
  const spotsPerDay = Math.ceil(sorted.length / days)
  for (let i = 0; i < days; i++) {
    const daySpots = sorted.slice(i * spotsPerDay, (i + 1) * spotsPerDay)
    dayPlans.push({
      day: i + 1,
      title: `第${i + 1}天`,
      spots: daySpots,
      budgetEstimate: i === 0 ? '约150-250元' : '约100-180元',
    })
  }
  return dayPlans
}

export const mockGuides: Record<string, Guide> = {
  'shajiabang': {
    id: 'shajiabang',
    title: '《沙家浜》红色之旅',
    subtitle: '跟着京剧经典，走进真实的芦苇荡',
    city: '常熟',
    province: '江苏·苏州',
    days: 1,
    interests: ['文化', '体验', '自然'],
    budget: '舒适',
    dayPlans: buildDayPlans(shajiabangSpots, 1),
    dialect: [
      { dialect: '好勒', meaning: '好的/行了', scenario: '答应别人时说' },
      { dialect: '白相', meaning: '玩', scenario: '去白相 = 去玩' },
      { dialect: '弗要', meaning: '不要', scenario: '弗要客气 = 别客气' },
      { dialect: '蛮好', meaning: '很好', scenario: '这个地方蛮好 = 这地方不错' },
      { dialect: '吃茶', meaning: '喝茶', scenario: '阿庆嫂请你吃茶' },
    ],
    localExperiences: [
      { name: '芦苇荡手摇船', desc: '船娘摇橹穿行芦苇丛，感受水上迷宫', type: '手艺', schedule: '全天' },
      { name: '阳澄湖蟹季', desc: '9-11月开捕，在产地吃第一手湖蟹', type: '时令', schedule: '9-11月' },
      { name: '沙家浜京剧表演', desc: '景区内定时上演《沙家浜》经典选段', type: '民俗', schedule: '每日下午' },
    ],
    createdAt: new Date().toISOString(),
    tips: [
      '沙家浜景区门票90元，建议上午9点前到达避开团队游',
      '芦苇荡手摇船值得坐，比电动船有感觉',
      '蟹季9-11月，提前一天订蟹庄',
      '春来茶馆可以免费喝茶，但要早去占位',
    ],
    entryType: '书籍',
    relatedBook: '《沙家浜》',
    relatedAuthor: '汪曾祺等改编',
    routeIntro: '《沙家浜》是八大样板戏之一，讲述抗战时期新四军伤员在阳澄湖畔芦苇荡中养伤、在当地百姓掩护下与敌周旋的故事。这条路线带你走进真实的芦苇荡，在阿庆嫂的茶馆喝一杯茶，坐手摇船穿越水上迷宫，吃阳澄湖边最新鲜的大闸蟹——戏里唱的，都是这里真实发生过的。',
  },
  'niehaifeng': {
    id: 'niehaifeng',
    title: '《孽海花》文人之路',
    subtitle: '跟着曾朴的小说，寻访晚清常熟的文人世界',
    city: '常熟',
    province: '江苏·苏州',
    days: 2,
    interests: ['文化', '美食', '自然'],
    budget: '舒适',
    dayPlans: buildDayPlans(niehaifengSpots, 2),
    dialect: [
      { dialect: '好勒', meaning: '好的/行了', scenario: '答应别人时说' },
      { dialect: '白相', meaning: '玩', scenario: '去白相 = 去玩' },
      { dialect: '弗要', meaning: '不要', scenario: '弗要客气 = 别客气' },
      { dialect: '蛮好', meaning: '很好', scenario: '评价风景美食' },
      { dialect: '小囡', meaning: '小孩', scenario: '指小朋友' },
    ],
    localExperiences: [
      { name: '虞山茶园采茶', desc: '虞山绿茶是常熟特产，可体验采茶制茶', type: '时令', schedule: '清明前后' },
      { name: '方塔夜游', desc: '周末方塔园有灯光秀，古塔映水如梦', type: '民俗', schedule: '周末晚间' },
      { name: '古里镇赶集', desc: '铁琴铜剑楼所在的古里镇还保留着赶集传统', type: '赶集', schedule: '农历逢五逢十' },
    ],
    createdAt: new Date().toISOString(),
    tips: [
      '曾园和赵园相连，建议一起逛，免费开放',
      '铁琴铜剑楼在古里镇，距市区20分钟车程',
      '蕈油面最佳时节是9-11月，野生蕈最鲜',
      '虞山剑门建议坐索道上、走下来，省体力',
    ],
    entryType: '书籍',
    relatedBook: '《孽海花》',
    relatedAuthor: '曾朴',
    routeIntro: '《孽海花》是晚清四大谴责小说之一，作者曾朴是常熟人。小说以金雯青、傅彩云的故事为线索，写尽了晚清社会的浮华与沉沦。这条路线从曾朴家的园子出发，到铁琴铜剑楼看五代人守了一百年的书，在虞山剑门感受常熟文人的退隐之风——这里每一条街、每一座山，都曾出现在曾朴笔下。',
  },
  'wengtonghe': {
    id: 'wengtonghe',
    title: '翁同龢帝师之路',
    subtitle: '两代帝师的常熟足迹，从彩衣堂到虞山墓',
    city: '常熟',
    province: '江苏·苏州',
    days: 1,
    interests: ['文化', '体验', '美食'],
    budget: '舒适',
    dayPlans: buildDayPlans(wengtongheSpots, 1),
    dialect: [
      { dialect: '好勒', meaning: '好的/行了', scenario: '答应别人时说' },
      { dialect: '白相', meaning: '玩', scenario: '去白相 = 去玩' },
      { dialect: '弗要', meaning: '不要', scenario: '弗要客气 = 别客气' },
      { dialect: '蛮好', meaning: '很好', scenario: '评价风景美食' },
      { dialect: '啥辰光', meaning: '什么时候', scenario: '啥辰光走 = 什么时候走' },
    ],
    localExperiences: [
      { name: '虞山碑拓体验', desc: '虞山有大量历代摩崖石刻，可体验传统碑拓', type: '手艺' },
      { name: '翁府前书法', desc: '翁同龢纪念馆定期有书法体验活动', type: '手艺', schedule: '周末' },
      { name: '尚湖荷花季', desc: '翁同龢常去的尚湖，夏天满湖荷花', type: '时令', schedule: '6-8月' },
    ],
    createdAt: new Date().toISOString(),
    tips: [
      '彩衣堂的明代彩绘是国宝级文物，请勿使用闪光灯',
      '翁同龢墓在虞山深处，建议穿舒适的鞋',
      '虞山城墙免费，日落时分最美',
      '王四酒家的叫花鸡需提前2小时预约',
    ],
    entryType: '人物',
    relatedCharacter: '翁同龢',
    routeIntro: '翁同龢（1830-1904），常熟人，同治、光绪两代帝师，戊戌变法的重要推手。他被慈禧太后罢官后回到常熟，在虞山下度过了余生。这条路线从他的出生地彩衣堂开始，到他少年读书的读书台，再到他最终归葬的虞山墓——一天走完一个帝师的一生。每一个地点都有他亲笔写下的文字为证。',
  },
}

// ============================================================
//  首页入口卡片
// ============================================================

export const entryCards: EntryCard[] = [
  {
    id: 'shajiabang',
    type: '书籍',
    title: '《沙家浜》',
    subtitle: '红色经典·芦苇荡传奇',
    emoji: '🌾',
    target: 'shajiabang',
    desc: '跟着京剧经典走进真实的芦苇荡，在阿庆嫂的茶馆喝一杯茶',
    tags: ['红色经典', '芦苇荡', '阳澄湖'],
    route: '/guide/shajiabang',
    gradient: 'from-red-500/10 via-xuncheng-400/10 to-xuncheng-300/10',
  },
  {
    id: 'niehaifeng',
    type: '书籍',
    title: '《孽海花》',
    subtitle: '晚清浮世绘·文人曾朴',
    emoji: '📜',
    target: 'niehaifeng',
    desc: '从曾朴家的园子出发，寻访晚清常熟的文人世界',
    tags: ['谴责小说', '藏书楼', '虞山'],
    route: '/guide/niehaifeng',
    gradient: 'from-indigo-500/10 via-purple-400/10 to-xuncheng-300/10',
  },
  {
    id: 'wengtonghe',
    type: '人物',
    title: '翁同龢',
    subtitle: '两代帝师·常熟风骨',
    emoji: '🏛️',
    target: 'wengtonghe',
    desc: '从彩衣堂到虞山墓，一天走完两代帝师的一生',
    tags: ['帝师', '戊戌变法', '书法'],
    route: '/guide/wengtonghe',
    gradient: 'from-jade/10 via-emerald-400/10 to-xuncheng-300/10',
  },
]

/** 根据ID获取攻略 */
export function getMockGuideById(id: string): Guide | null {
  return mockGuides[id] || null
}

/** 根据搜索参数获取攻略（兼容旧接口） */
export function getMockGuide(city: string, days: number, interests: string[], budget: string): Guide {
  // 先尝试精确匹配
  const guide = mockGuides[city]
  if (guide) {
    return {
      ...guide,
      days,
      dayPlans: buildDayPlans(
        guide.dayPlans.flatMap(d => d.spots),
        days
      ),
    }
  }
  // 兜底返回第一条路线
  const firstGuide = Object.values(mockGuides)[0]
  return {
    ...firstGuide,
    city,
    days,
  }
}
