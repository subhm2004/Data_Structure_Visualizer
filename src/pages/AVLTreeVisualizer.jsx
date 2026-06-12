import { useState, useMemo, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { buildAVL, getAVLLayout, insertAVL, deleteAVL } from '../algorithms/avl'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

export default function AVLTreeVisualizer() {
  const [root, setRoot] = useState(() => buildAVL([30, 20, 40, 10, 25, 35, 50]))
  const [version, setVersion] = useState(0)
  const [inputVal, setInputVal] = useState(15)
  const [speed, setSpeed] = useState(3)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('AVL Tree — self-balancing with rotations')
  const [highlights, setHighlights] = useState({ pivot: -1, compare: -1, rotate: null })

  const layout = useMemo(() => getAVLLayout(root), [root, version])

  const runGenerator = async (gen) => {
    setRunning(true)
    const delay = getDelay(speed)
    let result = gen.next()
    while (!result.done) {
      const step = result.value
      flushSync(() => {
        setMessage(step.message)
        if (step.type === 'compare') setHighlights({ pivot: -1, compare: step.nodeVal, rotate: null })
        if (step.type === 'balance') setHighlights({ pivot: step.val, compare: -1, rotate: null })
        if (step.type === 'rotate') setHighlights({ pivot: step.pivot, compare: -1, rotate: step.kind })
      })
      await new Promise(r => setTimeout(r, delay))
      result = gen.next()
    }
    setRoot(result.value)
    setVersion(v => v + 1)
    setHighlights({ pivot: -1, compare: -1, rotate: null })
    setRunning(false)
  }

  const handleInsert = () => runGenerator(insertAVL(root, inputVal))
  const handleDelete = () => runGenerator(deleteAVL(root, inputVal))
  const handleReset = () => {
    setRoot(buildAVL([30, 20, 40, 10, 25, 35, 50]))
    setVersion(v => v + 1)
    setMessage('Tree reset')
  }

  const getNodeClass = (val) => {
    if (highlights.rotate && highlights.pivot === val) return 'rotate'
    if (highlights.pivot === val) return 'current'
    if (highlights.compare === val) return 'highlight'
    return ''
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>AVL Tree Visualizer</h2><p>Self-balancing BST with LL, RR, LR, RL rotations</p></div>
        <div className={`status-badge${running ? ' running' : ''}`}><span className="status-dot" />{running ? 'Balancing...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Operations</div>
            <div className="input-group"><input type="number" value={inputVal} disabled={running} onChange={e => setInputVal(+e.target.value)} /></div>
            <div className="action-bar" style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" disabled={running} onClick={handleInsert}>+ Insert</button>
              <button className="btn btn-danger btn-sm" disabled={running} onClick={handleDelete}>− Delete</button>
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={handleReset}>↻ Reset</button>
            </div>
          </div>
          {highlights.rotate && (
            <div className="panel">
              <div className="panel-title">Rotation</div>
              <p className="mono" style={{ color: 'var(--yellow)' }}>{highlights.rotate}</p>
            </div>
          )}
          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />
          <div className="panel">
            <div className="panel-title">Rotations</div>
            <div className="stat-item"><span className="stat-label">LL</span><span className="stat-value">Right rotate</span></div>
            <div className="stat-item"><span className="stat-label">RR</span><span className="stat-value">Left rotate</span></div>
            <div className="stat-item"><span className="stat-label">LR / RL</span><span className="stat-value">Double rotate</span></div>
          </div>
        </div>
        <div>
          <div className="viz-canvas" style={{ alignItems: 'center', overflow: 'auto', height: 360 }}>
            {root ? (
              <svg width={layout.width} height={layout.height}>
                {layout.edges.map((e, i) => <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className="tree-edge" />)}
                {layout.nodes.map(n => (
                  <g key={n.id} className={`tree-node avl-node ${getNodeClass(n.val)}`} transform={`translate(${n.x},${n.y})`}>
                    <circle r="24" />
                    <text>{n.val}</text>
                    <text y="36" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">bf:{n.balance}</text>
                  </g>
                ))}
              </svg>
            ) : <p style={{ color: 'var(--text-muted)' }}>Empty tree</p>}
          </div>
          <div className="panel" style={{ marginTop: 12 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
