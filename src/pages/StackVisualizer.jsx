import { useState } from 'react'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

export default function StackVisualizer() {
  const [stack, setStack] = useState([10, 20, 30])
  const [inputVal, setInputVal] = useState('')
  const [speed, setSpeed] = useState(3)
  const [message, setMessage] = useState('Stack follows LIFO — Last In, First Out')
  const [animating, setAnimating] = useState(null)
  const [busy, setBusy] = useState(false)

  const delay = getDelay(speed)

  const push = () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) { setMessage('Enter a valid number'); return }
    setBusy(true)
    setAnimating('push')
    setMessage(`Pushing ${val} onto stack...`)
    setTimeout(() => {
      setStack(prev => [...prev, val])
      setMessage(`Pushed ${val} onto stack. Top = ${val}`)
      setInputVal('')
      setAnimating(null)
      setBusy(false)
    }, Math.max(delay, 200))
  }

  const pop = () => {
    if (stack.length === 0) { setMessage('Stack Underflow! Cannot pop from empty stack.'); return }
    setBusy(true)
    setAnimating('pop')
    const val = stack[stack.length - 1]
    setMessage(`Popping ${val} from stack...`)
    setTimeout(() => {
      setStack(prev => {
        const next = prev.slice(0, -1)
        setMessage(`Popped ${val} from stack.${next.length ? ` Top = ${next[next.length - 1]}` : ' Stack is now empty.'}`)
        return next
      })
      setAnimating(null)
      setBusy(false)
    }, Math.max(delay, 200))
  }

  const peek = () => {
    if (stack.length === 0) { setMessage('Stack is empty — nothing to peek'); return }
    setMessage(`Peek: Top element is ${stack[stack.length - 1]}`)
  }

  const clear = () => {
    setStack([])
    setMessage('Stack cleared')
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Stack Visualizer</h2>
          <p>LIFO data structure — Push and Pop operations</p>
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
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={push}>↑ Push</button>
              <button className="btn btn-danger btn-sm" disabled={busy} onClick={pop}>↓ Pop</button>
              <button className="btn btn-secondary btn-sm" disabled={busy} onClick={peek}>👁 Peek</button>
              <button className="btn btn-secondary btn-sm" disabled={busy} onClick={clear}>✕ Clear</button>
            </div>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={busy} />

          <div className="panel">
            <div className="panel-title">Info</div>
            <div className="stat-item"><span className="stat-label">Size</span><span className="stat-value">{stack.length}</span></div>
            <div className="stat-item"><span className="stat-label">Top</span><span className="stat-value">{stack.length ? stack[stack.length - 1] : '—'}</span></div>
            <div className="stat-item"><span className="stat-label">Type</span><span className="stat-value">LIFO</span></div>
          </div>

          <div className="panel">
            <div className="panel-title">Complexity</div>
            <div className="stat-item"><span className="stat-label">Push</span><span className="stat-value">O(1)</span></div>
            <div className="stat-item"><span className="stat-label">Pop</span><span className="stat-value">O(1)</span></div>
            <div className="stat-item"><span className="stat-label">Peek</span><span className="stat-value">O(1)</span></div>
          </div>
        </div>

        <div>
          <div className="viz-canvas" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="stack-container">
              {stack.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Empty Stack</p>
              ) : (
                [...stack].reverse().map((val, i) => (
                  <div key={`${val}-${stack.length - i}`}
                    className={`stack-block${i === 0 ? ' top' : ''}`}
                    style={{
                      transition: `all ${Math.max(delay, 200)}ms ease`,
                      ...(animating === 'pop' && i === 0 ? { opacity: 0.3, transform: 'translateY(-20px)' } : {}),
                      ...(animating === 'push' && i === 0 ? { transform: 'scale(1.08)' } : {}),
                    }}>
                    {val}
                  </div>
                ))
              )}
              <span className="stack-label">↑ TOP</span>
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
