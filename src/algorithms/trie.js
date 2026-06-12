export class TrieNode {
  constructor(char = '') {
    this.char = char
    this.children = {}
    this.isEnd = false
  }
}

export function* insertTrie(root, word) {
  yield { type: 'start', word, message: `Insert "${word}"` }
  let node = root
  for (const ch of word) {
    yield { type: 'traverse', char: ch, word, message: `Check character '${ch}'` }
    if (!node.children[ch]) {
      node.children[ch] = new TrieNode(ch)
      yield { type: 'create', char: ch, word, message: `Create new node for '${ch}'` }
    } else {
      yield { type: 'exists', char: ch, word, message: `Node '${ch}' already exists` }
    }
    node = node.children[ch]
  }
  node.isEnd = true
  yield { type: 'end', char: word[word.length - 1], word, message: `Mark '${word}' as complete word` }
  yield { type: 'done', word, message: `Inserted "${word}"` }
}

export function* searchTrie(root, word) {
  yield { type: 'start', word, message: `Search "${word}"` }
  let node = root
  for (const ch of word) {
    yield { type: 'traverse', char: ch, word, message: `Check '${ch}'` }
    if (!node.children[ch]) {
      yield { type: 'notfound', char: ch, word, message: `'${ch}' not found — word missing` }
      return
    }
    node = node.children[ch]
    yield { type: 'found', char: ch, word, message: `Found '${ch}', continue` }
  }
  if (node.isEnd) {
    yield { type: 'done', word, message: `"${word}" found!` }
  } else {
    yield { type: 'notfound', word, message: `"${word}" is prefix only, not a complete word` }
  }
}

export function* deleteTrie(root, word) {
  yield { type: 'start', word, message: `Delete "${word}"` }
  function* del(node, word, depth) {
    if (depth === word.length) {
      if (!node.isEnd) {
        yield { type: 'notfound', word, message: `"${word}" not in trie` }
        return false
      }
      node.isEnd = false
      yield { type: 'unmark', word, message: `Unmark end of "${word}"` }
      return Object.keys(node.children).length === 0
    }
    const ch = word[depth]
    yield { type: 'traverse', char: ch, word, message: `Traverse '${ch}'` }
    if (!node.children[ch]) {
      yield { type: 'notfound', word, message: `"${word}" not found` }
      return false
    }
    const shouldDelete = yield* del(node.children[ch], word, depth + 1)
    if (shouldDelete) {
      delete node.children[ch]
      yield { type: 'remove', char: ch, word, message: `Remove node '${ch}'` }
      return Object.keys(node.children).length === 0 && !node.isEnd
    }
    return false
  }
  yield* del(root, word, 0)
  yield { type: 'done', word, message: `Delete complete` }
}

export function trieToGraph(root) {
  const nodes = [], edges = []
  if (!root) return { nodes, edges, width: 400, height: 200 }
  let id = 0
  function walk(node, x, y, level, parentId) {
    const myId = id++
    nodes.push({ id: myId, char: node.char || '○', isEnd: node.isEnd, x, y, label: node.char || 'ROOT' })
    if (parentId !== null) edges.push({ from: parentId, to: myId })
    const keys = Object.keys(node.children).sort()
    const span = Math.max(60, 120 / (level + 1))
    const startX = x - ((keys.length - 1) * span) / 2
    keys.forEach((k, i) => {
      walk(node.children[k], startX + i * span, y + 55, level + 1, myId)
    })
  }
  walk(root, 200, 30, 0, null)
  const maxX = Math.max(...nodes.map(n => n.x), 200)
  const minX = Math.min(...nodes.map(n => n.x), 200)
  const width = Math.max(400, maxX - minX + 80)
  const height = Math.max(200, Math.max(...nodes.map(n => n.y)) + 60)
  nodes.forEach(n => { n.x = n.x - minX + 40 })
  return { nodes, edges, width, height }
}
