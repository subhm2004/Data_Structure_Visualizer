function cloneTree(node) {
  if (!node) return null
  return {
    ...node,
    values: [...node.values],
    mergedSoFar: node.mergedSoFar ? [...node.mergedSoFar] : null,
    compareAt: node.compareAt ? { ...node.compareAt } : null,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  }
}

let _id = 0
function nid(prefix = 'n') {
  return `${prefix}-${_id++}`
}

export function* mergeSortTree(arr) {
  _id = 0
  const a = [...arr]

  const root = {
    id: 'root',
    lo: 0,
    hi: a.length - 1,
    values: [...a],
    mergedSoFar: null,
    left: null,
    right: null,
    status: 'idle',
    compareAt: null,
  }

  function cloneMergeCtx(ctx) {
    if (!ctx) return null
    return {
      ...ctx,
      left: ctx.left ? [...ctx.left] : [],
      right: ctx.right ? [...ctx.right] : [],
      merged: ctx.merged ? [...ctx.merged] : [],
    }
  }

  function snap(activeId, phase, message, mergeCtx = null, extraDelay = 0) {
    return {
      type: 'tree-step',
      tree: cloneTree(root),
      activeId,
      phase,
      message,
      array: [...a],
      mergeCtx: cloneMergeCtx(mergeCtx),
      extraDelay: extraDelay || undefined,
    }
  }

  function* sort(node) {
    node.values = a.slice(node.lo, node.hi + 1)
    node.mergedSoFar = null
    node.status = 'active'
    yield snap(node.id, 'divide', `Divide [${node.lo}..${node.hi}]`)

    if (node.lo >= node.hi) {
      node.status = 'sorted'
      yield snap(node.id, 'sorted', `Base case: ${node.values[0]} sorted ✓`)
      return
    }

    const mid = Math.floor((node.lo + node.hi) / 2)
    node.status = 'splitting'

    node.left = {
      id: nid('L'),
      lo: node.lo,
      hi: mid,
      values: a.slice(node.lo, mid + 1),
      mergedSoFar: null,
      left: null,
      right: null,
      status: 'idle',
      compareAt: null,
    }
    node.right = {
      id: nid('R'),
      lo: mid + 1,
      hi: node.hi,
      values: a.slice(mid + 1, node.hi + 1),
      mergedSoFar: null,
      left: null,
      right: null,
      status: 'idle',
      compareAt: null,
    }

    yield snap(node.id, 'split', `Split → Left [${node.left.values.join(', ')}] | Right [${node.right.values.join(', ')}]`)

    yield* sort(node.left)
    yield* sort(node.right)

    const midIdx = Math.floor((node.lo + node.hi) / 2)
    node.left.values = a.slice(node.lo, midIdx + 1)
    node.right.values = a.slice(midIdx + 1, node.hi + 1)

    const leftVals = [...node.left.values]
    const rightVals = [...node.right.values]
    let i = 0
    let j = 0
    const merged = []

    node.status = 'merging'
    node.mergedSoFar = []
    node.left.status = 'ready-merge'
    node.right.status = 'ready-merge'
    yield snap(node.id, 'merge-start', `Merge karo: left [${leftVals.join(', ')}] + right [${rightVals.join(', ')}]`, {
      left: leftVals, right: rightVals, merged: [], li: i, ri: j, lo: node.lo, hi: node.hi,
    })

    while (i < leftVals.length && j < rightVals.length) {
      node.left.compareAt = { idx: i }
      node.right.compareAt = { idx: j }
      yield snap(node.id, 'compare', `Compare: ${leftVals[i]} vs ${rightVals[j]} — chhota pick karo`, {
        left: leftVals, right: rightVals, merged: [...merged], li: i, ri: j, comparing: true, lo: node.lo, hi: node.hi,
      }, 350)

      if (leftVals[i] <= rightVals[j]) {
        merged.push(leftVals[i])
        node.left.compareAt = { idx: i, picked: true }
        yield snap(node.id, 'take-left', `← ${leftVals[i]} left se liya → result mein daala`, {
          left: leftVals, right: rightVals, merged: [...merged], li: i, ri: j, pickedFrom: 'left', pickedVal: leftVals[i], lo: node.lo, hi: node.hi,
        }, 450)
        i++
      } else {
        merged.push(rightVals[j])
        node.right.compareAt = { idx: j, picked: true }
        yield snap(node.id, 'take-right', `${rightVals[j]} right se liya → result mein daala`, {
          left: leftVals, right: rightVals, merged: [...merged], li: i, ri: j, pickedFrom: 'right', pickedVal: rightVals[j], lo: node.lo, hi: node.hi,
        }, 450)
        j++
      }
      node.mergedSoFar = [...merged]
      node.values = [...merged, ...leftVals.slice(i), ...rightVals.slice(j)]
      for (let k = 0; k < merged.length; k++) a[node.lo + k] = merged[k]
      node.left.compareAt = null
      node.right.compareAt = null
    }

    while (i < leftVals.length) {
      merged.push(leftVals[i++])
      node.mergedSoFar = [...merged]
      node.values = [...merged, ...leftVals.slice(i), ...rightVals.slice(j)]
      for (let k = 0; k < merged.length; k++) a[node.lo + k] = merged[k]
      yield snap(node.id, 'take-left', `← Bacha hua ${merged[merged.length - 1]} left se copy kiya`, {
        left: leftVals, right: rightVals, merged: [...merged], li: i, ri: j, pickedFrom: 'left', pickedVal: merged[merged.length - 1], lo: node.lo, hi: node.hi,
      })
    }
    while (j < rightVals.length) {
      merged.push(rightVals[j++])
      node.mergedSoFar = [...merged]
      node.values = [...merged, ...rightVals.slice(j)]
      for (let k = 0; k < merged.length; k++) a[node.lo + k] = merged[k]
      yield snap(node.id, 'take-right', `Bacha hua ${merged[merged.length - 1]} right se copy kiya →`, {
        left: leftVals, right: rightVals, merged: [...merged], li: i, ri: j, pickedFrom: 'right', pickedVal: merged[merged.length - 1], lo: node.lo, hi: node.hi,
      })
    }

    node.values = [...merged]
    node.mergedSoFar = [...merged]
    node.status = 'sorted'
    node.compareAt = null

    yield snap(node.id, 'merging', `✓ Merge ho gaya → [${merged.join(', ')}] parent mein likha`, {
      left: leftVals, right: rightVals, merged: [...merged], done: true, lo: node.lo, hi: node.hi,
    })

    node.left = null
    node.right = null
    for (let k = 0; k < merged.length; k++) a[node.lo + k] = merged[k]

    yield snap(node.id, 'sorted', `✓ [${node.lo}..${node.hi}] sorted: [${merged.join(', ')}]`, {
      merged: [...merged], done: true,
    })
  }

  yield* sort(root)
  yield { type: 'done', tree: cloneTree(root), array: [...a], message: 'Merge Sort complete!', mergeCtx: null }
}

export function* quickSortTree(arr) {
  _id = 0
  const a = [...arr]

  const root = {
    id: 'root',
    lo: 0,
    hi: a.length - 1,
    values: [...a],
    mergedSoFar: null,
    pivotIndex: -1,
    left: null,
    right: null,
    status: 'idle',
    compareAt: null,
  }

  function snap(activeId, phase, message, extra = {}) {
    return {
      type: 'tree-step',
      tree: cloneTree(root),
      activeId,
      phase,
      message,
      array: [...a],
      mergeCtx: null,
      ...extra,
    }
  }

  function* sort(node) {
    node.status = 'active'
    node.values = a.slice(node.lo, node.hi + 1)
    yield snap(node.id, 'call', `quickSort(${node.lo}, ${node.hi})`)

    if (node.lo >= node.hi) {
      node.status = 'sorted'
      yield snap(node.id, 'sorted', `Base case sorted`)
      return
    }

    const pivotVal = a[node.lo]
    node.pivotIndex = 0
    node.status = 'pivot'
    yield snap(node.id, 'pivot', `Pivot = ${pivotVal}`)

    let i = node.lo + 1
    for (let j = node.lo + 1; j <= node.hi; j++) {
      node.compareAt = { j: j - node.lo, pivot: 0 }
      node.status = 'partition'
      yield snap(node.id, 'compare', `Compare ${a[j]} with pivot ${pivotVal}`)

      if (a[j] < pivotVal) {
        ;[a[i], a[j]] = [a[j], a[i]]
        node.values = a.slice(node.lo, node.hi + 1)
        node.compareAt = { i: i - node.lo, j: j - node.lo, pivot: 0 }
        yield snap(node.id, 'swap', `Swap ${a[i]} ↔ ${a[j]}`)
        i++
      }
    }

    ;[a[node.lo], a[i - 1]] = [a[i - 1], a[node.lo]]
    node.values = a.slice(node.lo, node.hi + 1)
    node.pivotIndex = i - 1 - node.lo
    node.status = 'partition-done'
    yield snap(node.id, 'partition', `Pivot placed at index ${i - 1}`)

    const p = i - 1

    if (p - 1 >= node.lo) {
      node.left = { id: nid('L'), lo: node.lo, hi: p - 1, values: a.slice(node.lo, p), left: null, right: null, status: 'idle', compareAt: null, pivotIndex: -1, mergedSoFar: null }
      yield snap(node.id, 'split', `Left partition [${node.left.values.join(', ')}]`)
      yield* sort(node.left)
    }

    if (p + 1 <= node.hi) {
      node.right = { id: nid('R'), lo: p + 1, hi: node.hi, values: a.slice(p + 1, node.hi + 1), left: null, right: null, status: 'idle', compareAt: null, pivotIndex: -1, mergedSoFar: null }
      yield snap(node.id, 'split', `Right partition [${node.right.values.join(', ')}]`)
      yield* sort(node.right)
    }

    node.status = 'sorted'
    node.values = a.slice(node.lo, node.hi + 1)
    yield snap(node.id, 'sorted', `Sorted [${node.values.join(', ')}]`)
  }

  yield* sort(root)
  yield { type: 'done', tree: cloneTree(root), array: [...a], message: 'Quick Sort complete!' }
}

export const TREE_ALGO_KEYS = ['merge', 'quick']

export function getTreeGenerator(key, arr) {
  if (key === 'merge') return mergeSortTree(arr)
  if (key === 'quick') return quickSortTree(arr)
  return null
}
