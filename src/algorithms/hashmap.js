export function hashIndex(key, size) {
  return Math.abs(key) % size
}

export function createChainingTable(size) {
  return Array.from({ length: size }, () => [])
}

export function createProbingTable(size) {
  return Array(size).fill(null)
}

export function* insertChaining(buckets, key, value, size) {
  const idx = hashIndex(key, size)
  yield { type: 'hash', idx, key, buckets: buckets.map(b => [...b]), message: `hash(${key}) % ${size} = ${idx}` }
  const chain = [...buckets[idx]]
  const existing = chain.findIndex(e => e.key === key)
  if (existing >= 0) {
    chain[existing] = { key, value }
    buckets[idx] = chain
    yield { type: 'update', idx, buckets: buckets.map(b => [...b]), message: `Updated key ${key} in bucket ${idx}` }
    return
  }
  yield { type: 'collision', idx, buckets: buckets.map(b => [...b]), message: `Add to chain at bucket ${idx}` }
  chain.push({ key, value })
  buckets[idx] = chain
  yield { type: 'insert', idx, buckets: buckets.map(b => [...b]), message: `Inserted (${key}:${value}) in bucket ${idx}` }
}

export function* searchChaining(buckets, key, size) {
  const idx = hashIndex(key, size)
  yield { type: 'hash', idx, key, buckets: buckets.map(b => [...b]), message: `hash(${key}) % ${size} = ${idx}` }
  const chain = buckets[idx]
  for (let i = 0; i < chain.length; i++) {
    yield { type: 'compare', idx, chainIndex: i, buckets: buckets.map(b => [...b]), message: `Check chain[${i}]: key=${chain[i].key}` }
    if (chain[i].key === key) {
      yield { type: 'found', idx, chainIndex: i, buckets: buckets.map(b => [...b]), message: `Found ${key} → value ${chain[i].value}` }
      return
    }
  }
  yield { type: 'notfound', buckets: buckets.map(b => [...b]), message: `Key ${key} not found` }
}

export function* deleteChaining(buckets, key, size) {
  const idx = hashIndex(key, size)
  yield { type: 'hash', idx, key, buckets: buckets.map(b => [...b]), message: `hash(${key}) % ${size} = ${idx}` }
  const chain = [...buckets[idx]]
  const fi = chain.findIndex(e => e.key === key)
  if (fi < 0) {
    yield { type: 'notfound', buckets: buckets.map(b => [...b]), message: `Key ${key} not found` }
    return
  }
  yield { type: 'compare', idx, chainIndex: fi, buckets: buckets.map(b => [...b]), message: `Found key ${key}, removing...` }
  chain.splice(fi, 1)
  buckets[idx] = chain
  yield { type: 'delete', idx, buckets: buckets.map(b => [...b]), message: `Deleted ${key} from bucket ${idx}` }
}

export function* insertProbing(table, key, value, size) {
  let idx = hashIndex(key, size)
  let start = idx
  yield { type: 'hash', idx, key, table: [...table], message: `hash(${key}) % ${size} = ${idx}` }
  while (table[idx] !== null) {
    if (table[idx].key === key) {
      table[idx] = { key, value }
      yield { type: 'update', idx, table: [...table], message: `Updated key ${key} at index ${idx}` }
      return
    }
    yield { type: 'probe', idx, table: [...table], message: `Collision at ${idx}, linear probe → ${(idx + 1) % size}` }
    idx = (idx + 1) % size
    if (idx === start) {
      yield { type: 'error', table: [...table], message: 'Table full!' }
      return
    }
  }
  table[idx] = { key, value }
  yield { type: 'insert', idx, table: [...table], message: `Inserted (${key}:${value}) at index ${idx}` }
}

export function* searchProbing(table, key, size) {
  let idx = hashIndex(key, size)
  let start = idx
  yield { type: 'hash', idx, key, table: [...table], message: `hash(${key}) % ${size} = ${idx}` }
  while (table[idx] !== null) {
    yield { type: 'compare', idx, table: [...table], message: `Check index ${idx}: key=${table[idx].key}` }
    if (table[idx].key === key) {
      yield { type: 'found', idx, table: [...table], message: `Found ${key} → value ${table[idx].value}` }
      return
    }
    yield { type: 'probe', idx, table: [...table], message: `Probe next: ${(idx + 1) % size}` }
    idx = (idx + 1) % size
    if (idx === start) break
  }
  yield { type: 'notfound', table: [...table], message: `Key ${key} not found` }
}

export function* deleteProbing(table, key, size) {
  let idx = hashIndex(key, size)
  let start = idx
  yield { type: 'hash', idx, key, table: [...table], message: `hash(${key}) % ${size} = ${idx}` }
  while (table[idx] !== null) {
    yield { type: 'compare', idx, table: [...table], message: `Check index ${idx}` }
    if (table[idx].key === key) {
      table[idx] = null
      yield { type: 'delete', idx, table: [...table], message: `Deleted ${key} from index ${idx}` }
      return
    }
    idx = (idx + 1) % size
    if (idx === start) break
  }
  yield { type: 'notfound', table: [...table], message: `Key ${key} not found` }
}
