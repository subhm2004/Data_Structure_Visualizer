import { useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { WEIGHTED_GRAPH, dijkstraSteps, bfsShortestSteps, getPath } from '../algorithms/dijkstra'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

export default function DijkstraVisualizer() {
  const [graph] = useState(WEIGHTED_GRAPH)
  const [start, setStart] = useState('A')
  const [target, setTarget] = useState('F')
  const [mode, setMode] = useState('dijkstra')
  const [speed, setSpeed] = useState(3)
  const [running, setRunning] = useState(false)
  const [visited, setVisited] = useState(new Set())
  const [current, setCurrent] = useState(null)
  const [dist, setDist] = useState({})
  const [activeEdge, setActiveEdge] = useState(null)
  const [path, setPath] = useState([])
  const [message, setMessage] = useState('Weighted shortest path visualization')

  const run = async () => {
    if (running) return
    setRunning(true)
    setVisited(new Set())
    setCurrent(null)
    setPath([])
    setActiveEdge(null)
    const delay = getDelay(speed)

    if (mode === 'dijkstra') {
      const gen = dijkstraSteps(graph, start)
      let prev = {}
      for (const step of gen) {
        flushSync(() => {
          setMessage(step.message)
          if (step.dist) setDist(step.dist)
          if (step.visited) setVisited(new Set(step.visited))
          if (step.node) setCurrent(step.node)
          if (step.from) setActiveEdge({ from: step.from, to: step.to })
          if (step.prev) prev = step.prev
          if (step.type === 'done') setPath(getPath(prev, target))
        })
        await new Promise(r => setTimeout(r, delay))
      }
    } else {
      const gen = bfsShortestSteps(graph, start, target)
      for (const step of gen) {
        flushSync(() => {
          setMessage(step.message)
          if (step.visited) setVisited(new Set(step.visited))
          if (step.node) setCurrent(step.node)
          if (step.path) setPath(step.path)
        })
        await new Promise(r => setTimeout(r, delay))
      }
    }
    setCurrent(null)
    setActiveEdge(null)
    setRunning(false)
  }

  const isEdgeActive = (from, to) => {
    if (!activeEdge) return path.includes(from) && path.includes(to) && Math.abs(path.indexOf(from) - path.indexOf(to)) === 1
    return (activeEdge.from === from && activeEdge.to === to) || (activeEdge.from === to && activeEdge.to === from)
  }

  const isPathEdge = (from, to) => {
    const fi = path.indexOf(from), ti = path.indexOf(to)
    return fi >= 0 && ti >= 0 && Math.abs(fi - ti) === 1
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>Shortest Path Visualizer</h2><p>Dijkstra &amp; BFS on weighted graphs</p></div>
        <div className={`status-badge${running ? ' running' : ''}`}><span className="status-dot" />{running ? 'Running...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Algorithm</div>
            <button className={`algo-btn${mode === 'dijkstra' ? ' active' : ''}`} disabled={running} onClick={() => setMode('dijkstra')}>📐 Dijkstra (weighted)</button>
            <button className={`algo-btn${mode === 'bfs' ? ' active' : ''}`} disabled={running} onClick={() => setMode('bfs')}>📡 BFS (unweighted)</button>
          </div>
          <div className="panel">
            <div className="panel-title">Nodes</div>
            <div className="control-row"><label>Start</label>
              <select value={start} disabled={running} onChange={e => setStart(e.target.value)}>{graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select>
            </div>
            <div className="control-row" style={{ marginTop: 8 }}><label>Target</label>
              <select value={target} disabled={running} onChange={e => setTarget(e.target.value)}>{graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={run}>▶ Run</button>
          </div>
          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />
        </div>
        <div>
          <div className="viz-canvas graph-canvas" style={{ height: 320 }}>
            <svg width={600} height={280} viewBox="0 0 600 280">
              {graph.edges.map((e, i) => {
                const a = graph.nodes.find(n => n.id === e.from)
                const b = graph.nodes.find(n => n.id === e.to)
                const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
                return (
                  <g key={i}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`graph-edge${isEdgeActive(e.from, e.to) || isPathEdge(e.from, e.to) ? ' active' : ''}`} />
                    <text x={mx} y={my - 6} fill="var(--text-muted)" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono">{e.weight}</text>
                  </g>
                )
              })}
              {graph.nodes.map(n => (
                <g key={n.id} className={`graph-node${current === n.id ? ' current' : ''}${visited.has(n.id) ? ' visited' : ''}`} transform={`translate(${n.x},${n.y})`}>
                  <circle r="24" /><text>{n.label}</text>
                  {mode === 'dijkstra' && dist[n.id] !== undefined && (
                    <text y="38" fill="var(--accent-light)" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">{dist[n.id] === Infinity ? '∞' : dist[n.id]}</text>
                  )}
                </g>
              ))}
            </svg>
          </div>
          {path.length > 0 && (
            <div className="panel" style={{ marginTop: 12 }}>
              <div className="panel-title">Shortest Path</div>
              <p className="mono" style={{ color: 'var(--green)' }}>{path.join(' → ')}</p>
            </div>
          )}
          <div className="panel" style={{ marginTop: 12 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
