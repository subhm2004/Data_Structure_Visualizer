export class AVLNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
    this.height = 1
  }
}

export function height(n) { return n ? n.height : 0 }
export function balance(n) { return n ? height(n.left) - height(n.right) : 0 }

function updateHeight(n) {
  n.height = 1 + Math.max(height(n.left), height(n.right))
}

function rotateRight(y) {
  const x = y.left
  const T2 = x.right
  x.right = y
  y.left = T2
  updateHeight(y)
  updateHeight(x)
  return x
}

function rotateLeft(x) {
  const y = x.right
  const T2 = y.left
  y.left = x
  x.right = T2
  updateHeight(x)
  updateHeight(y)
  return y
}

export function getAVLLayout(root) {
  if (!root) return { nodes: [], edges: [], width: 400, height: 280 }
  const nodes = [], edges = []
  const levels = {}
  function traverse(node, level = 0, pos = 0) {
    if (!node) return
    if (!levels[level]) levels[level] = []
    levels[level].push({ node, pos })
    traverse(node.left, level + 1, pos * 2)
    traverse(node.right, level + 1, pos * 2 + 1)
  }
  traverse(root)
  const maxLevel = Object.keys(levels).length
  const width = Math.max(420, Math.pow(2, maxLevel - 1) * 65)
  const height = maxLevel * 80 + 40
  Object.entries(levels).forEach(([level, items]) => {
    const count = Math.pow(2, +level)
    items.forEach(({ node, pos }) => {
      const x = (width / (count + 1)) * (pos + 1)
      const y = +level * 80 + 40
      const id = `${node.val}-${level}-${pos}`
      nodes.push({ id, val: node.val, x, y, balance: balance(node), height: node.height })
      if (node.left) {
        const lx = (width / (Math.pow(2, +level + 1) + 1)) * (pos * 2 + 1)
        edges.push({ x1: x, y1: y + 20, x2: lx, y2: (+level + 1) * 80 + 40 - 20 })
      }
      if (node.right) {
        const rx = (width / (Math.pow(2, +level + 1) + 1)) * (pos * 2 + 2)
        edges.push({ x1: x, y1: y + 20, x2: rx, y2: (+level + 1) * 80 + 40 - 20 })
      }
    })
  })
  return { nodes, edges, width, height }
}

export function* insertAVL(root, val) {
  yield { type: 'start', val, message: `Insert ${val}` }

  function* insert(node, val) {
    if (!node) {
      yield { type: 'create', val, message: `Create node ${val}` }
      return new AVLNode(val)
    }
    yield { type: 'compare', val, nodeVal: node.val, message: `Compare ${val} with ${node.val}` }
    if (val < node.val) {
      node.left = yield* insert(node.left, val)
    } else if (val > node.val) {
      node.right = yield* insert(node.right, val)
    } else {
      yield { type: 'duplicate', val, message: `${val} already exists` }
      return node
    }
    updateHeight(node)
    const bf = balance(node)
    yield { type: 'balance', val: node.val, bf, message: `Balance factor at ${node.val}: ${bf}` }

    if (bf > 1 && val < node.left.val) {
      yield { type: 'rotate', kind: 'LL', pivot: node.val, message: `LL rotation at ${node.val}` }
      return rotateRight(node)
    }
    if (bf < -1 && val > node.right.val) {
      yield { type: 'rotate', kind: 'RR', pivot: node.val, message: `RR rotation at ${node.val}` }
      return rotateLeft(node)
    }
    if (bf > 1 && val > node.left.val) {
      yield { type: 'rotate', kind: 'LR', pivot: node.val, message: `LR rotation at ${node.val}` }
      node.left = rotateLeft(node.left)
      return rotateRight(node)
    }
    if (bf < -1 && val < node.right.val) {
      yield { type: 'rotate', kind: 'RL', pivot: node.val, message: `RL rotation at ${node.val}` }
      node.right = rotateRight(node.right)
      return rotateLeft(node)
    }
    return node
  }

  const newRoot = yield* insert(root, val)
  yield { type: 'done', message: `Inserted ${val}, tree balanced` }
  return newRoot
}

export function buildAVL(values) {
  let root = null
  for (const v of values) root = insertAVLSync(root, v)
  return root
}

function insertAVLSync(node, val) {
  if (!node) return new AVLNode(val)
  if (val < node.val) node.left = insertAVLSync(node.left, val)
  else if (val > node.val) node.right = insertAVLSync(node.right, val)
  else return node
  updateHeight(node)
  const bf = balance(node)
  if (bf > 1 && val < node.left.val) return rotateRight(node)
  if (bf < -1 && val > node.right.val) return rotateLeft(node)
  if (bf > 1 && val > node.left.val) { node.left = rotateLeft(node.left); return rotateRight(node) }
  if (bf < -1 && val < node.right.val) { node.right = rotateRight(node.right); return rotateLeft(node) }
  return node
}

export function* deleteAVL(root, val) {
  yield { type: 'start', val, message: `Delete ${val}` }

  function* del(node, val) {
    if (!node) {
      yield { type: 'notfound', val, message: `${val} not found` }
      return null
    }
    yield { type: 'compare', val, nodeVal: node.val, message: `Compare ${val} with ${node.val}` }
    if (val < node.val) node.left = yield* del(node.left, val)
    else if (val > node.val) node.right = yield* del(node.right, val)
    else {
      yield { type: 'found', val, message: `Found ${val}, deleting...` }
      if (!node.left || !node.right) node = node.left || node.right
      else {
        let succ = node.right
        while (succ.left) succ = succ.left
        node.val = succ.val
        node.right = yield* del(node.right, succ.val)
      }
    }
    if (!node) return null
    updateHeight(node)
    const bf = balance(node)
    yield { type: 'balance', val: node.val, bf, message: `Balance at ${node.val}: ${bf}` }
    if (bf > 1 && balance(node.left) >= 0) {
      yield { type: 'rotate', kind: 'LL', pivot: node.val, message: `LL rotation` }
      return rotateRight(node)
    }
    if (bf > 1 && balance(node.left) < 0) {
      yield { type: 'rotate', kind: 'LR', pivot: node.val, message: `LR rotation` }
      node.left = rotateLeft(node.left)
      return rotateRight(node)
    }
    if (bf < -1 && balance(node.right) <= 0) {
      yield { type: 'rotate', kind: 'RR', pivot: node.val, message: `RR rotation` }
      return rotateLeft(node)
    }
    if (bf < -1 && balance(node.right) > 0) {
      yield { type: 'rotate', kind: 'RL', pivot: node.val, message: `RL rotation` }
      node.right = rotateRight(node.right)
      return rotateLeft(node)
    }
    return node
  }

  const newRoot = yield* del(root, val)
  yield { type: 'done', message: `Delete complete` }
  return newRoot
}
