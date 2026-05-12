import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import PixelCard from '../components/PixelCard'
import SectionTitle from '../components/SectionTitle'

const HOLE_COUNT = 100

const MOCK = {
  MUSIC: {
    tags: ['Lo-fi', 'Post-rock', 'Ambient', 'Jazz', 'City Pop'],
    status: 'LOOPING',
    year: '2025',
    note: '适合循环播放的声音，戴着耳机的时候，世界好像可以按照自己的节奏运转。',
  },
  GAMES: {
    tags: ['Indie', 'RPG', 'Strategy', 'Puzzle', 'Roguelike'],
    status: 'PLAYING',
    year: '2025',
    note: '喜欢有清晰规则、强反馈和独特世界观的作品——好的游戏是一种交互设计教科书。',
  },
  READING: {
    tags: ['Sci-Fi', 'Design', 'Engineering', 'Philosophy', 'Manga'],
    status: 'READING',
    year: '2025',
    note: '技术书用来精进，小说用来换视角，长文本用来训练耐心。偶尔也翻漫画。',
  },
}

export default function Hobbies() {
  const { t } = useLanguage()
  const [openSet, setOpenSet] = useState(new Set())
  const [unrolledSet, setUnrolledSet] = useState(new Set())
  const [entered, setEntered] = useState(false)
  const stripRefs = useRef({})
  const openTimers = useRef({})
  const closeTimers = useRef({})

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

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

  const { eyebrow, title, intro, items } = t.pages.hobbies

  return (
    <div className="content-page film-page">
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

      {items.map((item, i) => {
        const isOpen = openSet.has(i)
        const isUnrolled = unrolledSet.has(i)
        const mock = MOCK[item.label] || MOCK.MUSIC
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
                <div className="film-frame film-frame--leader">
                  <span className="film-frame__num">00</span>
                  <div className="film-frame__leader-bars">
                    <span /><span /><span /><span />
                  </div>
                  <span className="film-frame__leader-txt">START</span>
                </div>

                <div className="film-frame film-frame--title">
                  <span className="film-frame__num">01</span>
                  <span className="film-frame__cat">{item.label}</span>
                  <h2 className="film-frame__heading">{item.title}</h2>
                </div>

                <div className="film-frame film-frame--desc">
                  <span className="film-frame__num">02</span>
                  <span className="film-frame__sec">DESCRIPTION</span>
                  <p className="film-frame__text">{item.body}</p>
                </div>

                <div className="film-frame film-frame--tags">
                  <span className="film-frame__num">03</span>
                  <span className="film-frame__sec">TAGS</span>
                  <div className="film-frame__tag-list">
                    {mock.tags.map(tag => (
                      <span key={tag} className="film-frame__tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="film-frame film-frame--note">
                  <span className="film-frame__num">04</span>
                  <span className="film-frame__sec">NOTE</span>
                  <p className="film-frame__text">{mock.note}</p>
                </div>

                <div className="film-frame film-frame--status">
                  <span className="film-frame__num">05</span>
                  <span className="film-frame__sec">STATUS</span>
                  <div className="film-frame__status-val">
                    <span className="film-frame__status-dot" />
                    {mock.status}
                  </div>
                  <span className="film-frame__year">{mock.year}</span>
                </div>

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
