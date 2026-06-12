import { useState, useCallback } from 'react'
import { useStepRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

function searchSteps(list, target) {
  const steps = []
  for (let i = 0; i < list.length; i++) {
    steps.push({ type: 'highlight', index: i, dir: 'both', message: `Check node ${i}: ${list[i]}` })
    if (list[i] === target) { steps.push({ type: 'found', index: i, message: `Found ${target}!` }); return steps }
  }
  steps.push({ type: 'notfound', message: `${target} not found` })
  return steps
}

function insertSteps(list, value, index) {
  const arr = [...list]
  const idx = Math.min(Math.max(0, index), arr.length)
  arr.splice(idx, 0, value)
  return [{ type: 'info', message: `Insert ${value} at ${idx}` }, { type: 'insert', list: arr, index: idx, message: `Inserted ${value}` }]
}

function deleteSteps(list, index) {
  const arr = [...list]
  const idx = Math.min(Math.max(0, index), arr.length - 1)
  const removed = arr[idx]
  arr.splice(idx, 1)
  return [{ type: 'highlight', index: idx, list: [...list], message: `Delete node ${idx}` }, { type: 'delete', list: arr, index: idx, message: `Deleted ${removed}` }]
}

export default function DoublyLinkedListVisualizer() {
  const [list, setList] = useState([10, 20, 30, 40])
  const [activeOp, setActiveOp] = useState('search')
  const [target, setTarget] = useState(20)
  const [insertVal, setInsertVal] = useState(25)
  const [insertIdx, setInsertIdx] = useState(2)
  const [deleteIdx, setDeleteIdx] = useState(1)
  const [speed, setSpeed] = useState(3)
  const [highlights, setHighlights] = useState({ index: -1, type: '' })
  const [traverseDir, setTraverseDir] = useState(null)
  const [message, setMessage] = useState('Doubly linked list with prev/next pointers')
  const { running, runSteps } = useStepRunner()

  const handleStep = useCallback((step) => {
    if (step.list) setList(step.list)
    setMessage(step.message)
    if (step.type === 'highlight') { setHighlights({ index: step.index, type: 'highlight' }); setTraverseDir(step.dir || null) }
    if (step.type === 'found') setHighlights({ index: step.index, type: 'found' })
    if (step.type === 'insert') setHighlights({ index: step.index, type: 'new-node' })
    if (step.type === 'delete') setHighlights({ index: step.index, type: 'delete' })
  }, [])

  const runOp = async () => {
    let steps
    if (activeOp === 'search') steps = searchSteps(list, target)
    else if (activeOp === 'insert') steps = insertSteps(list, insertVal, insertIdx)
    else steps = deleteSteps(list, deleteIdx)
    await runSteps(steps, handleStep, speed)
  }

  const traverse = async (dir) => {
    const steps = []
    if (dir === 'forward') {
      for (let i = 0; i < list.length; i++) steps.push({ type: 'highlight', index: i, dir: 'forward', message: `Forward: node ${i} → ${list[i]}` })
    } else {
      for (let i = list.length - 1; i >= 0; i--) steps.push({ type: 'highlight', index: i, dir: 'backward', message: `Backward: node ${i} → ${list[i]}` })
    }
    await runSteps(steps, handleStep, speed)
  }

  const getClass = (i) => highlights.index === i ? highlights.type || 'highlight' : ''

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>Doubly Linked List</h2><p>Prev &amp; next pointer animations</p></div>
        <div className={`status-badge${running ? ' running' : ''}`}><span className="status-dot" />{running ? 'Running...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Operations</div>
            {['search','insert','delete'].map(op => (
              <button key={op} className={`algo-btn${activeOp === op ? ' active' : ''}`} disabled={running} onClick={() => setActiveOp(op)}>{op.charAt(0).toUpperCase() + op.slice(1)}</button>
            ))}
            <div className="action-bar" style={{ marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={() => traverse('forward')}>→ Forward</button>
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={() => traverse('backward')}>← Backward</button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">Parameters</div>
            {activeOp === 'search' && <div className="input-group"><input type="number" value={target} disabled={running} onChange={e => setTarget(+e.target.value)} /></div>}
            {activeOp === 'insert' && (<><div className="input-group"><input type="number" value={insertVal} disabled={running} onChange={e => setInsertVal(+e.target.value)} /></div><div className="input-group" style={{ marginTop: 8 }}><input type="number" value={insertIdx} disabled={running} onChange={e => setInsertIdx(+e.target.value)} placeholder="Index" /></div></>)}
            {activeOp === 'delete' && <div className="input-group"><input type="number" value={deleteIdx} disabled={running} onChange={e => setDeleteIdx(+e.target.value)} /></div>}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={runOp}>▶ Run</button>
          </div>
          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />
        </div>
        <div>
          <div className="viz-canvas" style={{ alignItems: 'center' }}>
            <div className="dll-container">
              <span className="ll-null">HEAD →</span>
              {list.map((val, i) => (
                <div key={i} className="dll-node">
                  <div className={`dll-box ${getClass(i)}`}>
                    <div className="dll-prev">{i > 0 ? '◂' : '∅'}</div>
                    <div className="dll-value">{val}</div>
                    <div className="dll-next">{i < list.length - 1 ? '▸' : '∅'}</div>
                  </div>
                  {i < list.length - 1 && <span className="ll-arrow">⇄</span>}
                </div>
              ))}
              <span className="ll-null">← TAIL</span>
            </div>
            {traverseDir && <p className="info-text" style={{ textAlign: 'center', marginTop: 12 }}>Traversing {traverseDir}...</p>}
          </div>
          <div className="panel" style={{ marginTop: 12 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
