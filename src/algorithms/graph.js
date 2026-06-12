export const DEFAULT_GRAPH = {
  nodes: [
    { id: 'A', label: 'A', x: 300, y: 40 },
    { id: 'B', label: 'B', x: 150, y: 130 },
    { id: 'C', label: 'C', x: 450, y: 130 },
    { id: 'D', label: 'D', x: 80, y: 230 },
    { id: 'E', label: 'E', x: 200, y: 230 },
    { id: 'F', label: 'F', x: 320, y: 230 },
    { id: 'G', label: 'G', x: 520, y: 230 },
    { id: 'H', label: 'H', x: 400, y: 230 },
  ],
  edges: [
    ['A', 'B'], ['A', 'C'],
    ['B', 'D'], ['B', 'E'], ['B', 'F'],
    ['C', 'G'], ['C', 'H'],
    ['E', 'F'], ['F', 'H'],
  ],
  adj: {
    A: ['B', 'C'],
    B: ['A', 'D', 'E', 'F'],
    C: ['A', 'G', 'H'],
    D: ['B'],
    E: ['B', 'F'],
    F: ['B', 'E', 'H'],
    G: ['C'],
    H: ['C', 'F'],
  },
}

export const GRAPH_PRESETS = {
  default: DEFAULT_GRAPH,
  simple: {
    nodes: [
      { id: '1', label: '1', x: 250, y: 50 },
      { id: '2', label: '2', x: 150, y: 150 },
      { id: '3', label: '3', x: 350, y: 150 },
      { id: '4', label: '4', x: 100, y: 250 },
      { id: '5', label: '5', x: 250, y: 250 },
      { id: '6', label: '6', x: 400, y: 250 },
    ],
    edges: [['1','2'],['1','3'],['2','4'],['2','5'],['3','5'],['3','6']],
    adj: { '1': ['2','3'], '2': ['1','4','5'], '3': ['1','5','6'], '4': ['2'], '5': ['2','3'], '6': ['3'] },
  },
  linear: {
    nodes: [
      { id: '1', label: '1', x: 80, y: 140 },
      { id: '2', label: '2', x: 180, y: 140 },
      { id: '3', label: '3', x: 280, y: 140 },
      { id: '4', label: '4', x: 380, y: 140 },
      { id: '5', label: '5', x: 480, y: 140 },
    ],
    edges: [['1','2'],['2','3'],['3','4'],['4','5']],
    adj: { '1': ['2'], '2': ['1','3'], '3': ['2','4'], '4': ['3','5'], '5': ['4'] },
  },
}

export function* dfsSteps(adj, start) {
  const visited = new Set()
  const stack = []
  const order = []

  yield { type: 'start', node: start, message: `Starting DFS from node ${start}` }

  function* dfs(node, parent) {
    if (visited.has(node)) return

    stack.push(node)
    yield { type: 'push', node, stack: [...stack], message: `Push ${node} onto stack` }

    visited.add(node)
    order.push(node)
    yield { type: 'visit', node, visited: [...visited], stack: [...stack], order: [...order], message: `Visit node ${node}` }

    for (const neighbor of adj[node] || []) {
      if (!visited.has(neighbor)) {
        yield { type: 'edge', from: node, to: neighbor, active: true, message: `Explore edge ${node} → ${neighbor}` }
        yield* dfs(neighbor, node)
        yield { type: 'edge', from: node, to: neighbor, active: false, message: `Backtrack from ${neighbor}` }
      }
    }

    stack.pop()
    yield { type: 'pop', node, stack: [...stack], message: `Pop ${node} from stack (backtrack)` }
  }

  yield* dfs(start, null)
  yield { type: 'done', visited: [...visited], order, message: `DFS complete! Order: ${order.join(' → ')}` }
}

export function* bfsSteps(adj, start) {
  const visited = new Set()
  const queue = []
  const order = []

  yield { type: 'start', node: start, message: `Starting BFS from node ${start}` }

  visited.add(start)
  queue.push(start)
  yield { type: 'enqueue', node: start, queue: [...queue], message: `Enqueue ${start}` }

  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)
    yield { type: 'visit', node, visited: [...visited], queue: [...queue], order: [...order], message: `Visit node ${node}` }

    for (const neighbor of adj[node] || []) {
      if (!visited.has(neighbor)) {
        yield { type: 'edge', from: node, to: neighbor, active: true, message: `Discover ${neighbor} via ${node}` }
        visited.add(neighbor)
        queue.push(neighbor)
        yield { type: 'enqueue', node: neighbor, queue: [...queue], message: `Enqueue ${neighbor}` }
        yield { type: 'edge', from: node, to: neighbor, active: false, message: '' }
      } else {
        yield { type: 'edge', from: node, to: neighbor, active: true, skipped: true, message: `${neighbor} already visited, skip` }
        yield { type: 'edge', from: node, to: neighbor, active: false, message: '' }
      }
    }
  }

  yield { type: 'done', visited: [...visited], order, message: `BFS complete! Order: ${order.join(' → ')}` }
}
