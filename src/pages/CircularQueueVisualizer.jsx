import { useState } from 'react'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

export default function CircularQueueVisualizer() {
  const CAPACITY = 8
  const [queue, setQueue] = useState([10, 20, 30])
  const [front, setFront] = useState(0)
  const [rear, setRear] = useState(3)
  const [size, setSize] = useState(3)
  const [inputVal, setInputVal] = useState('')
  const [speed, setSpeed] = useState(3)
  const [busy, setBusy] = useState(false)
  const [animating, setAnimating] = useState(null)
  const [message, setMessage] = useState('Circular queue — front & rear wrap around')

  const delay = getDelay(speed)
  const buffer = Array(CAPACITY).fill(null)
  for (let i = 0; i < size; i++) {
    buffer[(front + i) % CAPACITY] = queue[i]
  }

  const enqueue = () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) { setMessage('Enter a valid number'); return }
    if (size >= CAPACITY) { setMessage('Queue Overflow! Buffer full.'); return }
    setBusy(true)
    setAnimating('enqueue')
    setMessage(`Enqueuing ${val} at rear=${rear % CAPACITY}...`)
    setTimeout(() => {
      setQueue(q => [...q, val])
      setRear(r => (r + 1) % CAPACITY)
      setSize(s => s + 1)
      setMessage(`Enqueued ${val}. Rear → ${(rear + 1) % CAPACITY}`)
      setInputVal('')
      setAnimating(null)
      setBusy(false)
    }, Math.max(delay, 250))
  }

  const dequeue = () => {
    if (size === 0) { setMessage('Queue Underflow! Empty queue.'); return }
    setBusy(true)
    setAnimating('dequeue')
    const val = queue[0]
    setMessage(`Dequeuing ${val} from front=${front}...`)
    setTimeout(() => {
      setQueue(q => q.slice(1))
      setFront(f => (f + 1) % CAPACITY)
      setSize(s => s - 1)
      setMessage(`Dequeued ${val}. Front → ${(front + 1) % CAPACITY}`)
      setAnimating(null)
      setBusy(false)
    }, Math.max(delay, 250))
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>Circular Queue</h2><p>Ring buffer with wrap-around front &amp; rear</p></div>
        <div className={`status-badge${busy ? ' running' : ''}`}><span className="status-dot" />{busy ? 'Animating...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Operations</div>
            <div className="input-group"><input type="number" value={inputVal} disabled={busy} onChange={e => setInputVal(e.target.value)} placeholder="Value" /></div>
            <div className="action-bar" style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={enqueue}>→ Enqueue</button>
              <button className="btn btn-danger btn-sm" disabled={busy} onClick={dequeue}>← Dequeue</button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">Pointers</div>
            <div className="stat-item"><span className="stat-label">Front</span><span className="stat-value">{front}</span></div>
            <div className="stat-item"><span className="stat-label">Rear</span><span className="stat-value">{rear % CAPACITY}</span></div>
            <div className="stat-item"><span className="stat-label">Size</span><span className="stat-value">{size}/{CAPACITY}</span></div>
          </div>
          <SpeedControl speed={speed} onChange={setSpeed} disabled={busy} />
        </div>
        <div>
          <div className="viz-canvas" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="circular-queue">
              {buffer.map((val, i) => {
                const isFront = size > 0 && i === front
                const isRear = size > 0 && i === (rear - 1 + CAPACITY) % CAPACITY
                return (
                  <div key={i} className={`cq-slot${val !== null ? ' filled' : ''}${isFront ? ' front' : ''}${isRear ? ' rear' : ''}${animating === 'dequeue' && isFront ? ' anim-out' : ''}${animating === 'enqueue' && isRear ? ' anim-in' : ''}`}>
                    <span className="cq-idx">{i}</span>
                    <span className="cq-val">{val ?? '·'}</span>
                    {isFront && <span className="cq-label">F</span>}
                    {isRear && size > 0 && <span className="cq-label rear-label">R</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="panel" style={{ marginTop: 12 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
