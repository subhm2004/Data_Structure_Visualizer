import { useState, useMemo, useCallback } from 'react'
import { TrieNode, insertTrie, searchTrie, deleteTrie, trieToGraph } from '../algorithms/trie'
import { useAnimationRunner } from '../hooks/useAnimationRunner'
import SpeedControl from '../components/SpeedControl'

export default function TrieVisualizer() {
  const [root] = useState(() => {
    const r = new TrieNode()
    ;['cat', 'car', 'dog'].forEach(word => {
      let node = r
      for (const ch of word) {
        if (!node.children[ch]) node.children[ch] = new TrieNode(ch)
        node = node.children[ch]
      }
      node.isEnd = true
    })
    return r
  })
  const [words, setWords] = useState(['cat', 'car', 'dog'])
  const [input, setInput] = useState('card')
  const [activeChar, setActiveChar] = useState(null)
  const [message, setMessage] = useState('Trie — prefix tree for strings')
  const [speed, setSpeed] = useState(3)
  const [version, setVersion] = useState(0)
  const { running, run } = useAnimationRunner()

  const layout = useMemo(() => trieToGraph(root), [root, words, version])

  const rebuild = useCallback(() => {
    Object.keys(root.children).forEach(k => delete root.children[k])
    root.isEnd = false
    words.forEach(w => {
      let node = root
      for (const ch of w) {
        if (!node.children[ch]) node.children[ch] = new TrieNode(ch)
        node = node.children[ch]
      }
      node.isEnd = true
    })
    setVersion(v => v + 1)
  }, [root, words])

  const handleStep = useCallback((step) => {
    setMessage(step.message)
    if (step.char) setActiveChar(step.char)
    if (step.type === 'done' || step.type === 'notfound') setActiveChar(null)
  }, [])

  const runOp = async (op) => {
    let gen
    if (op === 'insert') {
      gen = insertTrie(root, input)
      await run(gen, handleStep, speed)
      if (!words.includes(input)) setWords(w => [...w, input])
      setVersion(v => v + 1)
    } else if (op === 'search') {
      gen = searchTrie(root, input)
      await run(gen, handleStep, speed)
    } else {
      gen = deleteTrie(root, input)
      await run(gen, handleStep, speed)
      setWords(w => w.filter(x => x !== input))
      setVersion(v => v + 1)
    }
    setActiveChar(null)
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h2>Trie Visualizer</h2><p>Insert, search &amp; delete words character-by-character</p></div>
        <div className={`status-badge${running ? ' running' : ''}`}><span className="status-dot" />{running ? 'Running...' : 'Ready'}</div>
      </div>
      <div className="viz-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">Word</div>
            <div className="input-group"><input type="text" value={input} disabled={running} onChange={e => setInput(e.target.value.toLowerCase())} placeholder="Enter word" /></div>
            <div className="action-bar" style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" disabled={running} onClick={() => runOp('insert')}>+ Insert</button>
              <button className="btn btn-secondary btn-sm" disabled={running} onClick={() => runOp('search')}>Search</button>
              <button className="btn btn-danger btn-sm" disabled={running} onClick={() => runOp('delete')}>Delete</button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">Words in Trie</div>
            <p className="mono" style={{ fontSize: '0.85rem', color: 'var(--accent-light)' }}>{words.join(', ') || '—'}</p>
          </div>
          <SpeedControl speed={speed} onChange={setSpeed} disabled={running} />
        </div>
        <div>
          <div className="viz-canvas" style={{ alignItems: 'center', overflow: 'auto', height: 340 }}>
            <svg width={layout.width} height={layout.height}>
              {layout.edges.map((e, i) => {
                const a = layout.nodes.find(n => n.id === e.from)
                const b = layout.nodes.find(n => n.id === e.to)
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="tree-edge" />
              })}
              {layout.nodes.map(n => (
                <g key={n.id} className={`trie-node${activeChar === n.char ? ' active' : ''}${n.isEnd ? ' end' : ''}`} transform={`translate(${n.x},${n.y})`}>
                  <circle r={n.char === '○' ? 16 : 18} />
                  <text>{n.label}</text>
                  {n.isEnd && <text y="28" fill="var(--green)" fontSize="9" textAnchor="middle">★</text>}
                </g>
              ))}
            </svg>
          </div>
          <div className="panel" style={{ marginTop: 12 }}><div className="panel-title">Output</div><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p></div>
        </div>
      </div>
    </div>
  )
}
