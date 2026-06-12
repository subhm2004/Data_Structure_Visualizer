export const WEIGHTED_GRAPH = {
  nodes: [
    { id: 'A', label: 'A', x: 80, y: 140 },
    { id: 'B', label: 'B', x: 220, y: 60 },
    { id: 'C', label: 'C', x: 220, y: 200 },
    { id: 'D', label: 'D', x: 380, y: 60 },
    { id: 'E', label: 'E', x: 380, y: 200 },
    { id: 'F', label: 'F', x: 520, y: 130 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'C', to: 'E', weight: 8 },
    { from: 'C', to: 'D', weight: 3 },
    { from: 'D', to: 'F', weight: 2 },
    { from: 'E', to: 'F', weight: 6 },
  ],
}

export function buildAdj(graph) {
  const adj = {}
  graph.nodes.forEach(n => { adj[n.id] = [] })
  graph.edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight })
    adj[e.to].push({ to: e.from, weight: e.weight })
  })
  return adj
}

export function* dijkstraSteps(graph, start) {
  const adj = buildAdj(graph)
  const dist = {}
  const prev = {}
  const visited = new Set()
  const pq = []

  graph.nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[start] = 0
  pq.push({ node: start, dist: 0 })

  yield { type: 'init', dist: { ...dist }, visited: [], pq: [...pq], message: `Initialize: dist[${start}] = 0` }

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist)
    const { node: u, dist: d } = pq.shift()

    if (visited.has(u)) continue
    visited.add(u)
    yield { type: 'visit', node: u, dist: { ...dist }, visited: [...visited], pq: [...pq], message: `Visit ${u} (dist=${d})` }

    for (const { to: v, weight: w } of adj[u]) {
      yield { type: 'edge', from: u, to: v, weight: w, dist: { ...dist }, visited: [...visited], pq: [...pq], message: `Edge ${u}→${v} weight=${w}` }
      const alt = dist[u] + w
      if (alt < dist[v]) {
        dist[v] = alt
        prev[v] = u
        pq.push({ node: v, dist: alt })
        yield { type: 'update', node: v, dist: { ...dist }, prev: { ...prev }, visited: [...visited], pq: [...pq], message: `Update dist[${v}] = ${alt}` }
      } else {
        yield { type: 'skip', node: v, dist: { ...dist }, visited: [...visited], pq: [...pq], message: `${alt} ≥ dist[${v}]=${dist[v]}, skip` }
      }
    }
  }

  yield { type: 'done', dist: { ...dist }, prev: { ...prev }, visited: [...visited], message: 'Dijkstra complete!' }
}

export function getPath(prev, target) {
  const path = []
  let cur = target
  while (cur) { path.unshift(cur); cur = prev[cur] }
  return path[0] === undefined || prev[target] === null && target !== path[0] ? [] : path
}

export function* bfsShortestSteps(graph, start, target) {
  const adj = buildAdj(graph)
  const visited = new Set([start])
  const queue = [start]
  const prev = { [start]: null }

  yield { type: 'enqueue', node: start, queue: [...queue], visited: [...visited], message: `BFS from ${start}` }

  while (queue.length > 0) {
    const u = queue.shift()
    yield { type: 'visit', node: u, queue: [...queue], visited: [...visited], message: `Visit ${u}` }

    if (u === target) {
      yield { type: 'done', path: getPath(prev, target), visited: [...visited], message: `Found ${target}!` }
      return
    }

    for (const { to: v } of adj[u]) {
      if (!visited.has(v)) {
        visited.add(v)
        prev[v] = u
        queue.push(v)
        yield { type: 'enqueue', node: v, queue: [...queue], visited: [...visited], message: `Enqueue ${v}` }
      }
    }
  }
  yield { type: 'notfound', visited: [...visited], message: `No path to ${target}` }
}
