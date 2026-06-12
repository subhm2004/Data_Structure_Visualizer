import { useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { mergeSortTrace, quickSortTrace } from '../algorithms/recursion'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

function CallTreeNode({ node, activeId, depth = 0 }) {
  if (!node) return null
  return (
    <div className="recursion-node" style={{ marginLeft: depth * 20 }}>
      <div className={`recursion-box${node.active ? ' active' : ''}${node.type === 'root' ? ' root' : ''}`}>
        {node.label}
      </div>
      {node.children?.map((child, i) => (
        <CallTreeNode key={i} node={child} activeId={activeId} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function RecursionTreeVisualizer() {
  const [algo, setAlgo] = useState('merge')
  const [array, setArray] = useState([38, 27, 43, 3, 9, 82, 10])
  const [speed, setSpeed] = useState(3)
  const [running, setRunning] = useState(false)
  const [callStack, setCallStack] = useState([])
  const [activeCall, setActiveCall] = useState(null)
  const [message, setMessage] = useState('Watch the recursion call tree grow')
  const [sortedArray, setSortedArray] = useState([])

  const run = async () => {
    if (running) return
    setRunning(true)
    setCallStack([])
    setActiveCall(null)
    const data = [...array]
    const gen = algo === 'merge'
      ? mergeSortTrace(data, 0, data.length - 1)
      : quickSortTrace(data, 0, data.length - 1)
    const delay = getDelay(speed)
    const stack = []

    for (const step of gen) {
      flushSync(() => {
        setMessage(step.message)
        setSortedArray(step.array)
        if (step.type === 'call') {
          stack.push({ label: `${step.fn}(${step.args?.lo ?? step.lo}, ${step.args?.hi ?? step.hi})`, depth: step.depth, id: step.id })
          setCallStack([...stack])
          setActiveCall(step.id)
        } else if (step.type === 'return' || step.type === 'base') {
          stack.pop()
          setCallStack([...stack])
          setActiveCall(stack.length ? stack[stack.length - 1].id : null)
        } else {
          setActiveCall(step.id)
        }
      })
      await new Promise(r => setTimeout(r, delay))
    }
    setActiveCall(null)
    setRunning(false)
    setMessage('Recursion complete!')
  }

  const treeRoot = {
    label: algo === 'merge' ? 'mergeSort(0, n-1)' : 'quickSort(0, n-1)',
    type: 'root',
    children: callStack.map((c, i) => ({
      ...c,
      active: c.id === activeCall,
      children: i === callStack.length - 1 ? [] : [],
    })),
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>Recursion Tree</h2><p>Merge Sort &amp; Quick Sort call stack visualization</p></div>
        <div className={`status-badge${running ? ' running' : ''}`}><span className="status-dot" />{running ? 'Running...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Algorithm</div>
            <button className={`algo-btn${algo === 'merge' ? ' active' : ''}`} disabled={running} onClick={() => setAlgo('merge')}>Merge Sort</button>
            <button className={`algo-btn${algo === 'quick' ? ' active' : ''}`} disabled={running} onClick={() => setAlgo('quick')}>Quick Sort</button>
          </div>
          <button className="btn btn-primary" disabled={running} onClick={run}>▶ Visualize Recursion</button>
          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />
        </div>
        <div>
          <div className="viz-canvas" style={{ minHeight: 200, alignItems: 'flex-start', padding: 20 }}>
            <div className="recursion-tree">
              <div className="recursion-box root">{treeRoot.label}</div>
              {callStack.map((c, i) => (
                <div key={i} className="recursion-node" style={{ marginLeft: (c.depth + 1) * 24 }}>
                  <div className={`recursion-box${c.id === activeCall ? ' active' : ''}`}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-title">Array State</div>
            <div className="array-cells">{sortedArray.map((v, i) => (
              <div key={i} className="array-cell"><div className="array-cell-box">{v}</div></div>
            ))}</div>
          </div>
          <div className="panel" style={{ marginTop: 12 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
