import { Guide, OptionalRecommendSpot } from '@/types'

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
      insertAfterSpotId: 'rjz-gy-2',
      insertDay: 1,
      story: '春天去高邮湖湿地周边，可体验野菜采摘，对应《故乡的野菜》篇。',
      tags: ['美食', '自然', '体验'],
      budgetHint: '免费（自驾）',
    },
  ],
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
      budgetHint: '门票约10元',
    },
  ],
  shajiabang: [
    {
      id: 'opt-sb-1',
      name: '沙家浜京剧表演',
      emoji: '🎭',
      desc: '景区内定时上演《沙家浜》经典选段',
      duration: '1小时',
      category: '民俗体验',
      heritage: '京剧 · 沙家浜样板戏',
      insertDay: 1,
      tags: ['文化', '体验'],
      budgetHint: '含在景区门票内',
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
    budgetHint: '视体验项目而定',
  }))
}

export function getOptionalSpotsForGuide(guideId: string, guide?: Guide): OptionalRecommendSpot[] {
  const specific = OPTIONAL_BY_GUIDE[guideId] || []
  if (specific.length > 0) return specific
  if (guide) return fromLocalExperiences(guide)
  return []
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
