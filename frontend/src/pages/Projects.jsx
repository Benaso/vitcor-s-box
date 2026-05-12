import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { fetchProjects, runSandbox, stopSandbox, fetchSandboxStatus } from '../api/client'
import PixelCard from '../components/PixelCard'
import SectionTitle from '../components/SectionTitle'

const HOLE_COUNT = 100

// Mock extra data per project category
const MOCK = {
  SYSTEM: {
    tags: ['CAD', 'PDM', 'PLM', 'BOM', 'Workflow'],
    status: 'PROTOTYPE',
    year: '2025',
    note: '面向制造业的工程数据流：从设计到生产，每一步都应该是可追溯、可复用的。',
  },
  AGENT: {
    tags: ['LLM', 'RAG', 'Tool Use', 'MCP', 'Planning'],
    status: 'ACTIVE',
    year: '2025',
    note: '让 AI 学会使用工具而不是只会聊天——真正的 Agent 应该能替你做事。',
  },
  WEB: {
    tags: ['React', 'Vite', 'CSS', 'GitHub Pages', 'i18n'],
    status: 'SHIPPED',
    year: '2025',
    note: '一个柔和像素风的个人空间，用来放作品、写笔记、留一点自己的痕迹。',
  },
}

export default function Projects() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState([])
  const [openSet, setOpenSet] = useState(new Set())
  const [unrolledSet, setUnrolledSet] = useState(new Set())
  const [entered, setEntered] = useState(false)
  const stripRefs = useRef({})
  const openTimers = useRef({})
  const closeTimers = useRef({})

  useEffect(() => {
    fetchProjects()
      .then(res => setProjects(res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Attach wheel→horizontal-scroll on every open strip
  useEffect(() => {
    const handlers = new Map()
    for (const i of openSet) {
      const el = stripRefs.current[i]
      if (!el) continue
      const fn = (e) => {
        if (el.scrollWidth <= el.clientWidth) return
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
      handlers.set(i, fn)
      el.addEventListener('wheel', fn, { passive: false })
    }
    return () => {
      for (const [i, fn] of handlers) {
        stripRefs.current[i]?.removeEventListener('wheel', fn)
      }
    }
  }, [openSet])

  const toggle = useCallback((i) => {
    if (openTimers.current[i]) { clearTimeout(openTimers.current[i]); delete openTimers.current[i] }
    if (closeTimers.current[i]) { clearTimeout(closeTimers.current[i]); delete closeTimers.current[i] }

    if (openSet.has(i)) {
      setUnrolledSet(prev => { const n = new Set(prev); n.delete(i); return n })
      closeTimers.current[i] = setTimeout(() => {
        setOpenSet(prev => { const n = new Set(prev); n.delete(i); return n })
        delete closeTimers.current[i]
      }, 550)
    } else {
      setOpenSet(prev => new Set(prev).add(i))
      openTimers.current[i] = setTimeout(() => {
        setUnrolledSet(prev => new Set(prev).add(i))
        delete openTimers.current[i]
      }, 180)
    }
  }, [openSet])

  const { eyebrow, title, intro, items: translationItems } = t.pages.projects

  // Computed items: use API projects when available, fall back to translation items
  const items = projects.length > 0
    ? projects.map(p => ({
        label: p.label || p.title?.toUpperCase()?.replace(/\s+/g, '_') || 'PROJECT',
        title: p.title || '',
        body: p.body || p.description || '',
        id: p.id,
        repoUrl: p.repoUrl || '',
        images: p.images || [],
        videos: p.videos || [],
        status: p.status || '',
      }))
    : translationItems

  return (
    <div className="content-page film-page">
      {/* Header */}
      <div className={`film-hdr ${entered ? 'in' : ''}`}>
        <PixelCard style={{ width: '100%' }}>
          <SectionTitle>{eyebrow}</SectionTitle>
          <h1 className="content-page__title">{title}</h1>
          <p className="content-page__intro">{intro}</p>
          <div className="film-hdr__count">
            <span className="film-hdr__count-label">ROLLS</span>
            <span className="film-hdr__count-val">
              {String(items.length).padStart(2, '0')}
            </span>
          </div>
        </PixelCard>
      </div>

      {/* Film Reels */}
      <div className={`film-reels ${entered ? 'in' : ''}`}>
        {items.map((item, i) => {
          const isOpen = openSet.has(i)
          return (
            <div
              key={item.label}
              className={`film-can ${isOpen ? 'active' : ''}`}
              style={{ '--i': i }}
              onClick={() => toggle(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggle(i)}
            >
              <div className="film-can__reel">
                <div className="film-can__spool" />
                <div className="film-can__cross film-can__cross--h" />
                <div className="film-can__cross film-can__cross--v" />
              </div>
              <div className="film-can__info">
                <span className="film-can__label">// {item.label}</span>
                <span className="film-can__name">{item.title}</span>
              </div>
              <div className="film-can__arrow">{isOpen ? '▼' : '▶'}</div>
            </div>
          )
        })}
      </div>

      {/* Film Strips */}
      {items.map((item, i) => {
        const isOpen = openSet.has(i)
        const isUnrolled = unrolledSet.has(i)
        const mock = MOCK[item.label] || MOCK.SYSTEM
        const hasApiData = projects.length > 0
        // Tags: from API images/videos count, or MOCK tags
        const tags = hasApiData
          ? [
              ...(item.images?.length ? [`${item.images.length} images`] : []),
              ...(item.videos?.length ? [`${item.videos.length} videos`] : []),
              ...(item.repoUrl ? ['Repo'] : []),
            ]
          : mock.tags
        // Note: repo URL or MOCK note
        const note = hasApiData
          ? item.repoUrl || mock.note
          : mock.note
        // Status: from API or MOCK
        const status = hasApiData
          ? item.status || mock.status
          : mock.status
        const year = mock.year
        return (
          <div key={`strip-${i}`} className={`film-strip-wrap ${isOpen ? 'open' : ''}`}>
            <div
              className={`film-strip ${isUnrolled ? 'unrolled' : ''}`}
              ref={el => { stripRefs.current[i] = el }}
            >
              <div className="film-strip__edge">
                {Array.from({ length: HOLE_COUNT }, (_, h) => (
                  <div key={h} className="film-strip__hole" />
                ))}
              </div>

              <div className="film-strip__frames">
                {/* 00 — Leader */}
                <div className="film-frame film-frame--leader">
                  <span className="film-frame__num">00</span>
                  <div className="film-frame__leader-bars">
                    <span /><span /><span /><span />
                  </div>
                  <span className="film-frame__leader-txt">START</span>
                </div>

                {/* 01 — Title */}
                <div className="film-frame film-frame--title">
                  <span className="film-frame__num">01</span>
                  <span className="film-frame__cat">{item.label}</span>
                  <h2 className="film-frame__heading">{item.title}</h2>
                </div>

                {/* 02 — Description */}
                <div className="film-frame film-frame--desc">
                  <span className="film-frame__num">02</span>
                  <span className="film-frame__sec">DESCRIPTION</span>
                  <p className="film-frame__text">{item.body}</p>
                </div>

                {/* 03 — Tags */}
                <div className="film-frame film-frame--tags">
                  <span className="film-frame__num">03</span>
                  <span className="film-frame__sec">TECH STACK</span>
                  <div className="film-frame__tag-list">
                    {tags.map(tag => (
                      <span key={tag} className="film-frame__tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* 04 — Note */}
                <div className="film-frame film-frame--note">
                  <span className="film-frame__num">04</span>
                  <span className="film-frame__sec">NOTE</span>
                  <p className="film-frame__text">{note}</p>
                </div>

                {/* 05 — Status */}
                <div className="film-frame film-frame--status">
                  <span className="film-frame__num">05</span>
                  <span className="film-frame__sec">STATUS</span>
                  <div className="film-frame__status-val">
                    <span className="film-frame__status-dot" />
                    {status}
                  </div>
                  <span className="film-frame__year">{year}</span>
                </div>

                {/* 06 — End */}
                <div className="film-frame film-frame--end">
                  <span className="film-frame__num">06</span>
                  <div className="film-frame__end-lines">
                    <span /><span />
                  </div>
                  <span className="film-frame__end-txt">END</span>
                </div>
              </div>

              <div className="film-strip__edge">
                {Array.from({ length: HOLE_COUNT }, (_, h) => (
                  <div key={h} className="film-strip__hole" />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
