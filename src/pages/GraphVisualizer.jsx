import { useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { DEFAULT_GRAPH, GRAPH_PRESETS, dfsSteps, bfsSteps } from '../algorithms/graph'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

export default function GraphVisualizer() {
  const [graph, setGraph] = useState(DEFAULT_GRAPH)
  const [startNode, setStartNode] = useState('A')
  const [speed, setSpeed] = useState(3)
  const [mode, setMode] = useState(null)
  const [running, setRunning] = useState(false)

  const [visited, setVisited] = useState(new Set())
  const [current, setCurrent] = useState(null)
  const [activeEdge, setActiveEdge] = useState(null)
  const [stack, setStack] = useState([])
  const [queue, setQueue] = useState([])
  const [order, setOrder] = useState([])
  const [message, setMessage] = useState('Select DFS or BFS to start traversal')

  const reset = () => {
    setVisited(new Set())
    setCurrent(null)
    setActiveEdge(null)
    setStack([])
    setQueue([])
    setOrder([])
    setMode(null)
    setMessage('Select DFS or BFS to start traversal')
  }

  const handleStep = useCallback((step) => {
    if (step.type === 'start') {
      setVisited(new Set())
      setCurrent(step.node)
      setOrder([])
      setMessage(step.message)
    }
    if (step.type === 'visit') {
      setCurrent(step.node)
      setVisited(new Set(step.visited))
      setOrder(step.order || [])
      setStack(step.stack || [])
      setQueue(step.queue || [])
      setMessage(step.message)
    }
    if (step.type === 'push') {
      setCurrent(step.node)
      setStack(step.stack)
      setMessage(step.message)
    }
    if (step.type === 'pop') {
      setStack(step.stack)
      setCurrent(step.stack.length ? step.stack[step.stack.length - 1] : null)
      setMessage(step.message)
    }
    if (step.type === 'enqueue') {
      setQueue(step.queue)
      setMessage(step.message)
    }
    if (step.type === 'edge') {
      setActiveEdge(step.active ? { from: step.from, to: step.to } : null)
      if (step.message) setMessage(step.message)
    }
    if (step.type === 'done') {
      setCurrent(null)
      setActiveEdge(null)
      setVisited(new Set(step.visited))
      setOrder(step.order || [])
      setMessage(step.message)
    }
  }, [])

  const runTraversal = async (type) => {
    if (running) return
    reset()
    setMode(type)
    setRunning(true)

    const generator = type === 'dfs'
      ? dfsSteps(graph.adj, startNode)
      : bfsSteps(graph.adj, startNode)

    const delay = getDelay(speed)

    try {
      for (const step of generator) {
        flushSync(() => handleStep(step))
        await new Promise(r => setTimeout(r, delay))
      }
    } finally {
      setRunning(false)
    }
  }

  const loadPreset = (key) => {
    const preset = GRAPH_PRESETS[key]
    setGraph(preset)
    setStartNode(preset.nodes[0].id)
    reset()
    setMessage(`Loaded ${key} graph preset`)
  }

  const getNodeClass = (id) => {
    if (current === id) return 'current'
    if (visited.has(id)) return 'visited'
    return ''
  }

  const isEdgeActive = (from, to) => {
    if (!activeEdge) return false
    return (activeEdge.from === from && activeEdge.to === to) ||
           (activeEdge.from === to && activeEdge.to === from)
  }

  const svgW = 600, svgH = 300

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Graph Visualizer</h2>
          <p>DFS & BFS traversal with stack/queue animation</p>
        </div>
        <div className={`status-badge${running ? ' running' : ''}`}>
          <span className="status-dot" />{running ? 'Traversing...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Traversal</div>
            <button className={`algo-btn${mode === 'dfs' ? ' active' : ''}`} disabled={running} onClick={() => runTraversal('dfs')}>
              🔍 DFS (Depth-First Search)
            </button>
            <button className={`algo-btn${mode === 'bfs' ? ' active' : ''}`} disabled={running} onClick={() => runTraversal('bfs')}>
              📡 BFS (Breadth-First Search)
            </button>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }} disabled={running} onClick={reset}>
              ↻ Reset
            </button>
          </div>

          <div className="panel">
            <div className="panel-title">Start Node</div>
            <select value={startNode} disabled={running} onChange={e => setStartNode(e.target.value)} style={{ width: '100%' }}>
              {graph.nodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>

          <div className="panel">
            <div className="panel-title">Graph Preset</div>
            {Object.keys(GRAPH_PRESETS).map(key => (
              <button key={key} className="algo-btn" disabled={running} onClick={() => loadPreset(key)}>
                {key.charAt(0).toUpperCase() + key.slice(1)} Graph
              </button>
            ))}
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />

          <div className="panel">
            <div className="panel-title">Complexity</div>
            <div className="stat-item"><span className="stat-label">DFS Time</span><span className="stat-value">O(V+E)</span></div>
            <div className="stat-item"><span className="stat-label">BFS Time</span><span className="stat-value">O(V+E)</span></div>
            <div className="stat-item"><span className="stat-label">Space</span><span className="stat-value">O(V)</span></div>
          </div>
        </div>

        <div>
          <div className="viz-canvas graph-canvas" style={{ alignItems: 'center', justifyContent: 'center', height: 340 }}>
            <svg className="graph-svg" width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
              {graph.edges.map(([from, to], i) => {
                const a = graph.nodes.find(n => n.id === from)
                const b = graph.nodes.find(n => n.id === to)
                if (!a || !b) return null
                return (
                  <line key={i}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    className={`graph-edge${isEdgeActive(from, to) ? ' active' : ''}`}
                  />
                )
              })}
              {graph.nodes.map(n => (
                <g key={n.id} className={`graph-node ${getNodeClass(n.id)}`} transform={`translate(${n.x},${n.y})`}>
                  <circle r="24" />
                  <text>{n.label}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="panel">
              <div className="panel-title">{mode === 'bfs' ? 'Queue' : 'Stack'}</div>
              <div className="ds-display">
                {(mode === 'bfs' ? queue : stack).length === 0 ? (
                  <span className="ds-empty">Empty</span>
                ) : (
                  (mode === 'bfs' ? queue : stack).map((item, i) => (
                    <span key={i} className={`ds-chip${(mode === 'bfs' ? i === 0 : i === stack.length - 1) ? ' active' : ''}`}>
                      {item}
                    </span>
                  ))
                )}
              </div>
              <p className="info-text">{mode === 'bfs' ? 'Front ← → Rear' : 'Bottom ↑ Top'}</p>
            </div>

            <div className="panel">
              <div className="panel-title">Visit Order</div>
              {order.length > 0 ? (
                <p className="mono" style={{ fontSize: '0.85rem', color: 'var(--accent-light)' }}>
                  {order.join(' → ')}
                </p>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>—</p>
              )}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">Output</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p>
          </div>

          <div className="legend-row" style={{ marginTop: 12 }}>
            <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--accent)' }} /> Unvisited</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--yellow)' }} /> Current</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--green)' }} /> Visited</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--cyan)' }} /> Active Edge</div>
          </div>
        </div>
      </div>
    </div>
  )
}
