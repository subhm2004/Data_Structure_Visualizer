import { useState, useCallback, useMemo, useRef } from 'react'
import { ALGORITHMS, randomArray } from '../algorithms/sorting'
import { getTreeGenerator, TREE_ALGO_KEYS } from '../algorithms/sortTree'
import { useAnimationRunner } from '../hooks/useAnimationRunner'
import SortNumbersGrid, { valuesToItems, syncItems, swapItems } from '../components/SortNumbersGrid'
import SortTreeView from '../components/SortTreeView'
import { getSpeedLabel } from '../utils/speed'

function getBarClass(index, highlights, sortedSet) {
  if (sortedSet.has(index)) return 'sorted'
  if (highlights.pivot === index) return 'pivot'
  if (highlights.swap?.includes(index)) return 'swap'
  if (highlights.compare?.includes(index)) return 'compare'
  return 'default'
}

const TREE_MAX_SIZE = 8

export default function SortingVisualizer() {
  const [size, setSize] = useState(15)
  const [speed, setSpeed] = useState(3)
  const [viewMode, setViewMode] = useState('bars')
  const [array, setArray] = useState(() => randomArray(15))
  const [items, setItems] = useState(() => valuesToItems(randomArray(15)))
  const [highlights, setHighlights] = useState({ compare: [], swap: [], pivot: -1 })
  const [sortedSet, setSortedSet] = useState(new Set())
  const [activeAlgo, setActiveAlgo] = useState(null)
  const [complexity, setComplexity] = useState(null)
  const [swapAnimating, setSwapAnimating] = useState(false)

  const [treeState, setTreeState] = useState(null)
  const [treeActiveId, setTreeActiveId] = useState(null)
  const [treePhase, setTreePhase] = useState('')
  const [treeMessage, setTreeMessage] = useState('')
  const [mergeCtx, setMergeCtx] = useState(null)

  const itemsRef = useRef(items)
  itemsRef.current = items
  const { running, run } = useAnimationRunner()

  const isTreeAlgo = (key) => TREE_ALGO_KEYS.includes(key)
  const maxSize = viewMode === 'tree' ? TREE_MAX_SIZE : viewMode === 'numbers' ? 30 : 100

  const generate = useCallback(() => {
    const capped = Math.min(size, maxSize)
    const vals = randomArray(capped)
    setArray(vals)
    setItems(valuesToItems(vals))
    setHighlights({ compare: [], swap: [], pivot: -1 })
    setSortedSet(new Set())
    setActiveAlgo(null)
    setComplexity(null)
    setSwapAnimating(false)
    setTreeState(null)
    setTreeActiveId(null)
    setTreePhase('')
    setTreeMessage('')
    setMergeCtx(null)
  }, [size, maxSize])

  const handleStep = useCallback((step) => {
    if (step.type === 'tree-step' || (step.type === 'done' && step.tree)) {
      if (step.tree) setTreeState(step.tree)
      if (step.activeId) setTreeActiveId(step.activeId)
      if (step.phase) setTreePhase(step.phase)
      if (step.message) setTreeMessage(step.message)
      if (step.mergeCtx !== undefined) setMergeCtx(step.mergeCtx)
      if (step.array) setArray(step.array)
      if (step.type === 'done') {
        setTreePhase('done')
        setTreeMessage(step.message || 'Sort complete!')
        setMergeCtx(null)
      }
      return
    }

    const h = { compare: [], swap: [], pivot: -1 }
    if (step.type === 'compare') h.compare = step.indices
    if (step.type === 'swap') h.swap = step.indices
    if (step.type === 'pivot') h.pivot = step.index ?? -1
    setHighlights(h)

    if (viewMode === 'numbers') {
      if (step.type === 'swap' && step.indices?.length === 2) {
        const [i, j] = step.indices
        setSwapAnimating(true)
        setItems(prev => swapItems(prev, i, j))
        setTimeout(() => setSwapAnimating(false), 450)
      } else if (step.array) {
        setItems(prev => syncItems(prev, step.array))
      }
    }

    if (step.array) setArray(step.array)
    if (step.type === 'sorted') setSortedSet(prev => new Set([...prev, step.index]))
    if (step.type === 'done') {
      setSortedSet(new Set(Array.from({ length: step.array.length }, (_, i) => i)))
      setHighlights({ compare: [], swap: [], pivot: -1 })
      setSwapAnimating(false)
    }
  }, [viewMode])

  const startSort = useCallback(async (key) => {
    const algo = ALGORITHMS[key]
    setActiveAlgo(key)
    setComplexity(algo)
    setSortedSet(new Set())
    setHighlights({ compare: [], swap: [], pivot: -1 })
    setSwapAnimating(false)
    setTreeState(null)
    setTreeActiveId(null)
    setTreePhase('')
    setTreeMessage('')
    setMergeCtx(null)

    const data = viewMode === 'numbers'
      ? itemsRef.current.map(it => it.value)
      : [...array]

    const useTree = viewMode === 'tree' && isTreeAlgo(key)
    const generator = useTree ? getTreeGenerator(key, data) : algo.fn(data)

    if (useTree) {
      setTreeMessage(`Starting ${algo.name} — divide & merge steps`)
    }

    const animSpeed = useTree ? Math.min(speed, 2) : speed
    await run(generator, handleStep, animSpeed)
  }, [array, speed, run, handleStep, viewMode])

  const switchViewMode = (mode) => {
    if (running) return
    let newSize = size
    if (mode === 'tree' && size > TREE_MAX_SIZE) newSize = TREE_MAX_SIZE
    if (mode === 'numbers' && size > 30) newSize = 30
    if (newSize !== size) handleSizeChange(newSize)
    else if (mode === 'numbers') setItems(valuesToItems(array))
    setViewMode(mode)
    setTreeState(null)
    setTreeActiveId(null)
    setTreePhase('')
    setTreeMessage('')
    setMergeCtx(null)
  }

  const maxVal = useMemo(() => Math.max(...array, 1), [array])

  const handleSizeChange = (newSize) => {
    const capped = Math.min(newSize, maxSize)
    setSize(capped)
    const vals = randomArray(capped)
    setArray(vals)
    setItems(valuesToItems(vals))
    setSortedSet(new Set())
    setTreeState(null)
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Sorting Visualizer</h2>
          <p>Bars, numbers, or divide-and-conquer tree for Merge &amp; Quick Sort</p>
        </div>
        <div className={`status-badge${running ? ' running' : ''}`}>
          <span className="status-dot" />
          {running ? 'Sorting...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">View Mode</div>
            <div className="view-toggle three-col">
              <button className={`view-toggle-btn${viewMode === 'bars' ? ' active' : ''}`} disabled={running} onClick={() => switchViewMode('bars')}>📊 Bars</button>
              <button className={`view-toggle-btn${viewMode === 'numbers' ? ' active' : ''}`} disabled={running} onClick={() => switchViewMode('numbers')}>🔢 Numbers</button>
              <button className={`view-toggle-btn${viewMode === 'tree' ? ' active' : ''}`} disabled={running} onClick={() => switchViewMode('tree')}>🌳 Tree</button>
            </div>
            {viewMode === 'numbers' && <p className="info-text">Numbers lift &amp; slide when swapping</p>}
            {viewMode === 'tree' && <p className="info-text">Merge Sort / Quick Sort — merge phase mein left+right combine dikhega (max {TREE_MAX_SIZE} elements, slow speed recommended)</p>}
          </div>

          <div className="panel">
            <div className="panel-title">Controls</div>
            <div className="control-row">
              <label>Array Size</label>
              <span className="control-value">{size}{viewMode === 'tree' ? ` / ${TREE_MAX_SIZE}` : ''}</span>
            </div>
            <input type="range" min={5} max={maxSize} value={Math.min(size, maxSize)} disabled={running}
              onChange={e => handleSizeChange(+e.target.value)} />
            <div className="control-row" style={{ marginTop: 14 }}>
              <label>Speed</label>
              <span className="control-value">{getSpeedLabel(speed)}</span>
            </div>
            <input type="range" min={1} max={5} value={speed} disabled={running} onChange={e => setSpeed(+e.target.value)} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} disabled={running} onClick={generate}>↻ Generate Array</button>
          </div>

          <div className="panel">
            <div className="panel-title">Algorithms</div>
            {Object.entries(ALGORITHMS).map(([key, algo]) => (
              <button key={key} className={`algo-btn${activeAlgo === key ? ' active' : ''}`}
                disabled={running || (viewMode === 'tree' && !isTreeAlgo(key))}
                onClick={() => startSort(key)}
                title={viewMode === 'tree' && !isTreeAlgo(key) ? 'Tree view works with Merge & Quick Sort only' : ''}>
                <span className="algo-dot" style={{ background: algo.color }} />
                {algo.name}
                {isTreeAlgo(key) && viewMode === 'tree' && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--green)' }}>🌳</span>}
              </button>
            ))}
          </div>

          <div className="panel">
            <div className="panel-title">Legend</div>
            <div className="legend-row">
              {viewMode === 'tree' ? (
                <>
                  <div className="legend-item"><span className="legend-swatch sort-legend-default" /> Subarray</div>
                  <div className="legend-item"><span className="legend-swatch sort-legend-compare" /> Comparing</div>
                  <div className="legend-item"><span className="legend-swatch sort-legend-pivot" /> Pivot</div>
                  <div className="legend-item"><span className="legend-swatch sort-legend-swap" /> Swapping</div>
                  <div className="legend-item"><span className="legend-swatch sort-legend-sorted" /> Sorted</div>
                </>
              ) : (
                [['default','Unsorted'],['compare','Comparing'],['swap','Swapping'],['sorted','Sorted'],['pivot','Pivot']].map(([cls, label]) => (
                  <div key={cls} className="legend-item"><span className={`legend-swatch sort-legend-${cls}`} />{label}</div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className={`viz-canvas sort-viz-canvas${viewMode === 'numbers' ? ' numbers-mode' : ''}${viewMode === 'tree' ? ' tree-mode' : ''}`}>
            {viewMode === 'bars' && (
              <div className="sort-bars-track">
                {array.map((val, i) => (
                  <div key={i} className={`sort-bar ${getBarClass(i, highlights, sortedSet)}`}
                    style={{ width: `${100 / array.length - 0.3}%`, height: `${Math.max((val / maxVal) * 360, 4)}px`, minWidth: 2 }} />
                ))}
              </div>
            )}
            {viewMode === 'numbers' && (
              <SortNumbersGrid items={items} highlights={highlights} sortedSet={sortedSet} animating={swapAnimating || running} />
            )}
            {viewMode === 'tree' && (
              <SortTreeView tree={treeState} activeId={treeActiveId} phase={treePhase} message={treeMessage} mergeCtx={mergeCtx} />
            )}
          </div>

          {viewMode === 'tree' && array.length > 0 && (
            <div className="panel" style={{ marginTop: 12 }}>
              <div className="panel-title">Main Array (live)</div>
              <div className="array-cells">
                {array.map((v, i) => (
                  <div key={i} className="array-cell"><div className="array-cell-box">{v}</div><span className="array-cell-index">{i}</span></div>
                ))}
              </div>
            </div>
          )}

          {complexity && (
            <div className="stat-grid" style={{ marginTop: 16 }}>
              <div className="panel">
                <div className="panel-title">Time Complexity</div>
                <div className="stat-item"><span className="stat-label">Worst</span><span className="stat-value">{complexity.time.worst}</span></div>
                <div className="stat-item"><span className="stat-label">Average</span><span className="stat-value">{complexity.time.avg}</span></div>
                <div className="stat-item"><span className="stat-label">Best</span><span className="stat-value">{complexity.time.best}</span></div>
              </div>
              <div className="panel">
                <div className="panel-title">Space Complexity</div>
                <div className="stat-item"><span className="stat-label">Worst</span><span className="stat-value">{complexity.space}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
