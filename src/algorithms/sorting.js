export function* bubbleSort(arr) {
  const a = [...arr]
  const n = a.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', indices: [j, j + 1], array: [...a] }
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        yield { type: 'swap', indices: [j, j + 1], array: [...a] }
      }
    }
    yield { type: 'sorted', index: n - i - 1, array: [...a] }
  }
  yield { type: 'done', array: [...a] }
}

export function* selectionSort(arr) {
  const a = [...arr]
  const n = a.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    yield { type: 'compare', indices: [i], array: [...a], pivot: i }
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', indices: [j, minIdx], array: [...a] }
      if (a[j] < a[minIdx]) {
        if (minIdx !== i) yield { type: 'reset', index: minIdx, array: [...a] }
        minIdx = j
        yield { type: 'pivot', index: minIdx, array: [...a] }
      }
    }
    if (minIdx !== i) {
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      yield { type: 'swap', indices: [i, minIdx], array: [...a] }
    }
    yield { type: 'sorted', index: i, array: [...a] }
  }
  yield { type: 'sorted', index: n - 1, array: [...a] }
  yield { type: 'done', array: [...a] }
}

export function* insertionSort(arr) {
  const a = [...arr]
  const n = a.length
  for (let i = 1; i < n; i++) {
    const key = a[i]
    let j = i - 1
    yield { type: 'compare', indices: [i], array: [...a], pivot: i }
    while (j >= 0 && a[j] > key) {
      yield { type: 'compare', indices: [j, j + 1], array: [...a] }
      a[j + 1] = a[j]
      yield { type: 'swap', indices: [j, j + 1], array: [...a] }
      j--
    }
    a[j + 1] = key
    yield { type: 'insert', index: j + 1, array: [...a] }
    for (let k = 0; k <= i; k++) yield { type: 'sorted', index: k, array: [...a] }
  }
  yield { type: 'done', array: [...a] }
}

export function* mergeSort(arr) {
  const a = [...arr]
  yield* mergeSortHelper(a, 0, a.length - 1)
  yield { type: 'done', array: [...a] }
}

function* mergeSortHelper(a, lo, hi) {
  if (lo >= hi) return
  const mid = Math.floor((lo + hi) / 2)
  yield { type: 'pivot', index: mid, array: [...a] }
  yield* mergeSortHelper(a, lo, mid)
  yield* mergeSortHelper(a, mid + 1, hi)
  yield* merge(a, lo, mid, hi)
}

function* merge(a, lo, mid, hi) {
  const temp = []
  let i = lo, j = mid + 1
  while (i <= mid && j <= hi) {
    yield { type: 'compare', indices: [i, j], array: [...a] }
    if (a[i] <= a[j]) {
      temp.push(a[i++])
      yield { type: 'swap', indices: [i - 1], array: [...a] }
    } else {
      temp.push(a[j++])
      yield { type: 'swap', indices: [j - 1], array: [...a] }
    }
  }
  while (i <= mid) { temp.push(a[i++]); yield { type: 'swap', indices: [i - 1], array: [...a] } }
  while (j <= hi) { temp.push(a[j++]); yield { type: 'swap', indices: [j - 1], array: [...a] } }
  for (let k = 0; k < temp.length; k++) {
    a[lo + k] = temp[k]
    yield { type: 'sorted', index: lo + k, array: [...a] }
  }
}

export function* quickSort(arr) {
  const a = [...arr]
  yield* quickSortHelper(a, 0, a.length - 1)
  yield { type: 'done', array: [...a] }
}

function* quickSortHelper(a, lo, hi) {
  if (lo >= hi) return
  const p = yield* partition(a, lo, hi)
  yield* quickSortHelper(a, lo, p - 1)
  yield* quickSortHelper(a, p + 1, hi)
}

function* partition(a, lo, hi) {
  const pivot = a[lo]
  yield { type: 'pivot', index: lo, array: [...a] }
  let i = lo + 1
  for (let j = lo + 1; j <= hi; j++) {
    yield { type: 'compare', indices: [j, lo], array: [...a] }
    if (a[j] < pivot) {
      ;[a[i], a[j]] = [a[j], a[i]]
      yield { type: 'swap', indices: [i, j], array: [...a] }
      i++
    }
  }
  ;[a[lo], a[i - 1]] = [a[i - 1], a[lo]]
  yield { type: 'swap', indices: [lo, i - 1], array: [...a] }
  for (let t = lo; t <= i - 1; t++) yield { type: 'sorted', index: t, array: [...a] }
  return i - 1
}

export function* heapSort(arr) {
  const a = [...arr]
  const n = a.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* heapify(a, n, i)
  for (let i = n - 1; i > 0; i--) {
    ;[a[0], a[i]] = [a[i], a[0]]
    yield { type: 'swap', indices: [0, i], array: [...a] }
    yield { type: 'sorted', index: i, array: [...a] }
    yield* heapify(a, i, 0)
  }
  yield { type: 'sorted', index: 0, array: [...a] }
  yield { type: 'done', array: [...a] }
}

function* heapify(a, n, i) {
  let largest = i
  const l = 2 * i + 1, r = 2 * i + 2
  if (l < n) {
    yield { type: 'compare', indices: [l, largest], array: [...a] }
    if (a[l] > a[largest]) largest = l
  }
  if (r < n) {
    yield { type: 'compare', indices: [r, largest], array: [...a] }
    if (a[r] > a[largest]) largest = r
  }
  if (largest !== i) {
    ;[a[i], a[largest]] = [a[largest], a[i]]
    yield { type: 'swap', indices: [i, largest], array: [...a] }
    yield* heapify(a, n, largest)
  }
}

export function* shellSort(arr) {
  const a = [...arr]
  const n = a.length
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = a[i]
      let j = i
      yield { type: 'compare', indices: [i], array: [...a], pivot: i }
      while (j >= gap && a[j - gap] > temp) {
        yield { type: 'compare', indices: [j, j - gap], array: [...a] }
        a[j] = a[j - gap]
        yield { type: 'swap', indices: [j, j - gap], array: [...a] }
        j -= gap
      }
      a[j] = temp
      yield { type: 'insert', index: j, array: [...a] }
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'sorted', index: i, array: [...a] }
  yield { type: 'done', array: [...a] }
}

export function* cocktailSort(arr) {
  const a = [...arr]
  let start = 0, end = a.length - 1
  while (start < end) {
    for (let i = start; i < end; i++) {
      yield { type: 'compare', indices: [i, i + 1], array: [...a] }
      if (a[i] > a[i + 1]) {
        ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
        yield { type: 'swap', indices: [i, i + 1], array: [...a] }
      }
    }
    yield { type: 'sorted', index: end, array: [...a] }
    end--
    for (let i = end; i > start; i--) {
      yield { type: 'compare', indices: [i, i - 1], array: [...a] }
      if (a[i] < a[i - 1]) {
        ;[a[i], a[i - 1]] = [a[i - 1], a[i]]
        yield { type: 'swap', indices: [i, i - 1], array: [...a] }
      }
    }
    yield { type: 'sorted', index: start, array: [...a] }
    start++
  }
  yield { type: 'done', array: [...a] }
}

export function* countingSort(arr) {
  const a = [...arr]
  const max = Math.max(...a)
  const count = new Array(max + 1).fill(0)
  for (let i = 0; i < a.length; i++) {
    yield { type: 'compare', indices: [i], array: [...a] }
    count[a[i]]++
  }
  let idx = 0
  for (let i = 0; i <= max; i++) {
    while (count[i] > 0) {
      a[idx] = i
      yield { type: 'insert', index: idx, array: [...a] }
      idx++
      count[i]--
    }
  }
  for (let i = 0; i < a.length; i++) yield { type: 'sorted', index: i, array: [...a] }
  yield { type: 'done', array: [...a] }
}

export const ALGORITHMS = {
  bubble: { name: 'Bubble Sort', fn: bubbleSort, color: '#f97316', time: { worst: 'O(n²)', avg: 'Θ(n²)', best: 'Ω(n)' }, space: 'O(1)' },
  selection: { name: 'Selection Sort', fn: selectionSort, color: '#3b82f6', time: { worst: 'O(n²)', avg: 'Θ(n²)', best: 'Ω(n²)' }, space: 'O(1)' },
  insertion: { name: 'Insertion Sort', fn: insertionSort, color: '#10b981', time: { worst: 'O(n²)', avg: 'Θ(n²)', best: 'Ω(n)' }, space: 'O(1)' },
  merge: { name: 'Merge Sort', fn: mergeSort, color: '#8b5cf6', time: { worst: 'O(n log n)', avg: 'Θ(n log n)', best: 'Ω(n log n)' }, space: 'O(n)' },
  quick: { name: 'Quick Sort', fn: quickSort, color: '#ef4444', time: { worst: 'O(n²)', avg: 'Θ(n log n)', best: 'Ω(n log n)' }, space: 'O(log n)' },
  heap: { name: 'Heap Sort', fn: heapSort, color: '#eab308', time: { worst: 'O(n log n)', avg: 'Θ(n log n)', best: 'Ω(n log n)' }, space: 'O(1)' },
  shell: { name: 'Shell Sort', fn: shellSort, color: '#06b6d4', time: { worst: 'O(n²)', avg: 'O(n^4/3)', best: 'Ω(n log n)' }, space: 'O(1)' },
  cocktail: { name: 'Cocktail Sort', fn: cocktailSort, color: '#ec4899', time: { worst: 'O(n²)', avg: 'Θ(n²)', best: 'Ω(n)' }, space: 'O(1)' },
  counting: { name: 'Counting Sort', fn: countingSort, color: '#14b8a6', time: { worst: 'O(n+k)', avg: 'Θ(n+k)', best: 'Ω(n+k)' }, space: 'O(k)' },
}

export function randomArray(size, maxVal = 100) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * maxVal) + 5)
}
