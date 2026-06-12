import { useRef, useLayoutEffect } from 'react'

function getCellClass(index, highlights, sortedSet) {
  if (sortedSet.has(index)) return 'sorted'
  if (highlights.pivot === index) return 'pivot'
  if (highlights.swap?.includes(index)) return 'swap'
  if (highlights.compare?.includes(index)) return 'compare'
  return 'default'
}

export default function SortNumbersGrid({ items, highlights, sortedSet, animating }) {
  const containerRef = useRef(null)
  const prevRects = useRef(new Map())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cells = container.querySelectorAll('[data-sort-id]')
    cells.forEach(cell => {
      const id = cell.dataset.sortId
      const prev = prevRects.current.get(id)
      const rect = cell.getBoundingClientRect()

      if (prev) {
        const dx = prev.left - rect.left
        const dy = prev.top - rect.top
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          cell.style.transition = 'none'
          cell.style.transform = `translate(${dx}px, ${dy}px)`
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              cell.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease'
              cell.style.transform = ''
            })
          })
        }
      }

      prevRects.current.set(id, { left: rect.left, top: rect.top })
    })
  }, [items])

  const cellW = Math.min(Math.max(36, Math.floor(560 / items.length)), 52)
  const cellH = Math.min(Math.max(36, Math.floor(560 / items.length)), 52)
  const fontSize = items.length > 25 ? '0.65rem' : items.length > 15 ? '0.75rem' : '0.85rem'

  return (
    <div className="sort-num-wrapper">
      <div className="sort-num-track" ref={containerRef}>
        {items.map((item, i) => {
          const cls = getCellClass(i, highlights, sortedSet)
          const isSwapping = animating && highlights.swap?.includes(i)
          return (
            <div
              key={item.id}
              data-sort-id={item.id}
              className={`sort-num-cell ${cls}${isSwapping ? ' lifting' : ''}`}
              style={{ width: cellW, height: cellH, fontSize }}
            >
              <span className="sort-num-value">{item.value}</span>
              <span className="sort-num-index">{i}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function valuesToItems(values) {
  return values.map((value, index) => ({ id: `${Date.now()}-${index}-${Math.random()}`, value }))
}

export function syncItems(items, newValues) {
  return items.map((item, i) => ({ ...item, value: newValues[i] }))
}

export function swapItems(items, i, j) {
  const next = [...items]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}
