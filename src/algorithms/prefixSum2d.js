function cloneMatrix(m) {
  return m.map(row => [...row])
}

export function buildPrefix2D(matrix) {
  const rows = matrix.length
  const cols = matrix[0]?.length || 0
  const prefix = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0))

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      prefix[r][c] = matrix[r - 1][c - 1]
        + prefix[r - 1][c]
        + prefix[r][c - 1]
        - prefix[r - 1][c - 1]
    }
  }
  return prefix
}

export function queryPrefix2D(prefix, r1, c1, r2, c2) {
  return prefix[r2 + 1][c2 + 1]
    - prefix[r1][c2 + 1]
    - prefix[r2 + 1][c1]
    + prefix[r1][c1]
}

export function randomMatrix(rows = 4, cols = 4, max = 9) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * max) + 1)
  )
}

export function* buildPrefix2DSteps(matrix) {
  const m = cloneMatrix(matrix)
  const rows = m.length
  const cols = m[0]?.length || 0
  const prefix = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0))

  yield {
    type: 'init',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(prefix),
    highlight: [],
    formula: null,
    message: `${rows}×${cols} matrix — 2D prefix sum table banate hain (1-indexed)`,
  }

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const val = m[r - 1][c - 1]
      const top = prefix[r - 1][c]
      const left = prefix[r][c - 1]
      const diag = prefix[r - 1][c - 1]

      yield {
        type: 'compute',
        matrix: cloneMatrix(m),
        prefix: cloneMatrix(prefix),
        cell: [r, c],
        highlight: [[r, c], [r - 1, c], [r, c - 1], [r - 1, c - 1]],
        highlightTypes: { [`${r},${c}`]: 'current', [`${r - 1},${c}`]: 'top', [`${r},${c - 1}`]: 'left', [`${r - 1},${c - 1}`]: 'diag' },
        formula: { val, top, left, diag },
        message: `prefix[${r}][${c}] = ${val} + ${top} + ${left} − ${diag}`,
      }

      prefix[r][c] = val + top + left - diag

      yield {
        type: 'set',
        matrix: cloneMatrix(m),
        prefix: cloneMatrix(prefix),
        cell: [r, c],
        highlight: [[r, c]],
        formula: { result: prefix[r][c] },
        message: `prefix[${r}][${c}] = ${prefix[r][c]}`,
      }
    }
  }

  yield {
    type: 'done',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(prefix),
    highlight: [],
    message: '2D Prefix Sum table ready!',
  }
}

export function* queryPrefix2DSteps(matrix, prefix, r1, c1, r2, c2) {
  const m = cloneMatrix(matrix)
  const p = cloneMatrix(prefix)

  yield {
    type: 'query-start',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    highlight: [],
    message: `Submatrix sum: rows [${r1}..${r2}], cols [${c1}..${c2}]`,
  }

  yield {
    type: 'show-region',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    highlight: getRegionCells(r1, c1, r2, c2),
    message: `Query region highlight — ${(r2 - r1 + 1) * (c2 - c1 + 1)} cells`,
  }

  const A = p[r2 + 1][c2 + 1]
  yield {
    type: 'corner',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    corner: 'A',
    cell: [r2 + 1, c2 + 1],
    highlight: [[r2 + 1, c2 + 1]],
    partial: A,
    message: `A = prefix[${r2 + 1}][${c2 + 1}] = ${A}  (bottom-right corner)`,
  }

  const B = p[r1][c2 + 1]
  yield {
    type: 'corner',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    corner: 'B',
    cell: [r1, c2 + 1],
    highlight: [[r2 + 1, c2 + 1], [r1, c2 + 1]],
    partial: B,
    message: `B = prefix[${r1}][${c2 + 1}] = ${B}  (subtract top strip)`,
  }

  const C = p[r2 + 1][c1]
  yield {
    type: 'corner',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    corner: 'C',
    cell: [r2 + 1, c1],
    highlight: [[r2 + 1, c2 + 1], [r1, c2 + 1], [r2 + 1, c1]],
    partial: C,
    message: `C = prefix[${r2 + 1}][${c1}] = ${C}  (subtract left strip)`,
  }

  const D = p[r1][c1]
  yield {
    type: 'corner',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    corner: 'D',
    cell: [r1, c1],
    highlight: [[r2 + 1, c2 + 1], [r1, c2 + 1], [r2 + 1, c1], [r1, c1]],
    partial: D,
    message: `D = prefix[${r1}][${c1}] = ${D}  (add back overlap)`,
  }

  const result = A - B - C + D

  yield {
    type: 'formula',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    highlight: getRegionCells(r1, c1, r2, c2),
    parts: { A, B, C, D },
    result,
    message: `Sum = A − B − C + D = ${A} − ${B} − ${C} + ${D} = ${result}`,
  }

  yield {
    type: 'done',
    matrix: cloneMatrix(m),
    prefix: cloneMatrix(p),
    region: { r1, c1, r2, c2 },
    highlight: getRegionCells(r1, c1, r2, c2),
    result,
    message: `Submatrix sum = ${result}`,
  }
}

function getRegionCells(r1, c1, r2, c2) {
  const cells = []
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      cells.push([r, c])
    }
  }
  return cells
}
