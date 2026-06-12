import { useState, useCallback, useMemo } from 'react'
import {
  buildFenwick,
  buildFenwickSteps,
  updateFenwickSteps,
  queryFenwickSteps,
  rangeQueryFenwickSteps,
  randomArray,
} from '../algorithms/fenwick'
import { useAnimationRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

const INIT_FENWICK = (() => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6]
  return { arr, bit: buildFenwick(arr) }
})()

export default function FenwickTreeVisualizer() {
  const [size, setSize] = useState(8)
  const [array, setArray] = useState(INIT_FENWICK.arr)
  const [bit, setBit] = useState(INIT_FENWICK.bit)
  const [active, setActive] = useState([])
  const [visited, setVisited] = useState([])
  const [phase, setPhase] = useState('')
  const [sum, setSum] = useState(null)
  const [message, setMessage] = useState('Fenwick Tree (Binary Indexed Tree) — update & prefix sum in O(log n)')
  const [speed, setSpeed] = useState(2)

  const [updateIdx, setUpdateIdx] = useState(2)
  const [updateDelta, setUpdateDelta] = useState(5)
  const [queryIdx, setQueryIdx] = useState(5)
  const [rangeL, setRangeL] = useState(1)
  const [rangeR, setRangeR] = useState(5)

  const { running, run } = useAnimationRunner()

  const generate = () => {
    const arr = randomArray(size)
    setArray(arr)
    setBit(buildFenwick(arr))
    setActive([])
    setVisited([])
    setPhase('')
    setSum(null)
    setMessage('New array generated — Build dabao Fenwick tree banane ke liye')
  }

  const handleStep = useCallback((step) => {
    if (step.array) setArray(step.array)
    if (step.bit) setBit(step.bit)
    if (step.active) setActive(step.active)
    if (step.visited) setVisited(step.visited)
    else if (step.type !== 'visit' && step.type !== 'visit-done') setVisited([])
    if (step.phase) setPhase(step.phase)
    else if (step.type === 'done' || step.type === 'init') setPhase('')
    if (step.sum !== undefined) setSum(step.sum)
    if (step.result !== undefined) setSum(step.result)
    if (step.message) setMessage(step.message)
  }, [])

  const runOp = async (op) => {
    setSum(null)
    let gen
    switch (op) {
      case 'build': gen = buildFenwickSteps(array); break
      case 'update': gen = updateFenwickSteps(array, bit, updateIdx, updateDelta); break
      case 'query': gen = queryFenwickSteps(array, bit, queryIdx); break
      case 'range': gen = rangeQueryFenwickSteps(array, bit, rangeL, rangeR); break
      default: return
    }
    await run(gen, handleStep, speed)
  }

  const getBitClass = (i) => {
    if (active.includes(i)) return 'active'
    if (visited.includes(i)) return 'visited'
    return ''
  }

  const getArrClass = (i) => {
    if (active.includes(i + 1)) return 'active'
    return ''
  }

  const lsbHint = useMemo(() => {
    const idx = active[0]
    if (!idx || idx === 0) return null
    return idx & -idx
  }, [active])

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Fenwick Tree (BIT)</h2>
          <p>Point update &amp; prefix/range sum — LSB trick animated</p>
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
            <input type="range" min={4} max={12} value={size} disabled={running}
              onChange={e => {
                const s = +e.target.value
                setSize(s)
                const arr = randomArray(s)
                setArray(arr)
                setBit(buildFenwick(arr))
                setActive([])
                setVisited([])
                setSum(null)
                setMessage('Size changed — Build dabao')
              }} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={generate}>
              ↻ Generate Array
            </button>
          </div>

          <div className="panel">
            <div className="panel-title">Operations</div>
            <button className="algo-btn" disabled={running} onClick={() => runOp('build')}>⌁ Build Fenwick Tree</button>
            <div className="input-group" style={{ marginTop: 8 }}>
              <label className="input-label">Update index</label>
              <input type="number" min={0} max={size - 1} value={updateIdx} disabled={running} onChange={e => setUpdateIdx(+e.target.value)} />
            </div>
            <div className="input-group" style={{ marginTop: 8 }}>
              <label className="input-label">Delta (+/−)</label>
              <input type="number" value={updateDelta} disabled={running} onChange={e => setUpdateDelta(+e.target.value)} />
            </div>
            <button className="algo-btn" disabled={running} onClick={() => runOp('update')}>+ Update</button>
            <div className="input-group" style={{ marginTop: 8 }}>
              <label className="input-label">Prefix query index</label>
              <input type="number" min={0} max={size - 1} value={queryIdx} disabled={running} onChange={e => setQueryIdx(+e.target.value)} />
            </div>
            <button className="algo-btn" disabled={running} onClick={() => runOp('query')}>? Prefix Sum</button>
            <div className="action-bar" style={{ marginTop: 8 }}>
              <input type="number" min={0} max={size - 1} value={rangeL} disabled={running} onChange={e => setRangeL(+e.target.value)} placeholder="L" style={{ width: 60 }} />
              <input type="number" min={0} max={size - 1} value={rangeR} disabled={running} onChange={e => setRangeR(+e.target.value)} placeholder="R" style={{ width: 60 }} />
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={() => runOp('range')}>Range Sum</button>
            </div>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />

          <div className="panel">
            <div className="panel-title">Complexity</div>
            <div className="stat-item"><span className="stat-label">Update</span><span className="stat-value">O(log n)</span></div>
            <div className="stat-item"><span className="stat-label">Query</span><span className="stat-value">O(log n)</span></div>
          </div>
        </div>

        <div>
          <div className="viz-canvas fenwick-canvas">
            <div className="fenwick-section">
              <div className="fenwick-section-title">Original Array (0-indexed)</div>
              <div className="array-cells">
                {array.map((v, i) => (
                  <div key={i} className={`array-cell ${getArrClass(i)}`}>
                    <div className="array-cell-box">{v}</div>
                    <span className="array-cell-index">[{i}]</span>
                  </div>
                ))}
              </div>
            </div>

            {phase && (
              <div className={`fenwick-phase phase-${phase}`}>
                {phase.toUpperCase().replace('-', ' ')}
                {lsbHint != null && active.length > 0 && (
                  <span className="fenwick-lsb">LSB({active[0]}) = {lsbHint}</span>
                )}
              </div>
            )}

            <div className="fenwick-section">
              <div className="fenwick-section-title">Fenwick Tree / BIT (1-indexed)</div>
              <div className="fenwick-bit-row">
                <div className="fenwick-bit-cell empty"><span className="fenwick-bit-idx">0</span><span className="fenwick-bit-val">—</span></div>
                {array.map((_, i) => (
                  <div key={i} className={`fenwick-bit-cell ${getBitClass(i + 1)}`}>
                    <span className="fenwick-bit-idx">{i + 1}</span>
                    <span className="fenwick-bit-val">{bit[i + 1] ?? 0}</span>
                    <span className="fenwick-bit-bin">{((i + 1) >>> 0).toString(2).padStart(4, '0')}</span>
                  </div>
                ))}
              </div>
            </div>

            {sum !== null && (
              <div className="fenwick-result">
                Result: <strong>{sum}</strong>
              </div>
            )}
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-title">Output</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
