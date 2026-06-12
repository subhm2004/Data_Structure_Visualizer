import { useState, useMemo, useCallback } from 'react'
import { getHeapLayout, insertHeap, extractHeap, buildHeap } from '../algorithms/heap'
import { useAnimationRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

export default function HeapVisualizer() {
  const [isMax, setIsMax] = useState(false)
  const [heap, setHeap] = useState([10, 20, 15, 30, 40])
  const [inputVal, setInputVal] = useState(25)
  const [highlights, setHighlights] = useState({ indices: [], index: -1 })
  const [extracted, setExtracted] = useState(null)
  const [message, setMessage] = useState('Min/Max Heap operations')
  const [speed, setSpeed] = useState(3)
  const { running, run } = useAnimationRunner()

  const layout = useMemo(() => getHeapLayout(heap), [heap])

  const handleStep = useCallback((step) => {
    setMessage(step.message)
    if (step.heap) setHeap(step.heap)
    if (step.indices) setHighlights({ indices: step.indices, index: -1 })
    if (step.index !== undefined) setHighlights({ indices: [], index: step.index })
    if (step.extracted !== undefined) setExtracted(step.extracted)
    if (step.value !== undefined) setExtracted(step.value)
  }, [])

  const runOp = async (op) => {
    const data = [...heap]
    let gen
    if (op === 'insert') gen = insertHeap(data, inputVal, isMax)
    else if (op === 'extract') gen = extractHeap(data, isMax)
    else gen = buildHeap(data, isMax)
    setExtracted(null)
    await run(gen, handleStep, speed)
    setHeap(data)
    setHighlights({ indices: [], index: -1 })
  }

  const getNodeClass = (idx) => {
    if (highlights.index === idx) return 'current'
    if (highlights.indices.includes(idx)) return 'highlight'
    return ''
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>Heap Visualizer</h2><p>Min &amp; Max heap — insert, extract, heapify</p></div>
        <div className={`status-badge${running ? ' running' : ''}`}><span className="status-dot" />{running ? 'Running...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Heap Type</div>
            <div className="view-toggle">
              <button className={`view-toggle-btn${!isMax ? ' active' : ''}`} disabled={running} onClick={() => setIsMax(false)}>⬇ Min Heap</button>
              <button className={`view-toggle-btn${isMax ? ' active' : ''}`} disabled={running} onClick={() => setIsMax(true)}>⬆ Max Heap</button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">Operations</div>
            <div className="input-group"><input type="number" value={inputVal} disabled={running} onChange={e => setInputVal(+e.target.value)} /></div>
            <div className="action-bar" style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" disabled={running} onClick={() => runOp('insert')}>+ Insert</button>
              <button className="btn btn-danger btn-sm" disabled={running} onClick={() => runOp('extract')}>Extract {isMax ? 'Max' : 'Min'}</button>
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={() => runOp('build')}>⌁ Heapify</button>
            </div>
          </div>
          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />
          {extracted !== null && (
            <div className="panel"><div className="panel-title">Extracted</div><p className="mono" style={{ color: 'var(--accent-light)' }}>{extracted}</p></div>
          )}
        </div>
        <div>
          <div className="viz-canvas heap-viz-canvas">
            <div className="tree-container">
              <svg className="tree-svg" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`}>
                {layout.edges.map((e, i) => <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className="tree-edge" />)}
                {layout.nodes.map(n => (
                  <g key={n.id} className={`tree-node ${getNodeClass(n.index)}`} transform={`translate(${n.x},${n.y})`}>
                    <circle r="22" /><text>{n.val}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-title">Array Representation</div>
            <div className="array-cells">{heap.map((v, i) => (
              <div key={i} className={`array-cell${highlights.indices.includes(i) || highlights.index === i ? ' highlight' : ''}`}>
                <div className="array-cell-box">{v}</div><span className="array-cell-index">[{i}]</span>
              </div>
            ))}</div>
          </div>
          <div className="panel" style={{ marginTop: 12 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
