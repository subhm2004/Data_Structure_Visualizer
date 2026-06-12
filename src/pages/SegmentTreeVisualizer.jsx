import { useState, useCallback, useMemo } from 'react'
import {
  buildSegmentTree,
  buildSegmentTreeSteps,
  querySegmentTreeSteps,
  updateSegmentTreeSteps,
  getSegmentTreeLayout,
  randomArray,
} from '../algorithms/segmentTree'
import { useAnimationRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

const INIT_SEG = (() => {
  const arr = [2, 5, 1, 3, 4, 7, 2, 6]
  return { arr, tree: buildSegmentTree(arr) }
})()

export default function SegmentTreeVisualizer() {
  const [size, setSize] = useState(8)
  const [array, setArray] = useState(INIT_SEG.arr)
  const [tree, setTree] = useState(INIT_SEG.tree)
  const [activeNodes, setActiveNodes] = useState([])
  const [queryRange, setQueryRange] = useState(null)
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('Segment Tree — range sum query & point update in O(log n)')
  const [speed, setSpeed] = useState(2)

  const [queryL, setQueryL] = useState(1)
  const [queryR, setQueryR] = useState(5)
  const [updateIdx, setUpdateIdx] = useState(2)
  const [updateVal, setUpdateVal] = useState(10)

  const { running, run } = useAnimationRunner()
  const layout = useMemo(() => getSegmentTreeLayout(array, tree), [array, tree])

  const resetData = (newSize = size) => {
    const arr = randomArray(newSize)
    setArray(arr)
    setTree(buildSegmentTree(arr))
    setActiveNodes([])
    setQueryRange(null)
    setResult(null)
    setMessage('New array — Build dabao segment tree banane ke liye')
  }

  const handleStep = useCallback((step) => {
    if (step.array) setArray(step.array)
    if (step.tree) setTree(step.tree)
    if (step.activeNodes) setActiveNodes(step.activeNodes)
    if (step.query) setQueryRange(step.query)
    if (step.result !== undefined) setResult(step.result)
    if (step.message) setMessage(step.message)
  }, [])

  const runOp = async (op) => {
    setResult(null)
    setQueryRange(null)
    let gen
    switch (op) {
      case 'build': gen = buildSegmentTreeSteps(array); break
      case 'query': gen = querySegmentTreeSteps(array, tree, queryL, queryR); break
      case 'update': gen = updateSegmentTreeSteps(array, tree, updateIdx, updateVal); break
      default: return
    }
    await run(gen, handleStep, speed)
  }

  const getNodeClass = (nodeId) => {
    if (activeNodes.includes(nodeId)) return 'current'
    return ''
  }

  const getArrClass = (i) => {
    if (queryRange && i >= queryRange[0] && i <= queryRange[1]) return 'highlight'
    if (activeNodes.length && layout.nodes.find(n => n.isLeaf && n.start === i && activeNodes.includes(n.node))) return 'active'
    return ''
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Segment Tree</h2>
          <p>Range sum queries &amp; point updates — divide &amp; conquer on intervals</p>
        </div>
        <div className={`status-badge${running ? ' running' : ''}`}>
          <span className="status-dot" />{running ? 'Running...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Controls</div>
            <div className="control-row"><label>Size</label><span className="control-value">{size}</span></div>
            <input type="range" min={4} max={10} value={size} disabled={running}
              onChange={e => { setSize(+e.target.value); resetData(+e.target.value) }} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={() => resetData()}>
              ↻ Generate Array
            </button>
          </div>

          <div className="panel">
            <div className="panel-title">Operations</div>
            <button className="algo-btn" disabled={running} onClick={() => runOp('build')}>⌁ Build Segment Tree</button>
            <div className="action-bar" style={{ marginTop: 8 }}>
              <input type="number" min={0} max={size - 1} value={queryL} disabled={running} onChange={e => setQueryL(+e.target.value)} style={{ width: 55 }} />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input type="number" min={0} max={size - 1} value={queryR} disabled={running} onChange={e => setQueryR(+e.target.value)} style={{ width: 55 }} />
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={() => runOp('query')}>Range Query</button>
            </div>
            <div className="input-group" style={{ marginTop: 8 }}>
              <label className="input-label">Update index → value</label>
              <div className="action-bar">
                <input type="number" min={0} max={size - 1} value={updateIdx} disabled={running} onChange={e => setUpdateIdx(+e.target.value)} style={{ width: 55 }} />
                <input type="number" value={updateVal} disabled={running} onChange={e => setUpdateVal(+e.target.value)} style={{ width: 55 }} />
                <button className="btn btn-primary btn-sm" disabled={running} onClick={() => runOp('update')}>Update</button>
              </div>
            </div>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />

          <div className="panel">
            <div className="panel-title">Complexity</div>
            <div className="stat-item"><span className="stat-label">Build</span><span className="stat-value">O(n)</span></div>
            <div className="stat-item"><span className="stat-label">Query / Update</span><span className="stat-value">O(log n)</span></div>
          </div>
        </div>

        <div>
          <div className="viz-canvas seg-tree-canvas">
            <div className="tree-container">
              <svg className="tree-svg" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`}>
                {layout.edges.map((e, i) => (
                  <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className="tree-edge" />
                ))}
                {layout.nodes.map(n => (
                  <g key={n.id} className={`tree-node seg-node ${getNodeClass(n.node)}`} transform={`translate(${n.x},${n.y})`}>
                    <circle r="24" className="seg-circle" />
                    <text className="seg-val">{n.val}</text>
                    <text className="seg-label" y="38">{n.label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-title">Array</div>
            <div className="array-cells">
              {array.map((v, i) => (
                <div key={i} className={`array-cell ${getArrClass(i)}`}>
                  <div className="array-cell-box">{v}</div>
                  <span className="array-cell-index">[{i}]</span>
                </div>
              ))}
            </div>
          </div>

          {result !== null && (
            <div className="panel" style={{ marginTop: 12 }}>
              <div className="panel-title">Result</div>
              <p className="mono" style={{ color: 'var(--green)', fontSize: '1.1rem' }}>{result}</p>
            </div>
          )}

          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-title">Output</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
