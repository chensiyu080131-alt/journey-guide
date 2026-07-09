import { Guide, Spot } from '@/types'

/** 《人间滋味》全书四章结构 */
export const RENJIANZIWEI_CHAPTERS = [
  {
    chapter: 1,
    title: '安身之本，必资于食',
    theme: '食材本味',
    essays: ['《五味》', '《葵·薤》', '《故乡的食物》', '《故乡的野菜》'],
  },
  {
    chapter: 2,
    title: '肉食者不鄙',
    theme: '肉类美食',
    essays: ['《肉食者不鄙》', '《鱼我所欲也》', '《鳜鱼》', '《手把肉》'],
  },
  {
    chapter: 3,
    title: '吃喝门道，贵在讲究',
    theme: '饮食讲究',
    essays: ['《豆腐》', '《干丝》', '《韭菜花》', '《家常酒菜》'],
  },
  {
    chapter: 4,
    title: '四方食事，明心见性',
    theme: '各地风味',
    essays: ['《四方食事》', '《食道旧寻》', '《宋朝人的吃喝》'],
  },
] as const

/** 汪曾祺人生四阶段 · 食物记忆 */
export const WANGZENGQI_LIFE_PHASES = [
  { period: '1920-1939', place: '高邮童年', foods: '炒米、咸鸭蛋、野菜', emoji: '🥚' },
  { period: '1939-1946', place: '昆明联大', foods: '汽锅鸡、菌子、茶馆', emoji: '🍄' },
  { period: '1946-1958', place: '上海/北京', foods: '各地风味初识', emoji: '🏛️' },
  { period: '1958-1962', place: '张家口下放', foods: '马铃薯、沽源', emoji: '🥔' },
  { period: '1962-1997', place: '北京定居', foods: '豆汁儿、豆腐、四方食事', emoji: '🥢' },
] as const

export type RenjianRegion = '高邮' | '昆明' | '北京' | '张家口' | '漫游'

export const RENJIAN_REGIONS: { id: RenjianRegion; label: string; desc: string }[] = [
  { id: '高邮', label: '故乡高邮', desc: '点位最密集 · 推荐深度游' },
  { id: '昆明', label: '昆明', desc: '西南联大七年' },
  { id: '北京', label: '北京', desc: '定居之地' },
  { id: '张家口', label: '张家口', desc: '下放时期' },
  { id: '漫游', label: '美食漫游', desc: '四方食事' },
]

const gaoyouSpots: Spot[] = [
  {
    id: 'rjz-gy-1', name: '汪曾祺纪念馆', desc: '中心锚点，汪曾祺生平与高邮记忆',
    duration: '1.5小时', tags: ['文化', '美食'], timeSlot: '上午',
    location: { lat: 32.7816, lng: 119.4592 }, address: '江苏省扬州市高邮市汪曾祺纪念馆',
    story: '纪念馆集中展示汪曾祺的文学成就与故乡情结。《故乡的食物》里写"我的家乡是水乡，出鸭"，高邮咸鸭蛋由此闻名天下。',
    type: '景点', budgetHint: '免费', photoSpot: true, emoji: '📚',
    originalText: '我的家乡是水乡。高邮在运河之旁，地多水，故有水乡之称。',
    originalSource: '汪曾祺《故乡的食物》',
    realityNote: '建议作为"跟着汪曾祺吃高邮"路线的起点，了解人物与书籍背景后再出发。',
    essay: '《故乡的食物》', region: '高邮', flavor: '咸',
  },
  {
    id: 'rjz-gy-2', name: '高邮湖', desc: '咸鸭蛋、虎头鲨、昂嗤鱼——水乡河鲜之源',
    duration: '2小时', tags: ['美食', '自然'], timeSlot: '上午',
    location: { lat: 32.7480, lng: 119.3020 }, address: '江苏省扬州市高邮市高邮湖',
    story: '高邮湖是江苏省第三大湖。汪曾祺写高邮咸鸭蛋"筷子头一扎下去，吱——红油就冒出来了"，蛋白细嫩，蛋黄沙润。湖中还有虎头鲨、昂嗤鱼等河鲜，是水乡餐桌的日常。',
    type: '景点', budgetHint: '游船另计', photoSpot: true, emoji: '🦆',
    originalText: '高邮咸蛋的特点是质细而油多。蛋白柔嫩，不似别处的发干、发粉，入口如嚼石灰。',
    originalSource: '汪曾祺《故乡的食物》',
    realityNote: '秋季可赏芦苇，冬季可品湖鲜。咸鸭蛋可在东大街或镇上特产店购买。',
    essay: '《故乡的食物》', region: '高邮', flavor: '咸',
  },
  {
    id: 'rjz-gy-3', name: '盂城驿', desc: '古驿站，运河商旅与市井烟火',
    duration: '1小时', tags: ['文化', '体验'], timeSlot: '上午',
    location: { lat: 32.7790, lng: 119.4410 }, address: '江苏省扬州市高邮市盂城驿',
    story: '盂城驿是全国规模最大、保存最完好的古驿站之一，始建于明洪武年间。运河畔驿站见证了高邮作为水陆要冲的繁华，也是理解汪曾祺笔下"水乡"地理的关键一站。',
    type: '景点', budgetHint: '门票约30元', emoji: '🏯',
    originalText: '运河的水，高邮的水，是活水。',
    originalSource: '汪曾祺散文',
    realityNote: '与运河码头相邻，可一并游览，感受"河鲜上岸"的市井气。',
    region: '高邮',
  },
  {
    id: 'rjz-gy-4', name: '界首镇', desc: '界首茶干——国家地理标志产品',
    duration: '1.5小时', tags: ['美食', '文化'], timeSlot: '下午',
    location: { lat: 32.8810, lng: 119.4520 }, address: '江苏省扬州市高邮市界首镇',
    story: '界首茶干是高邮名产，选用优质黄豆，经多道工序精制而成，色泽黄亮，质地细腻。汪曾祺在散文中常写故乡小菜，茶干是佐酒佐茶的佳品。',
    type: '美食', budgetHint: '约15-30元', emoji: '🫘',
    originalText: '茶干是豆腐干的一种，比豆腐干要紧实，比香干要嫩。',
    originalSource: '汪曾祺《家常酒菜》',
    realityNote: '界首镇老街可买现制茶干，建议搭配黄酒或清茶。',
    essay: '《家常酒菜》', region: '高邮', flavor: '咸',
  },
  {
    id: 'rjz-gy-5', name: '东大街', desc: '炒米、焦屑——冬至后的街巷记忆',
    duration: '2小时', tags: ['美食', '体验'], timeSlot: '下午',
    location: { lat: 32.7805, lng: 119.4605 }, address: '江苏省扬州市高邮市东大街',
    story: '东大街是高邮老城烟火气最浓的街巷。汪曾祺写故乡冬至后炒米的香气、焦屑的脆香，是童年最温暖的味觉记忆。街上可寻蒲包肉、茶干、咸鸭蛋等小吃。',
    type: '体验', budgetHint: '自由消费', goodNow: true, goodNowReason: '傍晚华灯初上最有烟火气', photoSpot: true, emoji: '🏮',
    originalText: '炒米是铁锅炒熟的糯米，焦屑是炒米磨成的粉。冬天晚上，泡一碗焦屑，加红糖，暖和。',
    originalSource: '汪曾祺《故乡的食物》',
    realityNote: '推荐路线：东大街品小吃 → 寻蒲包肉 → 买咸鸭蛋伴手礼。',
    essay: '《故乡的食物》', region: '高邮', flavor: '甜',
  },
  {
    id: 'rjz-gy-6', name: '运河码头', desc: '螺蛳、蚬子——水乡河鲜小景',
    duration: '1小时', tags: ['美食', '自然'], timeSlot: '下午',
    location: { lat: 32.7775, lng: 119.4380 }, address: '高邮运河西岸码头一带',
    story: '汪曾祺写孩子射螺蛳壳上屋顶的趣事，水乡孩子与河鲜为伴长大。运河码头至今仍可感受水边生活，河鲜小馆可尝螺蛳、蚬子。',
    type: '美食', budgetHint: '人均40-60元', emoji: '🐚',
    originalText: '螺蛳壳是孩子们的游戏。把空壳放在屋脊上，用弹弓射，看谁射得高。',
    originalSource: '汪曾祺《故乡的食物》',
    realityNote: '春夏时节河鲜最肥，可搭配盂城驿一同游览。',
    essay: '《故乡的食物》', region: '高邮', flavor: '咸',
  },
  {
    id: 'rjz-gy-7', name: '蒲包肉', desc: '蒲草包着的卤肉，高邮街头名吃',
    duration: '30分钟', tags: ['美食'], timeSlot: '中午',
    location: { lat: 32.7800, lng: 119.4595 }, address: '高邮市东大街周边小吃摊',
    story: '蒲包肉是高邮独特小吃，用蒲草包裹猪肉卤制，草香渗入肉中。汪曾祺笔下的故乡食物，多是这样朴素而讲究的小菜。',
    type: '美食', budgetHint: '约20-35元', emoji: '🥩',
    originalText: '高邮的小菜，咸鸭蛋、茶干、蒲包肉，都是下酒的。',
    originalSource: '汪曾祺散文',
    realityNote: '东大街及老城巷弄内多家老店，建议中午趁热食用。',
    essay: '《肉食者不鄙》', region: '高邮', flavor: '咸',
  },
  {
    id: 'rjz-gy-8', name: '汪豆腐', desc: '汪曾祺命名的家乡菜，豆腐入馔',
    duration: '1小时', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 32.7820, lng: 119.4570 }, address: '高邮本地餐馆（老城一带）',
    story: '汪曾祺一生爱写豆腐，从高邮到昆明到北京，豆腐是他笔下的常客。"汪豆腐"是家乡人对他的纪念，将豆腐与高汤、时令菜同烹，清淡而有味。',
    type: '美食', budgetHint: '人均50-80元', emoji: '🧈',
    originalText: '豆腐最妙处，在于淡。淡中有味，淡中有情。',
    originalSource: '汪曾祺《豆腐》',
    realityNote: '可预约老城餐馆，搭配界首茶干、咸鸭蛋拼盘。',
    essay: '《豆腐》', region: '高邮', flavor: '咸',
  },
]

const kunmingSpots: Spot[] = [
  {
    id: 'rjz-km-1', name: '云南大学（西南联大旧址）', desc: '联大七年，文人风骨与昆明食事',
    duration: '1.5小时', tags: ['文化'], timeSlot: '上午',
    location: { lat: 25.0553, lng: 102.7048 }, address: '昆明市五华区翠湖北路2号',
    story: '西南联大在昆明办学七年，汪曾祺在此读书。昆明的食物、茶馆、菜市场，成为他一生反复书写的题材。',
    type: '景点', budgetHint: '免费', emoji: '🎓',
    originalText: '昆明是个好地方。四季如春，水果极多。',
    originalSource: '汪曾祺《四方食事》',
    realityNote: '校园内可寻联大纪念碑，随后步行至翠湖。',
    essay: '《四方食事》', region: '昆明',
  },
  {
    id: 'rjz-km-2', name: '翠湖 · 老茶馆', desc: '联大学生一泡半天的茶馆文化',
    duration: '1.5小时', tags: ['文化', '体验'], timeSlot: '上午',
    location: { lat: 25.0485, lng: 102.7035 }, address: '昆明市翠湖公园周边',
    story: '汪曾祺写联大学生在茶馆里读书、聊天，"往往一泡就是半天"。翠湖周边老茶馆是昆明慢生活的缩影。',
    type: '体验', budgetHint: '茶资约20-40元', emoji: '🍵',
    originalText: '联大学生在茶馆里往往一泡就是半天，看书，聊天，写东西。',
    originalSource: '汪曾祺散文',
    realityNote: '翠湖晨练、海鸥季（冬季）尤佳，茶馆多集中在周边巷弄。',
    region: '昆明',
  },
  {
    id: 'rjz-km-3', name: '篆新农贸市场', desc: '牛肝菌与各类菌子——逛菜市场学生活',
    duration: '2小时', tags: ['美食', '体验'], timeSlot: '上午',
    location: { lat: 25.0282, lng: 102.7185 }, address: '昆明市篆新农贸市场',
    story: '汪曾祺说"每到一个新地方，我宁可去逛菜市场"。篆新市场是昆明最具烟火气的菜市场，夏季菌子季更是人间奇观。',
    type: '体验', budgetHint: '自由消费', goodNow: true, goodNowReason: '清晨最新鲜', emoji: '🍄',
    originalText: '每到一个新地方，我宁可去逛菜市场，也不爱逛名胜。',
    originalSource: '汪曾祺《四方食事》',
    realityNote: '菌子季（6-9月）必逛，见手青、牛肝菌等，注意需彻底煮熟。',
    essay: '《四方食事》', region: '昆明',
  },
  {
    id: 'rjz-km-4', name: '昆明老街 · 过桥米线', desc: '昆明吃食代表作',
    duration: '1.5小时', tags: ['美食'], timeSlot: '中午',
    location: { lat: 25.0380, lng: 102.7120 }, address: '昆明市正义路/光华街一带',
    story: '过桥米线是昆明名片，热汤烫生料，汪曾祺在昆明七年，对滇味小吃念念不忘。',
    type: '美食', budgetHint: '人均30-50元', emoji: '🍜',
    originalText: '过桥米线，汤烫，料生，吃法讲究。',
    originalSource: '汪曾祺《四方食事》',
    realityNote: '老街片区可一并品尝破酥包子、火腿月饼。',
    essay: '《四方食事》', region: '昆明', flavor: '咸',
  },
  {
    id: 'rjz-km-5', name: '"培养正气"汽锅鸡', desc: '汤清如水，鸡香扑鼻',
    duration: '1.5小时', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 25.0365, lng: 102.7145 }, address: '昆明市老街附近',
    story: '汽锅鸡是滇味经典，汪曾祺写"汤清如水，鸡香扑鼻"。培养正气是昆明老字号，至今仍可品尝。',
    type: '美食', budgetHint: '人均60-100元', emoji: '🍲',
    originalText: '汽锅鸡，汤清如水，鸡香扑鼻。是昆明一绝。',
    originalSource: '汪曾祺散文',
    realityNote: '建议提前预约，可与昆明老街行程排在同一天。',
    essay: '《四方食事》', region: '昆明', flavor: '咸',
  },
]

const beijingSpots: Spot[] = [
  {
    id: 'rjz-bj-1', name: '护国寺小吃 · 豆汁焦圈', desc: '喝完一碗，再来一碗',
    duration: '1小时', tags: ['美食'], timeSlot: '上午',
    location: { lat: 39.9355, lng: 116.3780 }, address: '北京市西城区护国寺街',
    story: '汪曾祺在北京生活多年，深爱京味小吃。豆汁儿配焦圈、咸菜丝，是爱者的极致，也是北京味觉的门槛。',
    type: '美食', budgetHint: '人均20-40元', emoji: '🥣',
    originalText: '豆汁儿，味儿真怪。喝惯了，离不开。',
    originalSource: '汪曾祺《四方食事》',
    realityNote: '护国寺小吃总店，清晨排队最地道。可先小份试饮豆汁。',
    essay: '《四方食事》', region: '北京', flavor: '酸',
  },
  {
    id: 'rjz-bj-2', name: '牛街 · 清真风味', desc: '烧饼、牛羊肉、京味早点',
    duration: '1.5小时', tags: ['美食'], timeSlot: '上午',
    location: { lat: 39.8850, lng: 116.3630 }, address: '北京市西城区牛街',
    story: '牛街是北京回民聚居区，小吃云集。汪曾祺写北京吃食，兼顾宫廷与市井、汉与回。',
    type: '美食', budgetHint: '人均40-70元', emoji: '🥙',
    originalText: '北京的吃，讲究的是个"全"。',
    originalSource: '汪曾祺散文',
    realityNote: '与护国寺可分两日，或择一深度品尝。',
    region: '北京', flavor: '咸',
  },
  {
    id: 'rjz-bj-3', name: '玉渊潭公园', desc: '槐花、养蜂人——《人间草木》',
    duration: '2小时', tags: ['自然', '文化'], timeSlot: '下午',
    location: { lat: 39.9140, lng: 116.3180 }, address: '北京市海淀区玉渊潭公园',
    story: '汪曾祺《人间草木》写玉渊潭槐花盛开、养蜂人随花讯迁徙。食物与草木，在他笔下本是一体。',
    type: '景点', budgetHint: '门票约2-10元', photoSpot: true, emoji: '🌸',
    originalText: '玉渊潭的槐花盛开时，香飘十里。',
    originalSource: '汪曾祺《人间草木》',
    realityNote: '四月槐花季最佳，与《人间滋味》草木篇可对照阅读。',
    region: '北京',
  },
  {
    id: 'rjz-bj-4', name: '东来顺 · 贴秋膘', desc: '秋日涮羊肉，老北京食俗',
    duration: '2小时', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 39.9145, lng: 116.4170 }, address: '北京市东城区王府井大街',
    story: '汪曾祺写"贴秋膘"，立秋后涮羊肉。东来顺是老北京涮肉代表，肉食者不鄙，讲究的是火候与麻酱。',
    type: '美食', budgetHint: '人均120-200元', emoji: '🥘',
    originalText: '秋天了，该贴秋膘了。涮羊肉，最好。',
    originalSource: '汪曾祺《肉食者不鄙》',
    realityNote: '秋季体验最合时宜，可与韭菜花、芝麻酱小料搭配。',
    essay: '《肉食者不鄙》', region: '北京', flavor: '咸',
  },
]

const zhangjiakouSpots: Spot[] = [
  {
    id: 'rjz-zjk-1', name: '沙岭子农业科学研究所', desc: '马铃薯图谱与下放岁月',
    duration: '1.5小时', tags: ['文化'], timeSlot: '上午',
    location: { lat: 40.7680, lng: 114.8920 }, address: '张家口市沙岭子镇',
    story: '1958年汪曾祺下放张家口，在农业科学研究所劳动。他画《中国马铃薯图谱》，在荒凉中发现诗意，马铃薯成了那段岁月的味道。',
    type: '景点', budgetHint: '免费参观', emoji: '🥔',
    originalText: '马铃薯，学名土豆，俗名洋芋。',
    originalSource: '汪曾祺《马铃薯》',
    realityNote: '可结合张家口博物馆了解下放历史，感受"荒凉中的诗意"。',
    essay: '《马铃薯》', region: '张家口',
  },
  {
    id: 'rjz-zjk-2', name: '沽源县', desc: '坝上风光，城中所见所闻',
    duration: '半天', tags: ['自然'], timeSlot: '下午',
    location: { lat: 41.6700, lng: 115.6800 }, address: '河北省张家口市沽源县',
    story: '汪曾祺写沽源"城中的所见所闻"，草原、莜面、手把肉，内蒙古风味与坝上生活交织。',
    type: '景点', budgetHint: '交通另计', emoji: '🌾',
    originalText: '沽源，在张家口以北，是坝上。',
    originalSource: '汪曾祺散文',
    realityNote: '夏季草原最美，可品尝莜面、手把肉。',
    essay: '《手把肉》', region: '张家口', flavor: '咸',
  },
  {
    id: 'rjz-zjk-3', name: '张家口莜面馆', desc: '坝上特色，粗粮细做',
    duration: '1小时', tags: ['美食'], timeSlot: '中午',
    location: { lat: 40.8240, lng: 114.8840 }, address: '张家口市区',
    story: '莜面是坝上主食，汪曾祺写北方食事，离不开面食与羊肉。',
    type: '美食', budgetHint: '人均30-50元', emoji: '🍝',
    originalText: '莜麦，性耐寒，坝上种得多。',
    originalSource: '汪曾祺散文',
    realityNote: '推荐莜面窝窝、莜面鱼鱼，搭配羊肉汤。',
    region: '张家口',
  },
]

const roamSpots: Spot[] = [
  {
    id: 'rjz-rm-1', name: '长沙火宫殿', desc: '臭豆腐——毛泽东青年时常吃',
    duration: '1.5小时', tags: ['美食'], timeSlot: '中午',
    location: { lat: 28.1970, lng: 112.9820 }, address: '长沙市天心区坡子街',
    story: '汪曾祺写各地风味，长沙臭豆腐是湖南名片。火宫殿百年老店，烟火气十足。',
    type: '美食', budgetHint: '人均40-60元', emoji: '🌶️',
    originalText: '长沙臭豆腐，外焦里嫩，闻着臭，吃着香。',
    originalSource: '汪曾祺《四方食事》',
    realityNote: '坡子街片区可连逛，体验湘味小吃。',
    essay: '《四方食事》', region: '漫游', flavor: '辣',
  },
  {
    id: 'rjz-rm-2', name: '杭州虎跑泉', desc: '虎跑泉泡龙井，醋鱼带把',
    duration: '2小时', tags: ['美食', '自然'], timeSlot: '下午',
    location: { lat: 30.2070, lng: 120.1270 }, address: '杭州市西湖区虎跑路',
    story: '汪曾祺写杭州菜与龙井茶，虎跑泉泡茶是一绝。西湖醋鱼、东坡肉，江南食事讲究。',
    type: '景点', budgetHint: '门票约15元', emoji: '🍵',
    originalText: '虎跑泉泡茶，茶香最清。',
    originalSource: '汪曾祺散文',
    realityNote: '可携龙井至虎跑试茶，西湖周边餐馆品杭帮菜。',
    essay: '《四方食事》', region: '漫游',
  },
  {
    id: 'rjz-rm-3', name: '镇江肴蹄', desc: '淮扬肴肉，水晶质感',
    duration: '1小时', tags: ['美食'], timeSlot: '中午',
    location: { lat: 32.1880, lng: 119.4250 }, address: '镇江市京口区',
    story: '镇江肴肉是淮扬名菜，汪曾祺作为江苏人，对淮扬菜系的刀工与原味极为推崇。',
    type: '美食', budgetHint: '人均50-80元', emoji: '🍖',
    originalText: '肴肉，水晶似的，蘸镇江香醋，妙。',
    originalSource: '汪曾祺散文',
    realityNote: '可与镇江锅盖面、醋搭配，一日淮扬小食线。',
    region: '漫游', flavor: '咸',
  },
  {
    id: 'rjz-rm-4', name: '淮安狮子头', desc: '淮扬名菜，大肉圆子',
    duration: '1.5小时', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 33.6100, lng: 119.0150 }, address: '淮安市清江浦区',
    story: '狮子头是淮安代表菜，汪曾祺写肉食，讲究"入口即化"与清汤炖煮。',
    type: '美食', budgetHint: '人均80-120元', emoji: '🦁',
    originalText: '狮子头，宜大，宜烂，宜入口即化。',
    originalSource: '汪曾祺《肉食者不鄙》',
    realityNote: '淮安为淮扬菜发源地，建议与河下古镇同游。',
    essay: '《肉食者不鄙》', region: '漫游', flavor: '咸',
  },
  {
    id: 'rjz-rm-5', name: '徽州臭鳜鱼', desc: '闻臭食香，徽菜奇味',
    duration: '1.5小时', tags: ['美食'], timeSlot: '晚上',
    location: { lat: 29.8670, lng: 118.4150 }, address: '黄山市歙县',
    story: '臭鳜鱼是徽州传统名菜，汪曾祺写鱼我所欲也，各地鱼的吃法，各有讲究。',
    type: '美食', budgetHint: '人均80-150元', emoji: '🐟',
    originalText: '鳜鱼，清蒸最好。臭鳜鱼是另一种境界。',
    originalSource: '汪曾祺《鱼我所欲也》',
    realityNote: '歙县徽州古城内多家老字号，需预订。',
    essay: '《鱼我所欲也》', region: '漫游', flavor: '咸',
  },
]

export const renjianziweiAllSpots: Spot[] = [
  ...gaoyouSpots,
  ...kunmingSpots,
  ...beijingSpots,
  ...zhangjiakouSpots,
  ...roamSpots,
]

/** 高邮一日美食路线顺序 */
const gaoyouDayRoute = [
  'rjz-gy-1', 'rjz-gy-2', 'rjz-gy-3', 'rjz-gy-7', 'rjz-gy-5', 'rjz-gy-6', 'rjz-gy-4', 'rjz-gy-8',
]

function buildGaoyouDayPlan(): Guide['dayPlans'] {
  const spotMap = new Map(gaoyouSpots.map(s => [s.id, s]))
  const ordered = gaoyouDayRoute.map(id => spotMap.get(id)!).filter(Boolean)
  return [{
    day: 1,
    title: '跟着汪曾祺吃高邮',
    spots: ordered,
    budgetEstimate: '约150-200元',
  }]
}

export const renjianziweiGuide: Guide = {
  id: 'renjianziwei',
  title: '《人间滋味》',
  subtitle: '汪曾祺 · 四方食事，不过一碗人间烟火',
  city: '高邮',
  province: '江苏',
  days: 1,
  interests: ['美食', '文化', '体验'],
  budget: '舒适',
  dayPlans: buildGaoyouDayPlan(),
  dialect: [
    { dialect: '乖乖隆地冬', meaning: '天哪/好厉害', scenario: '高邮方言表惊讶' },
    { dialect: '阿要', meaning: '要不要', scenario: '阿要吃咸鸭蛋' },
  ],
  localExperiences: [
    { name: '高邮咸鸭蛋', desc: '筷子一扎，红油冒出——汪曾祺笔下第一名产', type: '手艺' },
    { name: '三月野菜季', desc: '蒌蒿、荠菜、马齿苋，故乡田野的味道', type: '时令', schedule: '3-5月' },
    { name: '东大街早市', desc: '炒米、焦屑、蒲包肉，冬至后的街巷香气', type: '赶集', schedule: '每日清晨' },
  ],
  createdAt: new Date().toISOString(),
  tips: [
    '推荐从高邮深度版开始：汪曾祺纪念馆 → 高邮湖 → 盂城驿 → 界首镇 → 东大街',
    '全国版可切换地域标签，按城市展开书中美食点位',
    '五味筛选：酸（豆汁）甜（炒米焦屑）苦（茶）辣（湘味）咸（咸鸭蛋）',
    '昆明菌子季务必煮熟，勿贪鲜',
  ],
  entryType: '书籍',
  relatedBook: '《人间滋味》',
  relatedAuthor: '汪曾祺',
  routeIntro: '我的家乡是高邮。这是一本书、一个人、一张用食物标注的中国地图。《人间滋味》收录三十余篇美食散文，从故乡高邮的咸鸭蛋、炒米，到昆明汽锅鸡、北京豆汁儿，再到四方食事里的烟火人间——跟着汪曾祺，把文字吃进嘴里。',
}

export function getRenjianSpotsByRegion(region: RenjianRegion): Spot[] {
  if (region === '漫游') return roamSpots
  return renjianziweiAllSpots.filter(s => s.region === region)
}

export const RENJIAN_FLAVORS = ['酸', '甜', '苦', '辣', '咸'] as const
export type RenjianFlavor = typeof RENJIAN_FLAVORS[number]

export function filterSpotsByFlavor(spots: Spot[], flavor: RenjianFlavor | null): Spot[] {
  if (!flavor) return spots
  return spots.filter(s => s.flavor === flavor)
}
