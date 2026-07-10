import { Guide, Spot, EntryCard } from '@/types'
import { cityGuides } from './city-guides'
import { nationalCityGuides } from './national-city-guides'
import { renjianziweiGuide } from './renjianziwei-guide'

// ============================================================
//  寻城 v2 Mock 数据 — 跟着书本去旅行
//  常熟主线 + 江苏省展示路线（扬州）
// ============================================================

// ──────────────────────────────────────
//  路线1：《沙家浜》— 红色经典 + 实地路线
// ──────────────────────────────────────
const shajiabangSpots: Spot[] = [
  {
    id: 'sjb-1', name: '春来茶馆', desc: '阿庆嫂的春来茶馆，戏里的故事从这里开始',
    duration: '1.5小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.5250, lng: 120.7280 }, address: '常熟市沙家浜镇芦苇荡路188号',
    story: '春来茶馆是京剧《沙家浜》的核心场景。阿庆嫂以茶馆老板娘的身份掩护新四军伤员，在日伪军面前周旋。历史上沙家浜确实有地下交通站，当年多位"阿庆嫂"式的人物在此活动。',
    type: '景点', budgetHint: '旺季100元/淡季70-80元', goodNow: true, goodNowReason: '上午游客少，适合慢慢品', photoSpot: true, emoji: '🍵',
    originalText: '"来的都是客，全凭嘴一张。相逢开口笑，过后不思量。"',
    originalSource: '京剧《沙家浜》·阿庆嫂唱词',
    realityNote: '如今的春来茶馆按戏中场景1:1还原，可入内喝茶，八仙桌、长条凳，和阿庆嫂时代别无二致。',
    culturalTag: '🎬影视', culturalTagDetail: '🎬 京剧《沙家浜》经典场景——阿庆嫂茶馆',
  },
  {
    id: 'sjb-2', name: '沙家浜芦苇荡', desc: '千亩芦苇荡，新四军藏身的水上迷宫',
    duration: '2.5小时', tags: ['自然', '历史'], timeSlot: '上午',
    location: { lat: 31.5220, lng: 120.7350 }, address: '常熟市沙家浜镇芦苇荡路188号',
    story: '芦苇荡是沙家浜的标志性景观，也是当年新四军伤员藏身之处。迷宫般的芦苇水道让日伪军无从搜寻。如今可以坐手摇船穿行芦苇丛中，感受当年水上游击的惊险。',
    type: '体验', budgetHint: '船票60元', goodNow: true, goodNowReason: '上午芦苇间光线最美', photoSpot: true, emoji: '🌾',
    originalText: '"芦花放，稻谷香，岸柳成行。"',
    originalSource: '京剧《沙家浜》·郭建光唱词',
    realityNote: '秋天来最应景——芦花飞雪，稻谷金黄，和戏中唱的一模一样。手摇船穿过芦苇迷宫，水道至今保持着当年的走势。',
    culturalTag: '🎬影视', culturalTagDetail: '🎬 京剧《沙家浜》——新四军芦苇荡藏身地',
  },
  {
    id: 'sjb-3', name: '阳澄湖大闸蟹', desc: '就在阳澄湖边，吃的就是湖里捞上来的',
    duration: '1.5小时', tags: ['美食'], timeSlot: '下午',
    location: { lat: 31.5300, lng: 120.7400 }, address: '常熟市沙家浜镇芦苇荡路188号',
    story: '沙家浜就在阳澄湖畔，这里是阳澄湖大闸蟹的核心产区。不同于上海苏州的蟹庄溢价，在产地吃不仅更新鲜，价格也实在。九月开捕季来，一蟹三吃（清蒸、蟹粉豆腐、蟹黄面）能鲜到怀疑人生。',
    type: '美食', budgetHint: '人均100-180元', goodNow: false, goodNowReason: '9-11月蟹季最佳', emoji: '🦀',
    originalText: '"西风响，蟹脚痒。"',
    originalSource: '江南谚语',
    realityNote: '阳澄湖边的蟹庄每年9月开捕，当地人认准"戴戒指"（防伪扣）的湖蟹。在沙家浜吃蟹，窗外就是阳澄湖。',
    culturalTag: '🎬影视', culturalTagDetail: '🎬 京剧《沙家浜》故事发生地——阳澄湖畔',
  },
  {
    id: 'sjb-4', name: '横泾老街', desc: '《沙家浜》影视剧取景地，老街还是那个老街',
    duration: '1.5小时', tags: ['文化', '体验'], timeSlot: '下午',
    location: { lat: 31.5260, lng: 120.7300 }, address: '常熟市沙家浜镇芦苇荡路188号',
    story: '横泾老街保留了江南水乡的原始格局，是电视剧《沙家浜》的取景地。石板路沿河铺开，老房子里还住着当地人。比起周庄同里，这里安静得不像景区。',
    type: '景点', budgetHint: '免费', goodNow: true, goodNowReason: '下午散步最佳', photoSpot: true, emoji: '🏘️',
    originalText: '"朝霞映在阳澄湖上，芦花放稻谷香岸柳成行。"',
    originalSource: '京剧《沙家浜》·开场合唱',
    realityNote: '走在横泾老街的石板路上，河对岸白墙黛瓦倒映水中，和半个世纪前剧组看到的风景几乎一样。',
    culturalTag: '🎬影视', culturalTagDetail: '🎬 电视剧《沙家浜》取景地——横泾老街',
  },
  {
    id: 'sjb-5', name: '沙家浜革命历史纪念馆', desc: '那些真实发生过的事，比戏更震撼',
    duration: '1小时', tags: ['文化', '历史'], timeSlot: '下午',
    location: { lat: 31.5240, lng: 120.7290 }, address: '常熟市沙家浜镇芦苇荡路188号',
    story: '纪念馆用大量实物和影像还原了当年新四军在阳澄湖畔养伤、斗争的真实历史。最触动的是"36个伤病员"的故事——他们在芦苇荡中养伤，在当地百姓掩护下全部康复归队。这段历史比任何戏剧都更动人。',
    type: '景点', budgetHint: '旺季100元/淡季70-80元', emoji: '🏛️',
    originalText: '"要学那泰山顶上一青松，挺然屹立傲苍穹。"',
    originalSource: '京剧《沙家浜》·郭建光唱段',
    realityNote: '馆内陈列着当年新四军使用过的医疗器械、武器和百姓的掩护用具。实物比戏更有力量。',
    culturalTag: '🎬影视', culturalTagDetail: '🎬 京剧《沙家浜》——真实历史原型纪念馆',
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
    culturalTag: '🎬影视', culturalTagDetail: '🎬 京剧《沙家浜》故事地——常熟叫花鸡',
  },
]

// ──────────────────────────────────────
//  路线2：《孽海花》— 常熟文人曾朴的晚清浮世绘
// ──────────────────────────────────────
const niehaifengSpots: Spot[] = [
  {
    id: 'nhf-1', name: '曾园（虚廓园）', desc: '曾朴家的园子，小说里写的那些事就在这儿发生',
    duration: '2小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.6500, lng: 120.7400 }, address: '常熟市翁府前7号',
    story: '曾园是晚清常熟望族曾家的私家园林，《孽海花》作者曾朴就生长于此。园中亭台楼阁、小桥流水，处处透着江南文人园林的精致。曾朴在这里度过的少年时光，成为小说中许多场景的原型。',
    type: '景点', budgetHint: '免费', goodNow: true, goodNowReason: '清晨园中无人，最可体味', photoSpot: true, emoji: '🏡',
    originalText: '"那园子虽不甚大，却也亭台曲折，花木扶疏，颇有几分雅致。"',
    originalSource: '曾朴《孽海花》第一回',
    realityNote: '曾园现为虞山公园的一部分，免费开放。园中照山楼、不碍云山楼等建筑保存完好，和曾朴笔下的格局基本一致。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 曾朴《孽海花》——作者曾朴故宅园林',
  },
  {
    id: 'nhf-2', name: '铁琴铜剑楼', desc: '中国四大藏书楼之一，瞿氏五代人守了一百年的书',
    duration: '1.5小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.6550, lng: 120.7500 }, address: '常熟市古里镇铁琴铜剑楼',
    story: '铁琴铜剑楼是清代四大私家藏书楼之一，与宁波天一阁齐名。瞿氏家族五代人倾尽家财收藏古籍善本，最盛时藏书十余万卷。抗战时期，瞿家后人冒死将珍本转移，使大量孤本免于战火。这种"以命护书"的精神，和《孽海花》中描写的晚清文人风骨一脉相承。',
    type: '景点', budgetHint: '免费', emoji: '📚',
    originalText: '"铁琴铮铮，铜剑光寒。藏书万卷，不负青山。"',
    originalSource: '瞿氏铁琴铜剑楼旧联',
    realityNote: '铁琴铜剑楼已修复开放，可看到瞿家当年藏书的楼阁原貌。楼内有部分珍贵刻本展出，值得细细看。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 中国四大藏书楼之一——铁琴铜剑楼',
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
    culturalTag: '📖书籍', culturalTagDetail: '📖 常熟文人日常——蕈油面前世今生',
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
    culturalTag: '🏃运动', culturalTagDetail: '🏃 中国森林氧吧——虞山',
  },
  {
    id: 'nhf-5', name: '方塔', desc: '南宋古塔，常熟城里最老的建筑',
    duration: '1小时', tags: ['文化', '历史'], timeSlot: '下午',
    location: { lat: 31.6480, lng: 120.7450 }, address: '常熟市环城东路28号',
    story: '方塔建于南宋建炎四年（1130年），因塔身呈方形而得名，是常熟现存最古老的建筑。塔下有南宋古井和银杏树，树龄超过800年。曾朴在《孽海花》中多次写到方塔——这是常熟城的标志，文人墨客的地理锚点。',
    type: '景点', budgetHint: '方塔园免费/登塔10元', photoSpot: true, emoji: '🗼',
    originalText: '"方塔耸立，飞檐如翼，城中望之，如在目前。"',
    originalSource: '曾朴《孽海花》相关描写',
    realityNote: '方塔周围已辟为方塔园，园内古井、古银杏均为南宋遗物。塔身可登，九层四面，每层都是常熟城不同角度的画卷。',
    culturalTag: '🎵音乐', culturalTagDetail: '🎵 虞山琴派UNESCO古琴艺术保护地',
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
    culturalTag: '📖书籍', culturalTagDetail: '📖 常熟文人秋日记忆——桂花酒酿圆子',
  },
]

// ──────────────────────────────────────
//  路线3：翁同龢 — 两代帝师的常熟足迹
// ──────────────────────────────────────
const wengtongheSpots: Spot[] = [
  {
    id: 'wth-1', name: '彩衣堂（翁同龢纪念馆）', desc: '翁家老宅，帝师从这里走出',
    duration: '2小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.6520, lng: 120.7420 }, address: '常熟市翁家巷门2号（翁同龢纪念馆）',
    story: '彩衣堂是翁同龢的出生地和少年居所，始建于明代，是江南保存最完好的明代建筑群之一。翁同龢在此度过了18年，从蒙童到状元。"彩衣"取自"老莱子彩衣娱亲"的典故，是翁家孝道家风的象征。堂内明代彩绘建筑至今色彩可辨，全国罕见。',
    type: '景点', budgetHint: '20元', goodNow: true, goodNowReason: '上午人少，可静心感受', photoSpot: true, emoji: '🏛️',
    originalText: '"每念先帝付托之重，不敢以老病自懈。"',
    originalSource: '翁同龢日记·光绪二十四年',
    realityNote: '彩衣堂内最珍贵的是明代建筑彩绘——500多年前的苏式彩画，在国内民居中极为罕见。翁同龢的书房按原样布置，笔墨纸砚如旧。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 帝师故居——翁同龢纪念馆',
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
    culturalTag: '📖书籍', culturalTagDetail: '📖 帝师翁同龢少年读书处——虞山读书台',
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
    culturalTag: '📖书籍', culturalTagDetail: '📖 翁同龢日记中记载的虞山素面',
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
    culturalTag: '📖书籍', culturalTagDetail: '📖 帝师翁同龢归葬之地——虞山鹁鸽峰',
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
    culturalTag: '📖书籍', culturalTagDetail: '📖 翁同龢日记中的虞山城墙远眺',
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
    culturalTag: '📖书籍', culturalTagDetail: '📖 翁同龢日记中记载的常熟叫花鸡',
  },
]

// ──────────────────────────────────────
//  路线4：钱谦益与柳如是 — 乱世情缘
// ──────────────────────────────────────
const qianliuSpots: Spot[] = [
  {
    id: 'ql-1', name: '半野堂旧址', desc: '钱柳初遇之处，虞山脚下的一场惊鸿',
    duration: '1.5小时', tags: ['文化', '历史'], timeSlot: '上午',
    location: { lat: 31.6480, lng: 120.7400 }, address: '常熟市虞山南路（兴福寺）',
    story: '崇祯十三年（1640年），柳如是女扮男装，以"柳儒士"之名拜访钱谦益于半野堂。钱谦益见其才情惊人，当即赋诗相赠，两人从此结缘。半野堂虽已不存，但虞山南路一带仍可寻踪。',
    type: '景点', budgetHint: '免费', emoji: '🏯',
    originalText: '"逢人已觉无意味，遇汝方知有此生。"',
    originalSource: '钱谦益《半野堂赠柳如是》',
    realityNote: '半野堂原址在虞山南麓，现已不存。虞山南路沿途有指示牌标注历史遗迹位置，可驻足遥想当年。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 钱柳情缘初遇之地——半野堂旧址',
    interactiveTask: {
      type: '诗词诵读', title: '诵读钱柳定情诗', description: '品读钱谦益与柳如是初遇时的诗词',
      poem: '逢人已觉无意味，遇汝方知有此生。\n——钱谦益《半野堂赠柳如是》',
    },
  },
  {
    id: 'ql-2', name: '红豆山庄', desc: '钱柳定情之地，三百年红豆树犹在',
    duration: '2小时', tags: ['文化', '自然'], timeSlot: '上午',
    location: { lat: 31.6350, lng: 120.7680 }, address: '常熟市古里镇红豆山庄',
    story: '钱谦益为柳如是建红豆山庄，庄中植红豆树一株。据传钱谦益曾在红豆花开时赋诗："红豆生南国，春来发几枝"——虽化用王维，却有了新的情意。如今红豆树仍在，春季深红如绛。',
    type: '景点', budgetHint: '30元', goodNow: true, goodNowReason: '春季红豆花开时最美', photoSpot: true, emoji: '🌿',
    originalText: '"红豆初生，如相思之渐深。"',
    originalSource: '钱谦益《红豆诗》',
    realityNote: '红豆山庄已修复开放，庄内红豆树为清代补植，但树龄仍超百年。4-5月花期最盛，绛红色花簇如旧。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 钱柳定情之地——红豆山庄',
    interactiveTask: {
      type: '诗词诵读', title: '诵读红豆诗词', description: '在红豆树下，品读钱谦益的红豆诗和王维的相思',
      poem: '红豆生南国，春来发几枝。\n愿君多采撷，此物最相思。\n——王维《相思》',
    },
  },
  {
    id: 'ql-3', name: '尚湖风景区', desc: '钱柳泛舟唱和之地，湖光山色如旧',
    duration: '3小时', tags: ['自然', '体验'], timeSlot: '下午',
    location: { lat: 31.6300, lng: 120.7200 }, address: '常熟市尚湖风景区',
    story: '钱谦益与柳如是常在尚湖上泛舟唱和，留下大量诗篇。柳如是尤善填词，"金明池·咏寒柳"便是在尚湖舟中所作。如今尚湖仍可泛舟，湖面开阔，远望虞山如屏。',
    type: '景点', budgetHint: '80元（含船票）', goodNow: true, goodNowReason: '下午光线好，适合泛舟拍照', emoji: '🚣',
    originalText: '"有恨寒潮，无情残照，正是萧萧南浦。"',
    originalSource: '柳如是《金明池·咏寒柳》',
    realityNote: '尚湖是常熟最大湖泊，可租电动船或手划船环湖。推荐从拂水堤上船，沿钱柳当年可能泛舟的水域行进。',
    culturalTag: '🏃运动', culturalTagDetail: '🏃 常熟尚湖半程马拉松最美赛道',
    interactiveTask: {
      type: '诗词诵读', title: '诗词唱和', description: 'AI与你对诗——吟出上句，等你接下句',
      poem: '有恨寒潮，无情残照，正是萧萧南浦。\n更吹起，霜条孤影，还记得，旧时飞絮。\n——柳如是《金明池·咏寒柳》',
    },
  },
  {
    id: 'ql-4', name: '铁琴铜剑楼', desc: '清末四大藏书楼之一，钱氏文脉绵延',
    duration: '1.5小时', tags: ['文化'], timeSlot: '下午',
    location: { lat: 31.6380, lng: 120.7650 }, address: '常熟市古里镇铁琴铜剑楼',
    story: '铁琴铜剑楼是瞿氏家族的藏书楼，与钱谦益的绛云楼一脉相承。钱谦益绛云楼藏书为当世之冠，后毁于大火；瞿氏承其遗风，使常熟藏书传统绵延不绝。楼内现存古籍善本数千册。',
    type: '景点', budgetHint: '免费', emoji: '📚',
    originalText: '"绛云楼上万余卷，半是平生心血来。"',
    originalSource: '钱谦益《绛云楼题跋》',
    realityNote: '铁琴铜剑楼已修复为纪念馆，展示瞿氏藏书历史和部分善本。古里镇本身也是江南水乡，值得慢慢走走。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 中国四大藏书楼之一——铁琴铜剑楼',
    interactiveTask: {
      type: '古籍寻宝', title: '古籍寻宝游戏', description: '古文中藏着一处错字，你能找出来吗？',
      treasureOriginal: '铁琴铮铮，铜剑光寒。藏书万卷，不负青山。',
      treasureTampered: '铁琴铮铮，铜剑光寒。藏书万卷，不负青川。',
    },
  },
  {
    id: 'ql-5', name: '虞山钱柳墓', desc: '乱世情缘的最后归宿，比邻而葬',
    duration: '1小时', tags: ['文化', '历史'], timeSlot: '下午',
    location: { lat: 31.6450, lng: 120.7350 }, address: '虞山南麓',
    story: '钱谦益与柳如是合葬于虞山南麓，两墓相距数十步。钱谦益墓碑简朴，柳如是墓稍偏——即使在死后，礼教的阴影仍让这位奇女子无法与夫君并肩。但两墓近在咫尺，也算是一种沉默的抗争。',
    type: '景点', budgetHint: '免费', emoji: '🪦',
    originalText: '"此去泉台应不远，一丘一壑任悠悠。"',
    originalSource: '钱谦益绝笔',
    realityNote: '钱柳墓在虞山南麓深处，需沿山路步行约15分钟。墓区清幽，游客稀少，适合静思。建议傍晚前往，夕阳下的虞山格外肃穆。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 钱柳乱世情缘最后归宿——虞山合葬',
    interactiveTask: {
      type: '诗词诵读', title: '诵读绝命词', description: '钱谦益临终之作，字字泣血',
      poem: '此去泉台应不远，一丘一壑任悠悠。\n——钱谦益绝笔',
    },
  },
  {
    id: 'ql-6', name: '蕈油面', desc: '虞山三宝之一，菌菇鲜到眉毛掉',
    duration: '1小时', tags: ['美食'], timeSlot: '中午',
    location: { lat: 31.6500, lng: 120.7410 }, address: '虞山脚下兴福寺旁',
    story: '蕈油面用虞山野生菌菇熬制浇头，是常熟最有特色的早餐。松蕈、桂花蕈、栗蕈——不同季节有不同的菌，但都鲜到让人闭眼。柳如是当年是否也在这山间吃过面？史料无载，但味觉传统千年未变。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 钱柳时代延续至今的虞山蕈油面',
    type: '美食', budgetHint: '25-40元', emoji: '🍜',
    originalText: '"山中之蕈，味胜肉食。"',
    originalSource: '常熟方志',
    realityNote: '兴福寺旁的望岳楼老面馆最正宗，用当天采摘的虞山鲜蕈做浇头。午餐高峰需排队，建议11点前到。',
  },
  {
    id: 'ql-7', name: '桂花酒酿圆子', desc: '柳如是也写过的甜蜜滋味',
    duration: '30分钟', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 31.6520, lng: 120.7420 }, address: '方塔街老店',
    story: '常熟的桂花酒酿圆子是江南甜食的代表作。小圆子软糯，酒酿清甜，桂花飘香——这种温柔的味道，和柳如是笔下的"桂棹兰舟"意象不谋而合。',
    type: '美食', budgetHint: '15元', emoji: '🍡',
    originalText: '"桂花香里说丰年，听取蛙声一片。"',
    originalSource: '辛弃疾《西江月》',
    realityNote: '方塔街上多家老店都有，推荐"桂花坊"，手工圆子现煮，桂花酱是自家酿的。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 柳如是笔下江南甜味——桂花酒酿圆子',
    interactiveTask: {
      type: '知识问答', title: '钱柳知识问答', description: '关于钱谦益与柳如是的故事，你知道多少？',
      questions: [
        { question: '钱谦益与柳如是初遇的地方叫什么？', options: ['半野堂', '红豆山庄', '绛云楼', '尚湖'], answer: 0 },
        { question: '柳如是原姓什么？', options: ['杨', '柳', '钱', '陈'], answer: 0 },
        { question: '钱谦益绛云楼的藏书最终遭遇了什么？', options: ['毁于火灾', '被朝廷没收', '捐赠天一阁', '流传至今'], answer: 0 },
      ],
    },
  },
  {
    id: 'ql-8', name: '虞山碑刻博物馆', desc: '钱谦益笔墨犹存，柳如是书法可辨',
    duration: '1.5小时', tags: ['文化'], timeSlot: '上午',
    location: { lat: 31.6500, lng: 120.7380 }, address: '虞山国家森林公园内',
    story: '虞山碑林中存有钱谦益等多位文人的手迹碑刻。钱谦益书法遒劲，柳如是虽无碑刻传世，但其书法风格在同时代文人题跋中可窥一斑。碑林清幽，是山中最佳的静思之处。',
    type: '景点', budgetHint: '免费', emoji: '🖋️',
    originalText: '"虞山之石可刻字，虞山之人不可忘。"',
    originalSource: '虞山志',
    realityNote: '碑刻博物馆在虞山国家森林公园入口附近，与兴福寺相邻。可先看碑刻再登山，约需1.5小时。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 钱谦益笔墨遗存——虞山碑刻',
    interactiveTask: {
      type: '书法临摹', title: '书法临摹', description: '试一笔钱谦益风格，感受文人笔墨',
      calligraphyText: '牧斋',
    },
  },
]


// ──────────────────────────────────────
//  展示路线：扬州「烟花三月」— 江苏省文旅打卡标杆
//  文学线索：李白《黄鹤楼送孟浩然之广陵》+ 姜夔《扬州慢》
// ──────────────────────────────────────
const yangzhouSpots: Spot[] = [
  {
    id: 'yz-1', name: '瘦西湖', desc: '五亭桥、二十四桥，诗里的扬州就在这里',
    duration: '3小时', tags: ['文化', '自然'], timeSlot: '上午',
    location: { lat: 32.4080, lng: 119.4210 }, address: '扬州市邗江区大虹桥路28号',
    story: '瘦西湖原名保障湖，清代乾隆年间形成今日格局。园内五亭莲桥、白塔、二十四桥，是扬州园林的巅峰。李白送孟浩然「烟花三月下扬州」，姜夔写「二十四桥仍在」——两座文学丰碑，都指向这片湖水。',
    type: '景点', budgetHint: '门票95元', goodNow: true, goodNowReason: '三月至五月烟花季最美', photoSpot: true, emoji: '🏯',
    originalText: '故人西辞黄鹤楼，烟花三月下扬州。孤帆远影碧空尽，唯见长江天际流。',
    originalSource: '李白《黄鹤楼送孟浩然之广陵》',
    realityNote: '瘦西湖南门入园，建议先走五亭桥再到二十四桥。春季桃红柳绿，与李白诗中「烟花」意境最合。游船可穿行桥下，体验「画舫听箫声一夜，看红灯千盏」的意境。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 李白"烟花三月下扬州"·姜夔"二十四桥仍在"',
  },
  {
    id: 'yz-2', name: '个园', desc: '四季假山，一步一景，竹西佳处的私家园林',
    duration: '1.5小时', tags: ['文化', '体验'], timeSlot: '上午',
    location: { lat: 32.4010, lng: 119.4490 }, address: '扬州市广陵区盐阜东路10号',
    story: '个园为清代盐商黄至筠所建，以竹石见长，园中四季假山用不同石材营造春夏秋冬四景，是中国园林艺术的孤例。姜夔《扬州慢》起句「淮左名都，竹西佳处」，竹西即扬州城北一带，个园正在此域。',
    type: '景点', budgetHint: '门票45元', photoSpot: true, emoji: '🎋',
    originalText: '淮左名都，竹西佳处，解鞍少驻初程。',
    originalSource: '姜夔《扬州慢·淮左名都》',
    realityNote: '个园与东关街相邻，可从北门出直接步入古街。园中宜园小筑的月亮门是拍照经典机位，建议沿春→夏→秋→冬顺序穿假山。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 姜夔"淮左名都，竹西佳处"',
  },
  {
    id: 'yz-3', name: '大明寺', desc: '栖灵塔下，鉴真东渡前的最后一站',
    duration: '1.5小时', tags: ['文化', '历史'], timeSlot: '下午',
    location: { lat: 32.4220, lng: 119.4150 }, address: '扬州市邗江区平山堂东路8号',
    story: '大明寺始建于南朝，栖灵塔为隋文帝杨坚为纪念阵亡将士而建。唐代高僧鉴真曾在此讲经，后六次东渡日本。寺旁平山堂为欧阳修所建，苏轼、秦观皆曾登临赋诗，是扬州文人传统的地标。',
    type: '景点', budgetHint: '门票免费，栖灵塔另收', emoji: '🛕',
    originalText: '山横翠霭千层合，水抱芳洲两岸分。',
    originalSource: '欧阳修《题平山堂》',
    realityNote: '大明寺在蜀冈之巅，与瘦西湖仅一墙之隔。登栖灵塔可俯瞰瘦西湖全景，是理解「淮左名都」地理格局的最佳视角。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 欧阳修平山堂赋诗之地',
  },
  {
    id: 'yz-4', name: '东关街', desc: '千年古街，淮扬味道与市井烟火',
    duration: '2小时', tags: ['文化', '美食'], timeSlot: '下午',
    location: { lat: 32.3960, lng: 119.4550 }, address: '扬州市广陵区东关街',
    story: '东关街形成于唐代，是扬州城东门外的商业主轴。街上有盐商宅邸、手工作坊、茶馆酒楼，至今仍是本地人买酱菜、吃早茶的地方。扬州评话、清曲在此传唱，是感受「慢活扬州」的最佳街区。',
    type: '体验', budgetHint: '自由消费', goodNow: true, goodNowReason: '傍晚华灯初上最有烟火气', photoSpot: true, emoji: '🏮',
    originalText: '腰缠十万贯，骑鹤上扬州。',
    originalSource: '宋·俚谚',
    realityNote: '东关街从个园北门到古运河码头，约1.2公里。建议傍晚前往，赵氏叠汤圆、四美红庙豆腐脑等老店仍在，非景区预制小吃。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 "腰缠十万贯，骑鹤上扬州"',
  },
  {
    id: 'yz-5', name: '富春茶社', desc: '蟹黄汤包、三丁包，淮扬早茶的百年老店',
    duration: '1小时', tags: ['美食'], timeSlot: '中午',
    location: { lat: 32.3970, lng: 119.4540 }, address: '扬州市广陵区国庆路218号',
    story: '富春茶社创于1885年，与冶春、共和春并称扬州「三春」。蟹黄汤包以「轻轻提，慢慢移，先开窗、后喝汤」的吃法闻名，三丁包用鸡丁、肉丁、笋丁为馅，是淮扬点心的代表作。',
    type: '美食', budgetHint: '人均50-80元', goodNow: true, goodNowReason: '早茶7:00起，宜做午餐', emoji: '🥟',
    originalText: '天下三分明月夜，二分无赖是扬州。',
    originalSource: '徐凝《忆扬州》',
    realityNote: '国庆路总店最正宗，周末需排队。建议点蟹黄汤包、三丁包、魁龙珠茶，避开景区旁的高价仿店。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 徐凝"天下三分明月夜，二分无赖是扬州"',
  },
  {
    id: 'yz-6', name: '何园', desc: '晚清第一园，复道回廊串联六进院落',
    duration: '1.5小时', tags: ['文化'], timeSlot: '下午',
    location: { lat: 32.3890, lng: 119.4580 }, address: '扬州市广陵区徐凝门大街66号',
    story: '何园又名寄啸山庄，清光绪年间何芷舠所建。园中1500米复道回廊为中国园林孤例，串联起六进院落与山水层台。朱自清曾在扬州任教，多次来访何园，其散文中的扬州意象与这座园林的精致相通。',
    type: '景点', budgetHint: '门票45元', photoSpot: true, emoji: '🏡',
    originalText: '天下三分明月夜，二分无赖是扬州。',
    originalSource: '徐凝《忆扬州》',
    realityNote: '何园复道回廊是摄影经典，建议从东门入、沿回廊上至二楼俯瞰水心亭。与个园风格不同，更见晚清中西交融的痕迹。',
    culturalTag: '🎬影视', culturalTagDetail: '🎬 影视剧取景地——晚清第一园何园',
  },
  {
    id: 'yz-7', name: '史可法纪念馆', desc: '梅花岭上，忠义气节与扬州城防记忆',
    duration: '1小时', tags: ['文化', '历史'], timeSlot: '晚上',
    location: { lat: 32.4010, lng: 119.4420 }, address: '扬州市邗江区史可法路1号',
    story: '明末清初，史可法守扬州，城破后殉难于梅花岭。姜夔作《扬州慢》时，扬州历经兵火，「尽荠麦，弥望无际」——与今日繁华形成对照。纪念馆内古银杏、铁骨梅花，是理解扬州历史纵深的一站。',
    type: '景点', budgetHint: '免费', emoji: '🌸',
    originalText: '自胡马窥江去后，废池乔木，犹厌言兵。',
    originalSource: '姜夔《扬州慢·淮左名都》',
    realityNote: '纪念馆在城北，与瘦西湖、个园构成三角。园内梅花冬末春初盛开，与姜夔词中「念桥边红药，年年知为谁生」意境呼应。',
    culturalTag: '📖书籍', culturalTagDetail: '📖 姜夔"废池乔木，犹厌言兵"',
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
  'qianliu': {
    id: 'qianliu',
    title: '钱柳乱世情缘',
    subtitle: '钱谦益与柳如是的虞山足迹，一段明末乱世中的传奇情缘',
    city: '常熟',
    province: '江苏·苏州',
    days: 2,
    interests: ['文化', '美食', '自然'],
    budget: '舒适',
    dayPlans: buildDayPlans(qianliuSpots, 2),
    dialect: [
      { dialect: '好勒', meaning: '好的/行了', scenario: '答应别人时说' },
      { dialect: '白相', meaning: '玩', scenario: '去白相 = 去玩' },
      { dialect: '弗要', meaning: '不要', scenario: '弗要客气 = 别客气' },
      { dialect: '蛮好', meaning: '很好', scenario: '评价风景美食' },
      { dialect: '阿要', meaning: '要不要', scenario: '阿要吃茶 = 要不要喝茶' },
    ],
    localExperiences: [
      { name: '尚湖泛舟', desc: '在钱柳泛舟之处租一小船，感受湖光山色', type: '体验', schedule: '全天' },
      { name: '红豆山庄赏花', desc: '春季红豆花开，深红如旧，三百年情缘在花间', type: '时令', schedule: '4-5月' },
      { name: '虞山书法体验', desc: '在碑林旁体验毛笔书写，感受钱谦益的笔墨意境', type: '手艺', schedule: '周末' },
    ],
    createdAt: new Date().toISOString(),
    tips: [
      '红豆山庄春季最美，红豆花开如绛云',
      '尚湖景区较大，建议乘船游湖，步行会很累',
      '钱谦益墓与柳如是墓相距数十步，都在虞山南麓深处',
      '铁琴铜剑楼在古里镇，距市区约20分钟车程',
    ],
    entryType: '书籍',
    relatedBook: '《柳如是别传》',
    relatedAuthor: '陈寅恪',
    routeIntro: '钱谦益（1582-1664），明末文坛领袖，"江左三大家"之一；柳如是（1618-1664），明末"秦淮八艳"之首，才情绝世。两人的爱情跨越了乱世，从南京秦淮到常熟虞山，从半野堂到红豆山庄，留下无数诗篇与传奇。陈寅恪以双目失明之躯，穷十年之力撰写《柳如是别传》，为这对乱世情人立传。这条路线带你走进他们的世界——红豆树下的定情、尚湖上的唱和、虞山南麓的合葬——每一个地点都有诗词为证。',
  },
  'yangzhou': {
    id: 'yangzhou',
    title: '烟花三月下扬州',
    subtitle: '跟着李白与姜夔，走进千年淮左名都',
    city: '扬州',
    province: '江苏',
    days: 2,
    interests: ['文化', '美食', '自然'],
    budget: '舒适',
    dayPlans: buildDayPlans(yangzhouSpots, 2),
    dialect: [
      { dialect: '乖乖隆地冬', meaning: '天哪/好厉害', scenario: '表示惊讶' },
      { dialect: '阿要', meaning: '要不要', scenario: '阿要吃早茶 = 要不要吃早茶' },
      { dialect: '蛮好', meaning: '很好', scenario: '瘦西湖蛮好 = 瘦西湖不错' },
      { dialect: '慢活', meaning: '悠闲自在', scenario: '扬州人生活节奏慢' },
      { dialect: '三把刀', meaning: '菜刀、剪刀、剃刀', scenario: '扬州三把刀指厨艺、理发、修脚' },
    ],
    localExperiences: [
      { name: '瘦西湖夜游', desc: '灯光映照五亭桥，与白日景致截然不同', type: '民俗', schedule: '周末晚间' },
      { name: '三月烟花季', desc: '桃红柳绿，对应李白「烟花三月下扬州」', type: '时令', schedule: '3-5月' },
      { name: '淮扬早茶体验', desc: '富春、冶春、共和春，三丁包与蟹黄汤包', type: '手艺', schedule: '每日上午' },
    ],
    createdAt: new Date().toISOString(),
    tips: [
      '瘦西湖与大明寺相邻，可安排同一天游览',
      '个园、东关街、富春茶社步行可达，建议连在一起',
      '春季3-5月是最佳时节，对应「烟花三月」',
      '淮扬菜偏甜鲜，推荐大煮干丝、狮子头、文思豆腐',
    ],
    entryType: '目的地',
    relatedBook: '《扬州慢》',
    relatedAuthor: '姜夔 / 李白',
    routeIntro: '「烟花三月下扬州」——李白这句诗让扬州成为中国最诗意的城市名。千年后，姜夔再访扬州，写下「二十四桥仍在，波心荡，冷月无声」。这条展示路线带你走进江苏省最具知名度的文旅目的地：瘦西湖的五亭桥、个园的四季假山、大明寺的栖灵塔、东关街的烟火气——诗词里写的，脚下都能走到。',
  },
  'renjianziwei': renjianziweiGuide,
  ...cityGuides,
  ...nationalCityGuides,
}

// ============================================================
//  首页入口卡片
// ============================================================

export const entryCards: EntryCard[] = [
  // ── 城市路线（江苏省）──
  {
    id: 'yangzhou',
    type: '目的地',
    title: '烟花三月下扬州',
    subtitle: '淮左名都 · 瘦西湖',
    emoji: '🌸',
    target: 'yangzhou',
    desc: '李白千古名句，瘦西湖、个园、大明寺——江苏文旅打卡标杆',
    tags: ['展示推荐', '瘦西湖', '淮扬美食'],
    route: '/guide/yangzhou',
    gradient: 'from-celadon-100/30 via-camel/20 to-celadon-200/20',
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Five_Pavilion_Bridge_in_Yangzhou%27s_Slender_West_Lake.jpg/800px-Five_Pavilion_Bridge_in_Yangzhou%27s_Slender_West_Lake.jpg',
    days: 2,
    priceHint: '约200元/天',
  },
  {
    id: 'nanjing',
    type: '目的地',
    title: '桨声灯影南京',
    subtitle: '秦淮河 · 六朝金陵',
    emoji: '🏮',
    target: 'nanjing',
    desc: '朱自清名篇，夫子庙夜游、鸡鸣寺樱花、玄武湖',
    tags: ['秦淮河', '鸭血粉丝', '樱花'],
    route: '/guide/nanjing',
    gradient: 'from-celadon-100/30 via-ink-100/20 to-camel/20',
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Qinhuai_River_Night_View.jpg/800px-Qinhuai_River_Night_View.jpg',
    days: 2,
    priceHint: '约180元/天',
  },
  {
    id: 'suzhou',
    type: '目的地',
    title: '姑苏浮生',
    subtitle: '拙政园 · 平江路',
    emoji: '🏯',
    target: 'suzhou',
    desc: '沈复与张继，园林、水巷、寒山寺钟声',
    tags: ['园林', '平江路', '苏帮菜'],
    route: '/guide/suzhou',
    gradient: 'from-celadon-200/20 via-camel/30 to-celadon-100/20',
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Humble_Administrator%27s_Garden.jpg/800px-Humble_Administrator%27s_Garden.jpg',
    days: 2,
    priceHint: '约200元/天',
  },
  {
    id: 'wuxi',
    type: '目的地',
    title: '太湖鼋头渚',
    subtitle: '樱花 · 小笼 · 泥人',
    emoji: '🌊',
    target: 'wuxi',
    desc: '太湖佳绝处，鼋头渚樱花、惠山古镇、无锡小笼',
    tags: ['太湖', '樱花', '小笼包'],
    route: '/guide/wuxi',
    gradient: 'from-celadon-100/30 via-camel/20 to-celadon-300/10',
    coverImage: 'https://images.unsplash.com/photo-1585435557343-aa53f57c7d00?w=800&q=80',
    days: 1,
    priceHint: '约150元/天',
  },
  {
    id: 'zhenjiang',
    type: '目的地',
    title: '三山镇江',
    subtitle: '金山寺 · 锅盖面',
    emoji: '⛩️',
    target: 'zhenjiang',
    desc: '白蛇传金山寺、焦山碑林、西津渡古街',
    tags: ['金山寺', '锅盖面', '长江'],
    route: '/guide/zhenjiang',
    gradient: 'from-camel/30 via-celadon-100/20 to-ink-100/10',
    coverImage: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800&q=80',
    days: 1,
    priceHint: '约120元/天',
  },
  // ── 书籍路线 ──
  {
    id: 'renjianziwei',
    type: '书籍',
    title: '《人间滋味》',
    subtitle: '汪曾祺 · 四方食事',
    emoji: '🥢',
    target: 'renjianziwei',
    desc: '一本书+一个人+一座城。高邮咸鸭蛋、全国美食地图、人生四阶段',
    tags: ['展示推荐', '美食散文', '高邮', '汪曾祺'],
    route: '/guide/renjianziwei',
    gradient: 'from-food-paper/50 via-food-sauce/10 to-food-veg/10',
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Salted_duck_egg.jpg/640px-Salted_duck_egg.jpg',
    days: 1,
    priceHint: '约150元/天',
  },
  // ── 常熟文学路线 ──
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
    coverImage: 'https://images.unsplash.com/photo-1501785888041-af3bcb1dd4?w=800&q=80',
    days: 1,
    priceHint: '约150元/天',
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
    coverImage: 'https://images.unsplash.com/photo-1599579676330-89393406983e?w=800&q=80',
    days: 2,
    priceHint: '约200元/天',
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
    coverImage: 'https://images.unsplash.com/photo-1529928520614-829854c79449?w=800&q=80',
    days: 1,
    priceHint: '约180元/天',
  },
  {
    id: 'qianliu',
    type: '书籍',
    title: '《柳如是别传》',
    subtitle: '乱世情缘·钱柳风骨',
    emoji: '🌿',
    target: 'qianliu',
    desc: '跟着陈寅恪的笔触，寻访钱谦益与柳如是的虞山足迹',
    tags: ['明末清初', '红豆山庄', '虞山'],
    route: '/guide/qianliu',
    gradient: 'from-rose-500/10 via-pink-400/10 to-xuncheng-300/10',
    coverImage: 'https://images.unsplash.com/photo-1585435557343-aa53f57c7d00?w=800&q=80',
    days: 2,
    priceHint: '约200元/天',
  },
]

/** 根据ID获取攻略 */
export function getMockGuideById(id: string): Guide | null {
  return mockGuides[id] || null
}

function normalizeInterests(interests: string[]): Guide['interests'] {
  const valid = new Set(['文化', '美食', '自然', '体验'])
  const normalized = interests.filter(item => valid.has(item)) as Guide['interests']
  return normalized.length > 0 ? normalized : ['文化', '美食']
}

function normalizeBudget(budget: string): Guide['budget'] {
  return budget === '穷游' || budget === '舒适' || budget === '轻奢'
    ? budget
    : '舒适'
}

function buildGenericGuide(
  city: string,
  days: number,
  interests: string[],
  budget: string
): Guide {
  const safeDays = Math.min(Math.max(Number(days) || 2, 1), 7)
  const templates: Array<{
    label: string
    desc: string
    type: Spot['type']
    emoji: string
    timeSlot: Spot['timeSlot']
    tags: string[]
  }> = [
    { label: '文学地标', desc: '从书页进入城市现场', type: '景点', emoji: '📖', timeSlot: '上午', tags: ['文化'] },
    { label: '老街巷', desc: '沿着地方记忆慢慢走', type: '体验', emoji: '🚶', timeSlot: '下午', tags: ['文化', '体验'] },
    { label: '本地风味小馆', desc: '用一餐理解城市风土', type: '美食', emoji: '🍜', timeSlot: '晚上', tags: ['美食'] },
    { label: '河岸码头', desc: '寻找作品里的水路意象', type: '景点', emoji: '🛶', timeSlot: '上午', tags: ['自然', '文化'] },
    { label: '地方博物馆', desc: '补齐历史与民俗背景', type: '景点', emoji: '🏛️', timeSlot: '下午', tags: ['文化'] },
    { label: '夜间市集', desc: '观察城市的烟火气', type: '美食', emoji: '🏮', timeSlot: '晚上', tags: ['美食', '体验'] },
  ]

  const spots: Spot[] = Array.from({ length: safeDays * 3 }, (_, index) => {
    const template = templates[index % templates.length]
    return {
      id: `generic-${index + 1}`,
      name: `${city}${template.label}`,
      desc: template.desc,
      duration: template.type === '美食' ? '1.5小时' : '2小时',
      tags: template.tags,
      timeSlot: template.timeSlot,
      address: `${city} · 待按真实 POI 核验`,
      story: `LLM 暂不可用时生成的${city}演示点位，用于保留攻略结构。恢复模型服务后会替换为真实文学地点和在地推荐。`,
      type: template.type,
      budgetHint: template.type === '美食' ? '人均约50-120元（演示）' : '以现场公示为准（演示）',
      emoji: template.emoji,
      originalText: `演示模式：请补充与${city}相关的文学原文片段，以生成真实原文对照。`,
      originalSource: '演示占位',
      realityNote: `这是 ${city} 的通用演示点位，并非已核验的真实书中地点。`,
      goodNow: true,
      goodNowReason: '演示行程结构可用，真实开放时间需核验',
      photoSpot: template.type !== '美食',
    }
  })

  return {
    id: `generic-${city}`,
    title: `${city}文学旅行攻略`,
    subtitle: 'LLM 暂不可用时的演示路线',
    city,
    province: '待核验',
    days: safeDays,
    interests: normalizeInterests(interests),
    budget: normalizeBudget(budget),
    dayPlans: buildDayPlans(spots, safeDays),
    dialect: [
      { dialect: '本地方言', meaning: '待补充', scenario: 'LLM 恢复后生成真实方言速查' },
    ],
    localExperiences: [
      { name: `${city}在地走读`, desc: '按真实地点核验后可落地执行', type: '体验', schedule: '建议白天进行' },
    ],
    createdAt: new Date().toISOString(),
    tips: [
      '当前为 LLM 不可用时的演示攻略，点位需二次核验。',
      '输入书名、作者或摘录可提升文学地点识别准确度。',
      '出发前请核对景点开放时间、预约和交通。',
      '真实原文引用应以纸质书或权威版本为准。',
    ],
    entryType: '目的地',
    routeIntro: `当前 LLM 暂不可用，以下先生成一份与${city}匹配的演示行程结构。恢复模型服务后，可生成真实文学地点、原文对照与 POI 验证结果。`,
  }
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
  return buildGenericGuide(city, days, interests, budget)
}
