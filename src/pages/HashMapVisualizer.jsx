import { useState, useCallback } from 'react'
import { createChainingTable, createProbingTable, insertChaining, searchChaining, deleteChaining, insertProbing, searchProbing, deleteProbing } from '../algorithms/hashmap'
import { useAnimationRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

export default function HashMapVisualizer() {
  const [mode, setMode] = useState('chaining')
  const [size, setSize] = useState(7)
  const [buckets, setBuckets] = useState(() => createChainingTable(7))
  const [table, setTable] = useState(() => createProbingTable(7))
  const [key, setKey] = useState(15)
  const [value, setValue] = useState(100)
  const [highlight, setHighlight] = useState({ idx: -1, chainIndex: -1 })
  const [message, setMessage] = useState('Hash Map with collision handling')
  const [speed, setSpeed] = useState(3)
  const { running, run } = useAnimationRunner()

  const reset = () => {
    setBuckets(createChainingTable(size))
    setTable(createProbingTable(size))
    setHighlight({ idx: -1, chainIndex: -1 })
    setMessage('Table reset')
  }

  const handleStep = useCallback((step) => {
    setMessage(step.message)
    if (step.buckets) setBuckets(step.buckets)
    if (step.table) setTable(step.table)
    setHighlight({ idx: step.idx ?? -1, chainIndex: step.chainIndex ?? -1 })
  }, [])

  const runOp = async (op) => {
    const data = mode === 'chaining' ? [...buckets.map(b => [...b])] : [...table]
    let gen
    if (mode === 'chaining') {
      if (op === 'insert') gen = insertChaining(data, key, value, size)
      else if (op === 'search') gen = searchChaining(data, key, size)
      else gen = deleteChaining(data, key, size)
    } else {
      if (op === 'insert') gen = insertProbing(data, key, value, size)
      else if (op === 'search') gen = searchProbing(data, key, size)
      else gen = deleteProbing(data, key, size)
    }
    await run(gen, handleStep, speed)
    if (mode === 'chaining') setBuckets(data)
    else setTable(data)
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>Hash Map Visualizer</h2><p>Chaining &amp; Linear Probing collision handling</p></div>
        <div className={`status-badge${running ? ' running' : ''}`}><span className="status-dot" />{running ? 'Running...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Collision Strategy</div>
            <div className="view-toggle">
              <button className={`view-toggle-btn${mode === 'chaining' ? ' active' : ''}`} disabled={running} onClick={() => { setMode('chaining'); reset() }}>🔗 Chaining</button>
              <button className={`view-toggle-btn${mode === 'probing' ? ' active' : ''}`} disabled={running} onClick={() => { setMode('probing'); reset() }}>🔍 Linear Probing</button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">Operations</div>
            <div className="input-group"><input type="number" value={key} disabled={running} onChange={e => setKey(+e.target.value)} placeholder="Key" /></div>
            <div className="input-group" style={{ marginTop: 8 }}><input type="number" value={value} disabled={running} onChange={e => setValue(+e.target.value)} placeholder="Value" /></div>
            <div className="action-bar" style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" disabled={running} onClick={() => runOp('insert')}>Insert</button>
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={() => runOp('search')}>Search</button>
              <button className="btn btn-danger btn-sm" disabled={running} onClick={() => runOp('delete')}>Delete</button>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }} disabled={running} onClick={reset}>↻ Reset</button>
          </div>
          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />
        </div>
        <div>
          <div className="viz-canvas hash-canvas">
            {mode === 'chaining' ? (
              <div className="hash-buckets">
                {buckets.map((chain, i) => (
                  <div key={i} className={`hash-bucket${highlight.idx === i ? ' active' : ''}`}>
                    <div className="hash-bucket-idx">[{i}]</div>
                    <div className="hash-chain">
                      {chain.length === 0 ? <span className="hash-empty">null</span> : chain.map((e, j) => (
                        <div key={j} className={`hash-entry${highlight.idx === i && highlight.chainIndex === j ? ' highlight' : ''}`}>
                          {e.key}:{e.value}{j < chain.length - 1 ? ' →' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hash-probing">
                {table.map((e, i) => (
                  <div key={i} className={`hash-slot${highlight.idx === i ? ' active' : ''}`}>
                    <span className="hash-slot-idx">{i}</span>
                    <span className="hash-slot-val">{e ? `${e.key}:${e.value}` : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="panel" style={{ marginTop: 16 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
