export function* mergeSortTrace(arr, lo, hi, depth = 0, callId = { n: 0 }) {
  const id = callId.n++
  yield { type: 'call', fn: 'mergeSort', args: { lo, hi }, depth, id, array: [...arr], message: `mergeSort(${lo}, ${hi})` }
  if (lo >= hi) {
    yield { type: 'base', fn: 'mergeSort', depth, id, array: [...arr], message: `Base case: single element` }
    return
  }
  const mid = Math.floor((lo + hi) / 2)
  yield { type: 'divide', fn: 'mergeSort', mid, depth, id, array: [...arr], message: `Divide at mid=${mid}` }
  yield* mergeSortTrace(arr, lo, mid, depth + 1, callId)
  yield* mergeSortTrace(arr, mid + 1, hi, depth + 1, callId)
  yield { type: 'merge', fn: 'merge', lo, mid, hi, depth, id, array: [...arr], message: `Merge [${lo}..${mid}] + [${mid+1}..${hi}]` }
  yield { type: 'return', fn: 'mergeSort', depth, id, array: [...arr], message: `Return from mergeSort(${lo}, ${hi})` }
}

export function* quickSortTrace(arr, lo, hi, depth = 0, callId = { n: 0 }) {
  const id = callId.n++
  yield { type: 'call', fn: 'quickSort', args: { lo, hi }, depth, id, array: [...arr], message: `quickSort(${lo}, ${hi})` }
  if (lo >= hi) {
    yield { type: 'base', fn: 'quickSort', depth, id, array: [...arr], message: `Base case` }
    return
  }
  const pivot = arr[lo]
  yield { type: 'pivot', fn: 'partition', pivot, lo, depth, id, array: [...arr], message: `Pivot = ${pivot}` }
  let i = lo + 1
  for (let j = lo + 1; j <= hi; j++) {
    if (arr[j] < pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      yield { type: 'swap', depth, id, array: [...arr], message: `Swap ${arr[i]} ↔ ${arr[j]}` }
      i++
    }
  }
  ;[arr[lo], arr[i - 1]] = [arr[i - 1], arr[lo]]
  const p = i - 1
  yield { type: 'partition', pivot: p, depth, id, array: [...arr], message: `Partition done, pivot at ${p}` }
  yield* quickSortTrace(arr, lo, p - 1, depth + 1, callId)
  yield* quickSortTrace(arr, p + 1, hi, depth + 1, callId)
  yield { type: 'return', fn: 'quickSort', depth, id, array: [...arr], message: `Return from quickSort(${lo}, ${hi})` }
}

export function buildCallTree(steps) {
  const root = { label: 'main()', children: [], depth: -1, type: 'root' }
  const stack = [root]
  for (const step of steps) {
    if (step.type === 'call') {
      const node = { label: `${step.fn}(${step.args.lo}, ${step.args.hi})`, children: [], depth: step.depth, type: step.fn, active: false }
      stack[stack.length - 1].children.push(node)
      stack.push(node)
    } else if (step.type === 'return' || step.type === 'base') {
      if (stack.length > 1) stack.pop()
    }
  }
  return root
}
