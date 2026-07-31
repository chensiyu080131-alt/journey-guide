'use client'

import { useEffect, useState } from 'react'
import type { Guide, Spot, SpotTrustLevel } from '@/types'

type GuideListItem = {
  id: string
  title: string
  cityName: string
  province: string
  days: number
  entryType: string
  published: boolean
  spotCount: number
  source: string
  updatedAt: string
}

const TRUST_OPTIONS: SpotTrustLevel[] = ['verified', 'ai', 'unverified']

/** 文旅局工作台 · 内容编辑器（极简 CRUD：列表 + 点位编辑） */
export function ContentEditor() {
  const [dbReady, setDbReady] = useState(false)
  const [source, setSource] = useState<'database' | 'file'>('file')
  const [guides, setGuides] = useState<GuideListItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [editing, setEditing] = useState<Spot | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/content')
      const data = await res.json()
      setDbReady(Boolean(data.databaseConfigured))
      setSource(data.source)
      setGuides(data.guides ?? [])
    } catch {
      setStatus('加载攻略列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const openGuide = async (id: string) => {
    setSelectedId(id)
    setEditing(null)
    setStatus(null)
    const res = await fetch(`/api/content?id=${encodeURIComponent(id)}`)
    if (!res.ok) {
      setStatus('加载攻略失败')
      return
    }
    const data = await res.json()
    setGuide(data.guide)
  }

  const saveSpot = async () => {
    if (!editing) return
    if (!dbReady) {
      setStatus('未配置 DATABASE_URL，当前为文件回退，无法写入')
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId: editing.id,
          name: editing.name,
          desc: editing.desc,
          address: editing.address ?? '',
          originalText: editing.originalText ?? '',
          originalSource: editing.originalSource ?? '',
          realityNote: editing.realityNote ?? '',
          trustLevel: editing.trustLevel ?? 'verified',
          story: editing.story ?? '',
          budgetHint: editing.budgetHint ?? '',
          lat: editing.location?.lat ?? null,
          lng: editing.location?.lng ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '保存失败')
      setStatus('已保存到数据库')
      if (selectedId) await openGuide(selectedId)
      setEditing(data.spot)
    } catch (e) {
      setStatus(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-serif font-bold text-ink-900">✏️ 内容编辑器</h2>
          <p className="text-xs text-ink-500 mt-1">
            数据源：{source === 'database' ? 'PostgreSQL' : '本地文件回退'}
            {dbReady ? ' · 可写入' : ' · 只读（请配置 DATABASE_URL 并 seed）'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadList}
          className="text-xs px-3 py-1.5 rounded-full border border-ink-200 hover:border-literary-wine/40"
        >
          刷新列表
        </button>
      </div>

      {status && (
        <p className="text-sm rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2">
          {status}
        </p>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="rounded-2xl border border-ink-100 bg-white max-h-[520px] overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-ink-400">加载中…</p>
          ) : (
            <ul className="divide-y divide-ink-50">
              {guides.map(g => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => openGuide(g.id)}
                    className={`w-full text-left px-3 py-3 text-sm hover:bg-paper-warm/80 ${
                      selectedId === g.id ? 'bg-literary-wine/5' : ''
                    }`}
                  >
                    <div className="font-medium text-ink-900 line-clamp-1">{g.title}</div>
                    <div className="text-[11px] text-ink-400 mt-0.5">
                      {g.cityName} · {g.spotCount} 点 · {g.days} 天
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-4 min-h-[320px]">
          {!guide ? (
            <p className="text-sm text-ink-400">选择左侧攻略，编辑点位原文与实景说明。</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-ink-900">{guide.title}</h3>
                <p className="text-xs text-ink-500 mt-1">
                  {guide.city} · {guide.entryType} · id={guide.id}
                </p>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {guide.dayPlans.flatMap(day =>
                  day.spots.map(spot => (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => setEditing({ ...spot })}
                      className={`w-full text-left rounded-xl border px-3 py-2 text-sm ${
                        editing?.id === spot.id
                          ? 'border-literary-wine/40 bg-literary-wine/5'
                          : 'border-ink-100 hover:border-ink-200'
                      }`}
                    >
                      <span className="mr-2">{spot.emoji}</span>
                      {spot.name}
                      <span className="ml-2 text-[11px] text-ink-400">
                        {spot.trustLevel ?? 'verified'} · Day{day.day}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {editing && (
                <div className="border-t border-ink-100 pt-4 space-y-3">
                  <p className="text-xs font-medium text-ink-500">编辑点位 · {editing.id}</p>
                  {(
                    [
                      ['name', '名称', editing.name],
                      ['desc', '简介', editing.desc],
                      ['address', '地址', editing.address ?? ''],
                      ['originalText', '原文', editing.originalText ?? ''],
                      ['originalSource', '出处', editing.originalSource ?? ''],
                      ['realityNote', '实景说明', editing.realityNote ?? ''],
                      ['story', '故事', editing.story ?? ''],
                    ] as const
                  ).map(([key, label, value]) => (
                    <label key={key} className="block text-xs text-ink-600">
                      {label}
                      <textarea
                        className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 min-h-[64px]"
                        value={value}
                        onChange={e =>
                          setEditing(prev => (prev ? { ...prev, [key]: e.target.value } : prev))
                        }
                      />
                    </label>
                  ))}

                  <label className="block text-xs text-ink-600">
                    可信度
                    <select
                      className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                      value={editing.trustLevel ?? 'verified'}
                      onChange={e =>
                        setEditing(prev =>
                          prev
                            ? { ...prev, trustLevel: e.target.value as SpotTrustLevel }
                            : prev
                        )
                      }
                    >
                      {TRUST_OPTIONS.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block text-xs text-ink-600">
                      纬度
                      <input
                        className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                        type="number"
                        step="any"
                        value={editing.location?.lat ?? ''}
                        onChange={e => {
                          const lat = e.target.value === '' ? undefined : Number(e.target.value)
                          setEditing(prev =>
                            prev
                              ? {
                                  ...prev,
                                  location:
                                    lat == null && prev.location?.lng == null
                                      ? undefined
                                      : { lat: lat ?? prev.location?.lat ?? 0, lng: prev.location?.lng ?? 0 },
                                }
                              : prev
                          )
                        }}
                      />
                    </label>
                    <label className="block text-xs text-ink-600">
                      经度
                      <input
                        className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                        type="number"
                        step="any"
                        value={editing.location?.lng ?? ''}
                        onChange={e => {
                          const lng = e.target.value === '' ? undefined : Number(e.target.value)
                          setEditing(prev =>
                            prev
                              ? {
                                  ...prev,
                                  location:
                                    lng == null && prev.location?.lat == null
                                      ? undefined
                                      : { lat: prev.location?.lat ?? 0, lng: lng ?? prev.location?.lng ?? 0 },
                                }
                              : prev
                          )
                        }}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={saving || !dbReady}
                    onClick={saveSpot}
                    className="px-4 py-2 rounded-full bg-literary-wine text-white text-sm disabled:opacity-50"
                  >
                    {saving ? '保存中…' : '保存到数据库'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
