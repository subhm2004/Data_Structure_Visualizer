import { useState, useCallback } from 'react'
import { useStepRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

function linearSearchSteps(arr, target) {
  const steps = []
  for (let i = 0; i < arr.length; i++) {
    steps.push({ type: 'highlight', index: i, message: `Checking index ${i}: arr[${i}] = ${arr[i]}` })
    if (arr[i] === target) {
      steps.push({ type: 'found', index: i, message: `Found ${target} at index ${i}!` })
      return steps
    }
  }
  steps.push({ type: 'notfound', message: `${target} not found in array` })
  return steps
}

function binarySearchSteps(arr, target) {
  const steps = []
  const sorted = [...arr].sort((a, b) => a - b)
  steps.push({ type: 'init', array: sorted, message: 'Array must be sorted for binary search' })
  let lo = 0, hi = sorted.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    steps.push({ type: 'highlight', indices: [lo, mid, hi], array: sorted, message: `lo=${lo}, mid=${mid}, hi=${hi} → arr[${mid}]=${sorted[mid]}` })
    if (sorted[mid] === target) {
      steps.push({ type: 'found', index: mid, array: sorted, message: `Found ${target} at index ${mid}!` })
      return steps
    }
    if (sorted[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  steps.push({ type: 'notfound', array: sorted, message: `${target} not found` })
  return steps
}

function insertSteps(arr, value, index) {
  const steps = []
  const a = [...arr]
  const idx = Math.min(Math.max(0, index), a.length)
  steps.push({ type: 'info', message: `Inserting ${value} at index ${idx}` })
  a.splice(idx, 0, value)
  steps.push({ type: 'insert', array: a, index: idx, message: `Inserted ${value} at index ${idx}` })
  return steps
}

function deleteSteps(arr, index) {
  const steps = []
  const a = [...arr]
  const idx = Math.min(Math.max(0, index), a.length - 1)
  steps.push({ type: 'highlight', index: idx, array: a, message: `Deleting arr[${idx}] = ${a[idx]}` })
  const removed = a.splice(idx, 1)
  steps.push({ type: 'delete', array: a, index: idx, message: `Deleted ${removed[0]} from index ${idx}` })
  return steps
}

const OPS = [
  { key: 'linear', label: 'Linear Search' },
  { key: 'binary', label: 'Binary Search' },
  { key: 'insert', label: 'Insert' },
  { key: 'delete', label: 'Delete' },
]

export default function ArrayVisualizer() {
  const [array, setArray] = useState([23, 45, 12, 67, 34, 89, 56, 78, 10, 43])
  const [size, setSize] = useState(10)
  const [speed, setSpeed] = useState(3)
  const [target, setTarget] = useState(67)
  const [insertVal, setInsertVal] = useState(50)
  const [insertIdx, setInsertIdx] = useState(3)
  const [deleteIdx, setDeleteIdx] = useState(0)
  const [activeOp, setActiveOp] = useState('linear')
  const [highlights, setHighlights] = useState({ indices: [], found: -1, insert: -1, delete: -1 })
  const [message, setMessage] = useState('Select an operation to begin')
  const { running, runSteps } = useStepRunner()

  const generate = () => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10)
    setArray(arr)
    setHighlights({ indices: [], found: -1, insert: -1, delete: -1 })
    setMessage('New array generated')
  }

  const handleStep = useCallback((step) => {
    if (step.array) setArray(step.array)
    setMessage(step.message)
    if (step.type === 'highlight') setHighlights({ indices: step.indices ?? [step.index], found: -1, insert: -1, delete: -1 })
    if (step.type === 'found') setHighlights({ indices: [step.index], found: step.index, insert: -1, delete: -1 })
    if (step.type === 'insert') setHighlights({ indices: [], found: -1, insert: step.index, delete: -1 })
    if (step.type === 'delete') setHighlights({ indices: [], found: -1, insert: -1, delete: step.index })
    if (step.type === 'notfound') setHighlights({ indices: [], found: -1, insert: -1, delete: -1 })
    if (step.type === 'init') setHighlights({ indices: [], found: -1, insert: -1, delete: -1 })
  }, [])

  const runOp = async () => {
    setActiveOp(activeOp)
    let steps
    switch (activeOp) {
      case 'linear': steps = linearSearchSteps(array, target); break
      case 'binary': steps = binarySearchSteps(array, target); break
      case 'insert': steps = insertSteps(array, insertVal, insertIdx); break
      case 'delete': steps = deleteSteps(array, deleteIdx); break
      default: return
    }
    await runSteps(steps, handleStep, speed)
  }

  const getCellClass = (i) => {
    if (highlights.found === i) return 'found'
    if (highlights.insert === i) return 'insert'
    if (highlights.delete === i) return 'delete'
    if (highlights.indices.includes(i)) return 'highlight'
    return ''
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Array Visualizer</h2>
          <p>Search, insert and delete operations on arrays</p>
        </div>
        <div className={`status-badge${running ? ' running' : ''}`}>
          <span className="status-dot" />{running ? 'Running...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Controls</div>
            <div className="control-row"><label>Array Size</label><span className="control-value">{size}</span></div>
            <input type="range" min={5} max={20} value={size} disabled={running}
              onChange={e => setSize(+e.target.value)} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={generate}>
              ↻ Generate Array
            </button>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />

          <div className="panel">
            <div className="panel-title">Operations</div>
            {OPS.map(op => (
              <button key={op.key} className={`algo-btn${activeOp === op.key ? ' active' : ''}`}
                disabled={running} onClick={() => setActiveOp(op.key)}>
                {op.label}
              </button>
            ))}
          </div>

          <div className="panel">
            <div className="panel-title">Parameters</div>
            {(activeOp === 'linear' || activeOp === 'binary') && (
              <div className="input-group">
                <input type="number" value={target} disabled={running} onChange={e => setTarget(+e.target.value)} placeholder="Target value" />
              </div>
            )}
            {activeOp === 'insert' && (
              <>
                <div className="input-group"><input type="number" value={insertVal} disabled={running} onChange={e => setInsertVal(+e.target.value)} placeholder="Value" /></div>
                <div className="input-group" style={{ marginTop: 8 }}><input type="number" value={insertIdx} disabled={running} onChange={e => setInsertIdx(+e.target.value)} placeholder="Index" /></div>
              </>
            )}
            {activeOp === 'delete' && (
              <div className="input-group"><input type="number" value={deleteIdx} disabled={running} onChange={e => setDeleteIdx(+e.target.value)} placeholder="Index" /></div>
            )}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={runOp}>
              ▶ Run Operation
            </button>
            {activeOp === 'binary' && <p className="info-text">Binary search auto-sorts the array first.</p>}
          </div>
        </div>

        <div>
          <div className="viz-canvas" style={{ alignItems: 'center' }}>
            <div className="array-cells">
              {array.map((val, i) => (
                <div key={i} className={`array-cell ${getCellClass(i)}`}>
                  <div className="array-cell-box">{val}</div>
                  <span className="array-cell-index">[{i}]</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">Output</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
