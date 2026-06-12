import { useState, useCallback, useMemo } from 'react'
import { flushSync } from 'react-dom'
import { insertBST, deleteBST, getLayout, inorderSteps, preorderSteps, postorderSteps, levelorderSteps } from '../algorithms/tree'
import SpeedControl from '../components/SpeedControl'
import { getDelay } from '../utils/speed'

const TRAVERSALS = {
  inorder: { label: 'Inorder (LNR)', fn: inorderSteps, desc: 'Left → Node → Right' },
  preorder: { label: 'Preorder (NLR)', fn: preorderSteps, desc: 'Node → Left → Right' },
  postorder: { label: 'Postorder (LRN)', fn: postorderSteps, desc: 'Left → Right → Node' },
  levelorder: { label: 'Level Order (BFS)', fn: levelorderSteps, desc: 'Level by level' },
}

function buildFromValues(vals) {
  let root = null
  for (const v of vals) root = insertBST(root, v)
  return root
}

export default function BinaryTreeVisualizer() {
  const [treeState, setTreeState] = useState(() => ({ root: buildFromValues([50, 30, 70, 20, 40, 60, 80]), version: 0 }))
  const root = treeState.root
  const bump = (newRoot) => setTreeState(prev => ({ root: newRoot, version: prev.version + 1 }))
  const [inputVal, setInputVal] = useState(55)
  const [speed, setSpeed] = useState(3)
  const [visited, setVisited] = useState([])
  const [current, setCurrent] = useState(-1)
  const [order, setOrder] = useState([])
  const [message, setMessage] = useState('Build your tree or run a traversal')
  const [traversing, setTraversing] = useState(false)

  const layout = useMemo(() => getLayout(root), [root, treeState.version])

  const handleInsert = () => {
    bump(insertBST(root, inputVal))
    setVisited([]); setCurrent(-1); setOrder([])
    setMessage(`Inserted ${inputVal} into BST`)
  }

  const handleDelete = () => {
    bump(deleteBST(root, inputVal))
    setVisited([]); setCurrent(-1); setOrder([])
    setMessage(`Deleted ${inputVal} from BST`)
  }

  const handleReset = () => {
    setTreeState({ root: buildFromValues([50, 30, 70, 20, 40, 60, 80]), version: 0 })
    setVisited([]); setCurrent(-1); setOrder([])
    setMessage('Tree reset to default')
  }

  const runTraversal = useCallback(async (key) => {
    if (traversing) return
    const { fn, label } = TRAVERSALS[key]
    const steps = fn(root)
    setTraversing(true)
    setVisited([]); setOrder([]); setCurrent(-1)
    setMessage(`Running ${label}...`)

    const delay = getDelay(speed)
    const orderList = []

    for (const step of steps) {
      await new Promise(r => setTimeout(r, delay))
      flushSync(() => {
        setCurrent(step.val)
        setVisited(prev => [...prev, step.val])
        orderList.push(step.val)
        setOrder([...orderList])
        setMessage(`Visiting node: ${step.val}`)
      })
    }

    setCurrent(-1)
    setTraversing(false)
    setMessage(`${label} complete: [${orderList.join(', ')}]`)
  }, [root, speed, traversing])

  const getNodeClass = (val) => {
    if (current === val) return 'current'
    if (visited.includes(val)) return 'visited'
    return ''
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Binary Tree Visualizer</h2>
          <p>BST operations and tree traversals</p>
        </div>
        <div className={`status-badge${traversing ? ' running' : ''}`}>
          <span className="status-dot" />{traversing ? 'Traversing...' : 'Ready'}
        </div>
      </div>

      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Node Operations</div>
            <div className="input-group">
              <input type="number" value={inputVal} onChange={e => setInputVal(+e.target.value)} placeholder="Value" />
            </div>
            <div className="action-bar">
              <button className="btn btn-primary btn-sm" onClick={handleInsert}>+ Insert</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>− Delete</button>
              <button className="btn btn-secondary btn-sm" onClick={handleReset}>↻ Reset</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Traversals</div>
            {Object.entries(TRAVERSALS).map(([key, t]) => (
              <button key={key} className="algo-btn" disabled={traversing} onClick={() => runTraversal(key)}>
                {t.label}
              </button>
            ))}
            <p className="info-text" style={{ marginTop: 8 }}>Click a traversal to animate step-by-step node visits.</p>
          </div>

          <SpeedControl speed={speed} onChange={setSpeed} disabled={traversing} />
        </div>

        <div>
          <div className="viz-canvas" style={{ alignItems: 'center', overflow: 'auto' }}>
            <div className="tree-container">
              {root ? (
                <svg className="tree-svg" width={layout.width} height={layout.height}>
                  {layout.edges.map((e, i) => (
                    <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className="tree-edge" />
                  ))}
                  {layout.nodes.map(n => (
                    <g key={n.id} className={`tree-node ${getNodeClass(n.val)}`} transform={`translate(${n.x},${n.y})`}>
                      <circle r="22" />
                      <text>{n.val}</text>
                    </g>
                  ))}
                </svg>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Tree is empty</p>
              )}
            </div>
          </div>

          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="panel">
              <div className="panel-title">Output</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p>
            </div>
            {order.length > 0 && (
              <div className="panel">
                <div className="panel-title">Visit Order</div>
                <p className="mono" style={{ fontSize: '0.85rem', color: 'var(--accent-light)' }}>[{order.join(' → ')}]</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
