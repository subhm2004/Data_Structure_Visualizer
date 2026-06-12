import { useState, useCallback } from 'react'
import { useStepRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

function searchSteps(list, target) {
  const steps = []
  for (let i = 0; i < list.length; i++) {
    steps.push({ type: 'highlight', index: i, message: `Checking node ${i}: value = ${list[i]}` })
    if (list[i] === target) {
      steps.push({ type: 'found', index: i, message: `Found ${target} at node ${i}!` })
      return steps
    }
  }
  steps.push({ type: 'notfound', message: `${target} not found in linked list` })
  return steps
}

function insertSteps(list, value, index) {
  const steps = []
  const arr = [...list]
  const idx = Math.min(Math.max(0, index), arr.length)
  steps.push({ type: 'info', message: `Inserting ${value} at position ${idx}` })
  arr.splice(idx, 0, value)
  steps.push({ type: 'insert', list: arr, index: idx, message: `Inserted ${value} at position ${idx}` })
  return steps
}

function deleteSteps(list, index) {
  const steps = []
  const arr = [...list]
  const idx = Math.min(Math.max(0, index), arr.length - 1)
  steps.push({ type: 'highlight', index: idx, list: arr, message: `Deleting node ${idx}: value = ${arr[idx]}` })
  const removed = arr.splice(idx, 1)
  steps.push({ type: 'delete', list: arr, index: idx, message: `Deleted ${removed[0]} from position ${idx}` })
  return steps
}

function reverseSteps(list) {
  const steps = []
  const arr = [...list]
  steps.push({ type: 'info', message: 'Reversing linked list...' })
  let prev = null, current = 0
  const reversed = [...arr].reverse()
  for (let i = 0; i < arr.length; i++) {
    steps.push({ type: 'highlight', index: i, list: arr, message: `Reversing pointer at node ${i}` })
  }
  steps.push({ type: 'reverse', list: reversed, message: `Reversed: [${reversed.join(' → ')} → null]` })
  return steps
}

const OPS = [
  { key: 'search', label: 'Search' },
  { key: 'insert', label: 'Insert' },
  { key: 'delete', label: 'Delete' },
  { key: 'reverse', label: 'Reverse' },
]

export default function LinkedListVisualizer() {
  const [list, setList] = useState([10, 20, 30, 40, 50])
  const [activeOp, setActiveOp] = useState('search')
  const [target, setTarget] = useState(30)
  const [insertVal, setInsertVal] = useState(25)
  const [insertIdx, setInsertIdx] = useState(2)
  const [deleteIdx, setDeleteIdx] = useState(0)
  const [speed, setSpeed] = useState(3)
  const [highlights, setHighlights] = useState({ index: -1, type: '' })
  const [message, setMessage] = useState('Visualize linked list operations with pointer animation')
  const { running, runSteps } = useStepRunner()

  const handleStep = useCallback((step) => {
    if (step.list) setList(step.list)
    setMessage(step.message)
    if (step.type === 'highlight') setHighlights({ index: step.index, type: 'highlight' })
    if (step.type === 'found') setHighlights({ index: step.index, type: 'found' })
    if (step.type === 'insert') setHighlights({ index: step.index, type: 'new-node' })
    if (step.type === 'delete') setHighlights({ index: step.index, type: 'delete' })
    if (step.type === 'reverse') setHighlights({ index: -1, type: '' })
    if (step.type === 'notfound') setHighlights({ index: -1, type: '' })
  }, [])

  const runOp = async () => {
    let steps
    switch (activeOp) {
      case 'search': steps = searchSteps(list, target); break
      case 'insert': steps = insertSteps(list, insertVal, insertIdx); break
      case 'delete': steps = deleteSteps(list, deleteIdx); break
      case 'reverse': steps = reverseSteps(list); break
      default: return
    }
    await runSteps(steps, handleStep, speed)
  }

  const getNodeClass = (i) => {
    if (highlights.index === i) return highlights.type || 'highlight'
    return ''
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Linked List Visualizer</h2>
          <p>Search, insert, delete and reverse operations</p>
        </div>
        <div className={`status-badge${running ? ' running' : ''}`}>
          <span className="status-dot" />{running ? 'Running...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            {activeOp === 'search' && (
              <div className="input-group"><input type="number" value={target} disabled={running} onChange={e => setTarget(+e.target.value)} /></div>
            )}
            {activeOp === 'insert' && (
              <>
                <div className="input-group"><input type="number" value={insertVal} disabled={running} onChange={e => setInsertVal(+e.target.value)} placeholder="Value" /></div>
                <div className="input-group" style={{ marginTop: 8 }}><input type="number" value={insertIdx} disabled={running} onChange={e => setInsertIdx(+e.target.value)} placeholder="Position" /></div>
              </>
            )}
            {activeOp === 'delete' && (
              <div className="input-group"><input type="number" value={deleteIdx} disabled={running} onChange={e => setDeleteIdx(+e.target.value)} placeholder="Position" /></div>
            )}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={runOp}>
              ▶ Run Operation
            </button>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />

          <div className="panel">
            <div className="panel-title">Complexity</div>
            <div className="stat-item"><span className="stat-label">Search</span><span className="stat-value">O(n)</span></div>
            <div className="stat-item"><span className="stat-label">Insert</span><span className="stat-value">O(n)</span></div>
            <div className="stat-item"><span className="stat-label">Delete</span><span className="stat-value">O(n)</span></div>
          </div>
        </div>

        <div>
          <div className="viz-canvas" style={{ alignItems: 'center', minHeight: 200 }}>
            <div className="ll-container">
              <span className="ll-null" style={{ marginRight: 8 }}>HEAD →</span>
              {list.map((val, i) => (
                <div key={`${val}-${i}`} className="ll-node">
                  <div className={`ll-box ${getNodeClass(i)}`}>
                    <div className="ll-value">{val}</div>
                    <div className="ll-pointer">{i < list.length - 1 ? '▸' : '∅'}</div>
                  </div>
                  {i < list.length - 1 && <span className="ll-arrow">→</span>}
                </div>
              ))}
              <span className="ll-null">null</span>
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
