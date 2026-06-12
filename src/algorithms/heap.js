export function getHeapLayout(arr) {
  const nodes = []
  const edges = []
  if (!arr.length) return { nodes, edges, width: 400, height: 300 }

  const levelHeight = 80
  const nodeRadius = 22
  const levels = Math.floor(Math.log2(arr.length)) + 1
  const width = Math.max(400, Math.pow(2, levels - 1) * 70)
  const height = levels * levelHeight + 40
  const posMap = new Map()

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) continue
    const level = Math.floor(Math.log2(i + 1))
    const posInLevel = i - (Math.pow(2, level) - 1)
    const count = Math.pow(2, level)
    const x = (width / (count + 1)) * (posInLevel + 1)
    const y = level * levelHeight + 40
    const node = { id: i, val: arr[i], x, y, index: i }
    nodes.push(node)
    posMap.set(i, node)
  }

  for (const node of nodes) {
    const left = 2 * node.index + 1
    const right = 2 * node.index + 2

    if (left < arr.length && arr[left] != null && posMap.has(left)) {
      const child = posMap.get(left)
      edges.push({
        x1: node.x,
        y1: node.y + nodeRadius,
        x2: child.x,
        y2: child.y - nodeRadius,
      })
    }
    if (right < arr.length && arr[right] != null && posMap.has(right)) {
      const child = posMap.get(right)
      edges.push({
        x1: node.x,
        y1: node.y + nodeRadius,
        x2: child.x,
        y2: child.y - nodeRadius,
      })
    }
  }

  return { nodes, edges, width, height }
}

function compare(a, b, isMax) {
  return isMax ? a > b : a < b
}

function* heapify(arr, n, i, isMax) {
  let best = i
  const l = 2 * i + 1, r = 2 * i + 2
  if (l < n) {
    yield { type: 'compare', indices: [i, l], heap: [...arr], message: `Compare ${arr[i]} with left ${arr[l]}` }
    if (compare(arr[l], arr[best], isMax)) best = l
  }
  if (r < n) {
    yield { type: 'compare', indices: [best, r], heap: [...arr], message: `Compare with right ${arr[r]}` }
    if (compare(arr[r], arr[best], isMax)) best = r
  }
  if (best !== i) {
    ;[arr[i], arr[best]] = [arr[best], arr[i]]
    yield { type: 'swap', indices: [i, best], heap: [...arr], message: `Swap ${arr[best]} ↔ ${arr[i]}` }
    yield* heapify(arr, n, best, isMax)
  }
}

export function* insertHeap(arr, val, isMax) {
  arr.push(val)
  yield { type: 'insert', index: arr.length - 1, heap: [...arr], message: `Insert ${val} at end` }
  let i = arr.length - 1
  while (i > 0) {
    const p = Math.floor((i - 1) / 2)
    yield { type: 'compare', indices: [i, p], heap: [...arr], message: `Compare ${arr[i]} with parent ${arr[p]}` }
    if (compare(arr[i], arr[p], isMax)) {
      ;[arr[i], arr[p]] = [arr[p], arr[i]]
      yield { type: 'swap', indices: [i, p], heap: [...arr], message: `Bubble up: swap with parent` }
      i = p
    } else break
  }
  yield { type: 'done', heap: [...arr], message: `Heap property restored` }
}

export function* extractHeap(arr, isMax) {
  if (!arr.length) {
    yield { type: 'error', heap: [], message: 'Heap is empty!' }
    return
  }
  const extracted = arr[0]
  yield { type: 'extract', value: extracted, heap: [...arr], message: `Extract ${isMax ? 'max' : 'min'}: ${extracted}` }
  arr[0] = arr[arr.length - 1]
  arr.pop()
  yield { type: 'swap', indices: [0], heap: [...arr], message: `Move last element to root` }
  if (arr.length > 0) yield* heapify(arr, arr.length, 0, isMax)
  yield { type: 'done', heap: [...arr], extracted, message: `Extracted ${extracted}` }
}

export function* buildHeap(arr, isMax) {
  yield { type: 'start', heap: [...arr], message: `Build ${isMax ? 'max' : 'min'}-heap` }
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    yield { type: 'highlight', index: i, heap: [...arr], message: `Heapify subtree at index ${i}` }
    yield* heapify(arr, arr.length, i, isMax)
  }
  yield { type: 'done', heap: [...arr], message: 'Heap built successfully' }
}
