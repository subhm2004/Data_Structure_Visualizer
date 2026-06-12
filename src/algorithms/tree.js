class TreeNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}

function insertBST(root, val) {
  if (!root) return new TreeNode(val)
  if (val < root.val) root.left = insertBST(root.left, val)
  else if (val > root.val) root.right = insertBST(root.right, val)
  return root
}

function deleteBST(root, val) {
  if (!root) return null
  if (val < root.val) root.left = deleteBST(root.left, val)
  else if (val > root.val) root.right = deleteBST(root.right, val)
  else {
    if (!root.left) return root.right
    if (!root.right) return root.left
    let min = root.right
    while (min.left) min = min.left
    root.val = min.val
    root.right = deleteBST(root.right, min.val)
  }
  return root
}

function treeToArray(root) {
  if (!root) return []
  const result = []
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    if (node) {
      result.push(node.val)
      queue.push(node.left)
      queue.push(node.right)
    } else result.push(null)
  }
  while (result.length && result[result.length - 1] === null) result.pop()
  return result
}

function buildTree(arr) {
  if (!arr.length || arr[0] === null) return null
  const root = new TreeNode(arr[0])
  const queue = [root]
  let i = 1
  while (queue.length && i < arr.length) {
    const node = queue.shift()
    if (arr[i] !== null && arr[i] !== undefined) { node.left = new TreeNode(arr[i]); queue.push(node.left) }
    i++
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) { node.right = new TreeNode(arr[i]); queue.push(node.right) }
    i++
  }
  return root
}

function getLayout(root) {
  if (!root) return { nodes: [], edges: [], width: 400, height: 300 }
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
  const width = Math.max(400, Math.pow(2, maxLevel - 1) * 70)
  const height = maxLevel * 80 + 40
  Object.entries(levels).forEach(([level, items]) => {
    const count = Math.pow(2, +level)
    items.forEach(({ node, pos }) => {
      const x = (width / (count + 1)) * (pos + 1)
      const y = +level * 80 + 40
      nodes.push({ id: node.val + '-' + level + '-' + pos, val: node.val, x, y, level: +level })
      if (node.left) {
        const lx = (width / (Math.pow(2, +level + 1) + 1)) * (pos * 2 + 1)
        edges.push({ x1: x, y1: y + 18, x2: lx, y2: (+level + 1) * 80 + 40 - 18 })
      }
      if (node.right) {
        const rx = (width / (Math.pow(2, +level + 1) + 1)) * (pos * 2 + 2)
        edges.push({ x1: x, y1: y + 18, x2: rx, y2: (+level + 1) * 80 + 40 - 18 })
      }
    })
  })
  return { nodes, edges, width, height }
}

function inorderSteps(root) {
  const steps = []
  function traverse(node) {
    if (!node) return
    traverse(node.left)
    steps.push({ type: 'visit', val: node.val })
    traverse(node.right)
  }
  traverse(root)
  return steps
}

function preorderSteps(root) {
  const steps = []
  function traverse(node) {
    if (!node) return
    steps.push({ type: 'visit', val: node.val })
    traverse(node.left)
    traverse(node.right)
  }
  traverse(root)
  return steps
}

function postorderSteps(root) {
  const steps = []
  function traverse(node) {
    if (!node) return
    traverse(node.left)
    traverse(node.right)
    steps.push({ type: 'visit', val: node.val })
  }
  traverse(root)
  return steps
}

function levelorderSteps(root) {
  const steps = []
  if (!root) return steps
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    steps.push({ type: 'visit', val: node.val })
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return steps
}

export { TreeNode, insertBST, deleteBST, treeToArray, buildTree, getLayout, inorderSteps, preorderSteps, postorderSteps, levelorderSteps }
