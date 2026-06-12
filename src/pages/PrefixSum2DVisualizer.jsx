import { useState, useCallback } from 'react'
import {
  buildPrefix2D,
  buildPrefix2DSteps,
  queryPrefix2DSteps,
  randomMatrix,
} from '../algorithms/prefixSum2d'
import { useAnimationRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

export default function PrefixSum2DVisualizer() {
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(4)
  const [matrix, setMatrix] = useState(() => randomMatrix(4, 4))
  const [prefix, setPrefix] = useState(() => buildPrefix2D(randomMatrix(4, 4)))
  const [highlight, setHighlight] = useState([])
  const [highlightTypes, setHighlightTypes] = useState({})
  const [region, setRegion] = useState(null)
  const [formula, setFormula] = useState(null)
  const [activeCorner, setActiveCorner] = useState(null)
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('2D Prefix Sum — O(1) submatrix sum after O(n×m) preprocess')
  const [speed, setSpeed] = useState(2)
  const [showPrefix, setShowPrefix] = useState(true)

  const [r1, setR1] = useState(1)
  const [c1, setC1] = useState(1)
  const [r2, setR2] = useState(2)
  const [c2, setC2] = useState(3)

  const { running, run } = useAnimationRunner()

  const resetData = (r = rows, c = cols) => {
    const m = randomMatrix(r, c)
    setMatrix(m)
    setPrefix(buildPrefix2D(m))
    setHighlight([])
    setHighlightTypes({})
    setRegion(null)
    setFormula(null)
    setResult(null)
    setMessage('New matrix — Build dabao prefix table banane ke liye')
  }

  const handleStep = useCallback((step) => {
    if (step.matrix) setMatrix(step.matrix)
    if (step.prefix) setPrefix(step.prefix)
    if (step.highlight) setHighlight(step.highlight)
    if (step.highlightTypes) setHighlightTypes(step.highlightTypes)
    else setHighlightTypes({})
    if (step.region) setRegion(step.region)
    if (step.formula) setFormula(step.formula)
    if (step.parts) setFormula(step.parts)
    if (step.corner) setActiveCorner(step.corner)
    if (step.type === 'init' || step.type === 'build') setActiveCorner(null)
    if (step.result !== undefined) setResult(step.result)
    if (step.message) setMessage(step.message)
  }, [])

  const runOp = async (op) => {
    setResult(null)
    setFormula(null)
    let gen
    if (op === 'build') gen = buildPrefix2DSteps(matrix)
    else gen = queryPrefix2DSteps(matrix, prefix, r1, c1, r2, c2)
    await run(gen, handleStep, speed)
  }

  const isHighlighted = (r, c, grid) => {
    const key = grid === 'prefix' ? `${r},${c}` : `${r},${c}`
    return highlight.some(([hr, hc]) => hr === r && hc === c)
  }

  const getCellClass = (r, c, grid) => {
    const key = `${r},${c}`
    const classes = []
    if (isHighlighted(r, c, grid)) classes.push('highlight')
    if (highlightTypes[key]) classes.push(`hl-${highlightTypes[key]}`)
    if (region && grid === 'matrix') {
      const { r1: rr1, c1: cc1, r2: rr2, c2: cc2 } = region
      if (r >= rr1 && r <= rr2 && c >= cc1 && c <= cc2) classes.push('in-region')
    }
    if (formula?.corner && grid === 'prefix') {
      const cornerMap = { A: [r2 + 1, c2 + 1], B: [r1, c2 + 1], C: [r2 + 1, c1], D: [r1, c1] }
      const [cr, cc] = cornerMap[formula.corner] || []
      if (cr === r && cc === c) classes.push('corner')
    }
    if (activeCorner && grid === 'prefix') {
      const cornerMap = { A: [r2 + 1, c2 + 1], B: [r1, c2 + 1], C: [r2 + 1, c1], D: [r1, c1] }
      const [cr, cc] = cornerMap[activeCorner] || []
      if (cr === r && cc === c) classes.push('corner')
    }
    return classes.join(' ')
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>2D Prefix Sum</h2>
          <p>Submatrix sum in O(1) — inclusion-exclusion animated</p>
        </div>
        <div className={`status-badge${running ? ' running' : ''}`}>
          <span className="status-dot" />{running ? 'Running...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Matrix Size</div>
            <div className="control-row"><label>Rows</label><span className="control-value">{rows}</span></div>
            <input type="range" min={3} max={6} value={rows} disabled={running}
              onChange={e => { setRows(+e.target.value); resetData(+e.target.value, cols) }} />
            <div className="control-row" style={{ marginTop: 8 }}><label>Cols</label><span className="control-value">{cols}</span></div>
            <input type="range" min={3} max={6} value={cols} disabled={running}
              onChange={e => { setCols(+e.target.value); resetData(rows, +e.target.value) }} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={() => resetData()}>
              ↻ Generate Matrix
            </button>
          </div>

          <div className="panel">
            <div className="panel-title">Operations</div>
            <button className="algo-btn" disabled={running} onClick={() => runOp('build')}>⌁ Build Prefix Table</button>
            <p className="info-text" style={{ marginTop: 8 }}>Query region (0-indexed):</p>
            <div className="input-group"><label className="input-label">Top-left (r1, c1)</label>
              <div className="action-bar">
                <input type="number" min={0} max={rows - 1} value={r1} disabled={running} onChange={e => setR1(+e.target.value)} style={{ width: 55 }} />
                <input type="number" min={0} max={cols - 1} value={c1} disabled={running} onChange={e => setC1(+e.target.value)} style={{ width: 55 }} />
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 8 }}><label className="input-label">Bottom-right (r2, c2)</label>
              <div className="action-bar">
                <input type="number" min={0} max={rows - 1} value={r2} disabled={running} onChange={e => setR2(+e.target.value)} style={{ width: 55 }} />
                <input type="number" min={0} max={cols - 1} value={c2} disabled={running} onChange={e => setC2(+e.target.value)} style={{ width: 55 }} />
              </div>
            </div>
            <button className="algo-btn" disabled={running} onClick={() => runOp('query')}>? Submatrix Sum</button>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />

          <div className="panel">
            <div className="panel-title">View</div>
            <label className="toggle-row">
              <input type="checkbox" checked={showPrefix} onChange={e => setShowPrefix(e.target.checked)} />
              Show prefix table
            </label>
          </div>

          <div className="panel">
            <div className="panel-title">Formula</div>
            <p className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              prefix[r][c] = val + top + left − diag<br />
              sum = A − B − C + D
            </p>
          </div>
        </div>

        <div>
          <div className="viz-canvas prefix2d-canvas">
            <div className="prefix2d-section">
              <div className="prefix2d-title">Original Matrix</div>
              <div className="matrix-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {matrix.map((row, r) => row.map((val, c) => (
                  <div key={`m-${r}-${c}`} className={`matrix-cell ${getCellClass(r, c, 'matrix')}`}>
                    <span className="matrix-val">{val}</span>
                    <span className="matrix-coord">{r},{c}</span>
                  </div>
                )))}
              </div>
            </div>

            {showPrefix && (
              <div className="prefix2d-section">
                <div className="prefix2d-title">Prefix Sum Table (1-indexed)</div>
                <div className="matrix-grid prefix-table" style={{ gridTemplateColumns: `repeat(${cols + 1}, 1fr)` }}>
                  {prefix.map((row, r) => row.map((val, c) => (
                    <div key={`p-${r}-${c}`} className={`matrix-cell ${getCellClass(r, c, 'prefix')}${r === 0 || c === 0 ? ' axis' : ''}`}>
                      <span className="matrix-val">{val}</span>
                      {r > 0 && c > 0 && <span className="matrix-coord">{r},{c}</span>}
                    </div>
                  )))}
                </div>
              </div>
            )}

            {formula && typeof formula === 'object' && formula.A !== undefined && (
              <div className="prefix2d-formula">
                A({formula.A}) − B({formula.B}) − C({formula.C}) + D({formula.D}) = <strong>{result}</strong>
              </div>
            )}

            {result !== null && !formula?.A && (
              <div className="prefix2d-result">Sum = <strong>{result}</strong></div>
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
