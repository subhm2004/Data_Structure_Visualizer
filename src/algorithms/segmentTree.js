function cloneArr(arr) {
  return [...arr]
}

function cloneTree(tree) {
  return [...tree]
}

export function buildSegmentTree(arr) {
  const n = arr.length
  const tree = new Array(4 * n).fill(0)
  function build(node, start, end) {
    if (start === end) {
      tree[node] = arr[start]
      return
    }
    const mid = Math.floor((start + end) / 2)
    build(node * 2, start, mid)
    build(node * 2 + 1, mid + 1, end)
    tree[node] = tree[node * 2] + tree[node * 2 + 1]
  }
  if (n > 0) build(1, 0, n - 1)
  return tree
}

export function getSegmentTreeLayout(arr, tree) {
  if (!arr.length) return { nodes: [], edges: [], width: 400, height: 200 }

  const nodes = []
  const edges = []
  const n = arr.length
  const levels = Math.floor(Math.log2(n)) + 1
  const levelHeight = 75
  const width = Math.max(520, Math.pow(2, levels) * 72)
  const nodeRadius = 24

  function layout(node, start, end, level, left, right) {
    if (node >= tree.length || start > end) return
    const x = (left + right) / 2
    const y = level * levelHeight + 35
    const label = start === end ? `[${start}]` : `[${start}..${end}]`

    nodes.push({ id: node, node, start, end, val: tree[node], x, y, label, isLeaf: start === end })

    if (start < end) {
      const mid = Math.floor((start + end) / 2)
      layout(node * 2, start, mid, level + 1, left, x)
      layout(node * 2 + 1, mid + 1, end, level + 1, x, right)
    }
  }

  layout(1, 0, n - 1, 0, 0, width)

  const posMap = new Map(nodes.map(nd => [nd.node, nd]))
  for (const nd of nodes) {
    if (!nd.isLeaf) {
      const left = posMap.get(nd.node * 2)
      const right = posMap.get(nd.node * 2 + 1)
      if (left) edges.push({ x1: nd.x, y1: nd.y + nodeRadius, x2: left.x, y2: left.y - nodeRadius })
      if (right) edges.push({ x1: nd.x, y1: nd.y + nodeRadius, x2: right.x, y2: right.y - nodeRadius })
    }
  }

  return { nodes, edges, width, height: levels * levelHeight + 60 }
}

export function* buildSegmentTreeSteps(arr) {
  const n = arr.length
  const a = cloneArr(arr)
  const tree = new Array(4 * n).fill(0)

  yield {
    type: 'init',
    array: cloneArr(a),
    tree: cloneTree(tree),
    activeNodes: [],
    message: `Segment Tree build — array size ${n}`,
  }

  function* build(node, start, end) {
    yield {
      type: 'visit',
      array: cloneArr(a),
      tree: cloneTree(tree),
      activeNodes: [node],
      node,
      range: [start, end],
      message: start === end
        ? `Leaf node ${node}: range [${start}] = arr[${start}] = ${a[start]}`
        : `Build node ${node}: range [${start}..${end}]`,
    }

    if (start === end) {
      tree[node] = a[start]
      yield {
        type: 'set-leaf',
        array: cloneArr(a),
        tree: cloneTree(tree),
        activeNodes: [node],
        node,
        range: [start, end],
        message: `tree[${node}] = ${a[start]}`,
      }
      return
    }

    const mid = Math.floor((start + end) / 2)
    yield {
      type: 'split',
      array: cloneArr(a),
      tree: cloneTree(tree),
      activeNodes: [node],
      node,
      range: [start, end],
      mid,
      message: `Split [${start}..${end}] → left [${start}..${mid}] + right [${mid + 1}..${end}]`,
    }

    yield* build(node * 2, start, mid)
    yield* build(node * 2 + 1, mid + 1, end)

    tree[node] = tree[node * 2] + tree[node * 2 + 1]
    yield {
      type: 'merge',
      array: cloneArr(a),
      tree: cloneTree(tree),
      activeNodes: [node, node * 2, node * 2 + 1],
      node,
      range: [start, end],
      message: `tree[${node}] = tree[${node * 2}] + tree[${node * 2 + 1}] = ${tree[node * 2]} + ${tree[node * 2 + 1]} = ${tree[node]}`,
    }
  }

  if (n > 0) yield* build(1, 0, n - 1)

  yield {
    type: 'done',
    array: cloneArr(a),
    tree: cloneTree(tree),
    activeNodes: [],
    message: 'Segment Tree built!',
  }
}

export function* querySegmentTreeSteps(arr, tree, ql, qr) {
  const a = cloneArr(arr)
  const t = cloneTree(tree)

  yield {
    type: 'query-start',
    array: cloneArr(a),
    tree: cloneTree(t),
    activeNodes: [1],
    query: [ql, qr],
    message: `Range sum query [${ql}..${qr}]`,
  }

  function* query(node, start, end) {
    if (qr < start || end < ql) {
      yield {
        type: 'skip',
        array: cloneArr(a),
        tree: cloneTree(t),
        activeNodes: [node],
        node,
        range: [start, end],
        query: [ql, qr],
        message: `Node ${node} [${start}..${end}] — no overlap, skip`,
      }
      return 0
    }

    if (ql <= start && end <= qr) {
      yield {
        type: 'take-full',
        array: cloneArr(a),
        tree: cloneTree(t),
        activeNodes: [node],
        node,
        range: [start, end],
        query: [ql, qr],
        partial: t[node],
        message: `Node ${node} [${start}..${end}] fully inside → add ${t[node]}`,
      }
      return t[node]
    }

    yield {
      type: 'partial',
      array: cloneArr(a),
      tree: cloneTree(t),
      activeNodes: [node],
      node,
      range: [start, end],
      query: [ql, qr],
      message: `Node ${node} [${start}..${end}] — partial overlap, go deeper`,
    }

    const mid = Math.floor((start + end) / 2)
    const left = yield* query(node * 2, start, mid)
    const right = yield* query(node * 2 + 1, mid + 1, end)
    const total = left + right

    yield {
      type: 'combine',
      array: cloneArr(a),
      tree: cloneTree(t),
      activeNodes: [node, node * 2, node * 2 + 1],
      node,
      range: [start, end],
      query: [ql, qr],
      left,
      right,
      partial: total,
      message: `Combine: ${left} + ${right} = ${total}`,
    }
    return total
  }

  function* runQuery() {
    return yield* query(1, 0, a.length - 1)
  }

  const result = yield* runQuery()

  yield {
    type: 'done',
    array: cloneArr(a),
    tree: cloneTree(t),
    activeNodes: [],
    query: [ql, qr],
    result,
    message: `Range sum [${ql}..${qr}] = ${result}`,
  }
}

export function* updateSegmentTreeSteps(arr, tree, index, value) {
  const a = cloneArr(arr)
  const t = cloneTree(tree)
  const oldVal = a[index]
  const delta = value - oldVal

  yield {
    type: 'update-start',
    array: cloneArr(a),
    tree: cloneTree(t),
    activeNodes: [],
    index,
    value,
    message: `Point update: arr[${index}] ${oldVal} → ${value} (delta=${delta})`,
  }

  function* update(node, start, end) {
    yield {
      type: 'visit',
      array: cloneArr(a),
      tree: cloneTree(t),
      activeNodes: [node],
      node,
      range: [start, end],
      index,
      message: start === end
        ? `Leaf node ${node}: update arr[${index}]`
        : `Visit node ${node} [${start}..${end}]`,
    }

    if (start === end) {
      a[index] = value
      t[node] = value
      yield {
        type: 'set-leaf',
        array: cloneArr(a),
        tree: cloneTree(t),
        activeNodes: [node],
        node,
        range: [start, end],
        message: `tree[${node}] = ${value}`,
      }
      return
    }

    const mid = Math.floor((start + end) / 2)
    if (index <= mid) yield* update(node * 2, start, mid)
    else yield* update(node * 2 + 1, mid + 1, end)

    t[node] = t[node * 2] + t[node * 2 + 1]
    yield {
      type: 'merge',
      array: cloneArr(a),
      tree: cloneTree(t),
      activeNodes: [node, node * 2, node * 2 + 1],
      node,
      range: [start, end],
      message: `Bubble up: tree[${node}] = ${t[node * 2]} + ${t[node * 2 + 1]} = ${t[node]}`,
    }
  }

  if (a.length > 0) yield* update(1, 0, a.length - 1)

  yield {
    type: 'done',
    array: cloneArr(a),
    tree: cloneTree(t),
    activeNodes: [],
    message: `Update complete — arr[${index}] = ${value}`,
  }
}

export function randomArray(n, max = 20) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * max) + 1)
}
