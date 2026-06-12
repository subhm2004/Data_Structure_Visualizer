function cloneBit(bit) {
  return [...bit]
}

function cloneArr(arr) {
  return [...arr]
}

function lsb(i) {
  return i & -i
}

export function buildFenwick(arr) {
  const n = arr.length
  const bit = new Array(n + 1).fill(0)
  for (let i = 0; i < n; i++) {
    bit[i + 1] += arr[i]
    const j = i + 1 + lsb(i + 1)
    if (j <= n) bit[j] += bit[i + 1]
  }
  return bit
}

export function* buildFenwickSteps(arr) {
  const n = arr.length
  const a = cloneArr(arr)
  const bit = new Array(n + 1).fill(0)

  yield {
    type: 'init',
    array: cloneArr(a),
    bit: cloneBit(bit),
    active: [],
    message: `Fenwick Tree banate hain — size ${n}, 1-indexed BIT array`,
  }

  for (let i = 0; i < n; i++) {
    const idx = i + 1
    bit[idx] += a[i]
    yield {
      type: 'build-add',
      array: cloneArr(a),
      bit: cloneBit(bit),
      active: [idx],
      index: idx,
      delta: a[i],
      message: `arr[${i}]=${a[i]} → BIT[${idx}] += ${a[i]}  →  BIT[${idx}]=${bit[idx]}`,
    }

    const j = idx + lsb(idx)
    if (j <= n) {
      yield {
        type: 'propagate',
        array: cloneArr(a),
        bit: cloneBit(bit),
        active: [idx, j],
        from: idx,
        to: j,
        lsbVal: lsb(idx),
        message: `LSB(${idx})=${lsb(idx)} → propagate BIT[${idx}] to BIT[${j}]`,
      }
      bit[j] += bit[idx]
      yield {
        type: 'propagate-done',
        array: cloneArr(a),
        bit: cloneBit(bit),
        active: [j],
        from: idx,
        to: j,
        message: `BIT[${j}] += BIT[${idx}]  →  BIT[${j}]=${bit[j]}`,
      }
    }
  }

  yield {
    type: 'done',
    array: cloneArr(a),
    bit: cloneBit(bit),
    active: [],
    message: 'Fenwick Tree ready!',
  }
}

export function* updateFenwickSteps(arr, bit, index, delta) {
  const n = arr.length
  const a = cloneArr(arr)
  const b = cloneBit(bit)
  const i = index

  if (i < 0 || i >= n) {
    yield { type: 'error', array: a, bit: b, active: [], message: `Invalid index ${index}` }
    return
  }

  a[i] += delta
  yield {
    type: 'update-start',
    array: cloneArr(a),
    bit: cloneBit(b),
    active: [i + 1],
    index: i,
    delta,
    message: `Update: arr[${i}] += ${delta}  →  arr[${i}]=${a[i]}`,
  }

  let j = i + 1
  while (j <= n) {
    yield {
      type: 'visit',
      array: cloneArr(a),
      bit: cloneBit(b),
      active: [j],
      index: j,
      lsbVal: lsb(j),
      phase: 'update',
      message: `BIT[${j}] += ${delta}   (i=${j}, LSB=${lsb(j)})`,
    }
    b[j] += delta
    yield {
      type: 'visit-done',
      array: cloneArr(a),
      bit: cloneBit(b),
      active: [j],
      index: j,
      phase: 'update',
      message: `BIT[${j}] = ${b[j]}`,
    }
    j += lsb(j)
    if (j <= n) {
      yield {
        type: 'step-next',
        array: cloneArr(a),
        bit: cloneBit(b),
        active: [j],
        from: j - lsb(j - lsb(j - 1) || 1),
        index: j,
        lsbVal: lsb(j - lsb(j)),
        phase: 'update',
        message: `Next: j += LSB  →  j=${j}`,
      }
    }
  }

  yield {
    type: 'done',
    array: cloneArr(a),
    bit: cloneBit(b),
    active: [],
    message: `Update complete — arr[${i}] ab ${a[i]} hai`,
  }
}

export function* queryFenwickSteps(arr, bit, index) {
  const n = arr.length
  const b = cloneBit(bit)
  let j = index + 1
  let sum = 0
  const visited = []

  yield {
    type: 'query-start',
    array: cloneArr(arr),
    bit: cloneBit(b),
    active: [j],
    index: j,
    sum: 0,
    message: `Prefix sum query: sum(0..${index}) — start j=${j}`,
  }

  while (j > 0) {
    visited.push(j)
    yield {
      type: 'visit',
      array: cloneArr(arr),
      bit: cloneBit(b),
      active: [j],
      visited: [...visited],
      index: j,
      lsbVal: lsb(j),
      phase: 'query',
      sum,
      message: `Add BIT[${j}]=${b[j]}  (j=${j}, LSB=${lsb(j)})`,
    }
    sum += b[j]
    yield {
      type: 'visit-done',
      array: cloneArr(arr),
      bit: cloneBit(b),
      active: [j],
      visited: [...visited],
      index: j,
      phase: 'query',
      sum,
      message: `Running sum = ${sum}`,
    }
    const next = j - lsb(j)
    if (next > 0) {
      yield {
        type: 'step-next',
        array: cloneArr(arr),
        bit: cloneBit(b),
        active: [next],
        visited: [...visited],
        index: next,
        phase: 'query',
        sum,
        message: `Next: j -= LSB  →  j=${next}`,
      }
    }
    j = next
  }

  yield {
    type: 'done',
    array: cloneArr(arr),
    bit: cloneBit(b),
    active: [],
    sum,
    result: sum,
    message: `Prefix sum(0..${index}) = ${sum}`,
  }
}

export function* rangeQueryFenwickSteps(arr, bit, left, right) {
  yield {
    type: 'range-info',
    array: cloneArr(arr),
    bit: cloneBit(bit),
    active: [],
    left,
    right,
    message: `Range sum [${left}..${right}] = prefix(${right}) − prefix(${left - 1})`,
  }

  let sumRight = 0
  let j = right + 1
  const visitedR = []
  while (j > 0) {
    visitedR.push(j)
    yield {
      type: 'visit',
      array: cloneArr(arr),
      bit: cloneBit(bit),
      active: [j],
      visited: [...visitedR],
      index: j,
      phase: 'query-right',
      sum: sumRight,
      message: `Right part: add BIT[${j}]=${bit[j]}`,
    }
    sumRight += bit[j]
    j -= lsb(j)
  }

  let sumLeft = 0
  if (left > 0) {
    j = left
    const visitedL = []
    while (j > 0) {
      visitedL.push(j)
      yield {
        type: 'visit',
        array: cloneArr(arr),
        bit: cloneBit(bit),
        active: [j],
        visited: [...visitedL],
        index: j,
        phase: 'query-left',
        sum: sumLeft,
        message: `Left part: add BIT[${j}]=${bit[j]} (subtract karenge)`,
      }
      sumLeft += bit[j]
      j -= lsb(j)
    }
  }

  const result = sumRight - sumLeft
  yield {
    type: 'done',
    array: cloneArr(arr),
    bit: cloneBit(bit),
    active: [],
    sumRight,
    sumLeft,
    result,
    left,
    right,
    message: `Range [${left}..${right}] = ${sumRight} − ${sumLeft} = ${result}`,
  }
}

export function randomArray(n, max = 20) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * max) + 1)
}
