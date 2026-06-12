import { useState } from 'react'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

export default function QueueVisualizer() {
  const [queue, setQueue] = useState([10, 20, 30, 40])
  const [inputVal, setInputVal] = useState('')
  const [speed, setSpeed] = useState(3)
  const [message, setMessage] = useState('Queue follows FIFO — First In, First Out')
  const [animating, setAnimating] = useState(null)
  const [busy, setBusy] = useState(false)

  const delay = getDelay(speed)

  const enqueue = () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) { setMessage('Enter a valid number'); return }
    setBusy(true)
    setAnimating('enqueue')
    setMessage(`Enqueuing ${val}...`)
    setTimeout(() => {
      setQueue(prev => [...prev, val])
      setMessage(`Enqueued ${val}. Rear = ${val}`)
      setInputVal('')
      setAnimating(null)
      setBusy(false)
    }, Math.max(delay, 200))
  }

  const dequeue = () => {
    if (queue.length === 0) { setMessage('Queue Underflow! Cannot dequeue from empty queue.'); return }
    setBusy(true)
    setAnimating('dequeue')
    const val = queue[0]
    setMessage(`Dequeuing ${val} from front...`)
    setTimeout(() => {
      setQueue(prev => {
        const next = prev.slice(1)
        setMessage(`Dequeued ${val} from front.${next.length ? ` Front = ${next[0]}` : ' Queue is now empty.'}`)
        return next
      })
      setAnimating(null)
      setBusy(false)
    }, Math.max(delay, 200))
  }

  const front = () => {
    if (queue.length === 0) { setMessage('Queue is empty'); return }
    setMessage(`Front element is ${queue[0]}`)
  }

  const clear = () => {
    setQueue([])
    setMessage('Queue cleared')
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Queue Visualizer</h2>
          <p>FIFO data structure — Enqueue and Dequeue operations</p>
        </div>
        <div className={`status-badge${busy ? ' running' : ''}`}>
          <span className="status-dot" />{busy ? 'Animating...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Operations</div>
            <div className="input-group">
              <input type="number" value={inputVal} disabled={busy} onChange={e => setInputVal(e.target.value)} placeholder="Enter value" />
            </div>
            <div className="action-bar">
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={enqueue}>→ Enqueue</button>
              <button className="btn btn-danger btn-sm" disabled={busy} onClick={dequeue}>← Dequeue</button>
              <button className="btn btn-secondary btn-sm" disabled={busy} onClick={front}>👁 Front</button>
              <button className="btn btn-secondary btn-sm" disabled={busy} onClick={clear}>✕ Clear</button>
            </div>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={busy} />

          <div className="panel">
            <div className="panel-title">Info</div>
            <div className="stat-item"><span className="stat-label">Size</span><span className="stat-value">{queue.length}</span></div>
            <div className="stat-item"><span className="stat-label">Front</span><span className="stat-value">{queue.length ? queue[0] : '—'}</span></div>
            <div className="stat-item"><span className="stat-label">Rear</span><span className="stat-value">{queue.length ? queue[queue.length - 1] : '—'}</span></div>
          </div>

          <div className="panel">
            <div className="panel-title">Complexity</div>
            <div className="stat-item"><span className="stat-label">Enqueue</span><span className="stat-value">O(1)</span></div>
            <div className="stat-item"><span className="stat-label">Dequeue</span><span className="stat-value">O(1)</span></div>
            <div className="stat-item"><span className="stat-label">Front</span><span className="stat-value">O(1)</span></div>
          </div>
        </div>

        <div>
          <div className="viz-canvas" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="queue-container">
              {queue.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Empty Queue</p>
              ) : (
                <>
                  <div className="queue-row">
                    {queue.map((val, i) => (
                      <div key={`${val}-${i}`}
                        className={`queue-block${i === 0 ? ' front' : ''}${i === queue.length - 1 ? ' rear' : ''}`}
                        style={{
                          transition: `all ${Math.max(delay, 200)}ms ease`,
                          ...(animating === 'dequeue' && i === 0 ? { opacity: 0.3, transform: 'translateX(-20px)' } : {}),
                          ...(animating === 'enqueue' && i === queue.length - 1 ? { transform: 'scale(1.08)' } : {}),
                        }}>
                        {val}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: queue.length * 84, marginTop: 8 }}>
                    <span className="queue-label">FRONT →</span>
                    <span className="queue-label">← REAR</span>
                  </div>
                </>
              )}
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
