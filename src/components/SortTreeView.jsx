function findPath(node, targetId, path = []) {
  if (!node) return null
  const next = [...path, node]
  if (node.id === targetId) return next
  return findPath(node.left, targetId, next) || findPath(node.right, targetId, next)
}

function CallStack({ tree, activeId }) {
  const path = findPath(tree, activeId)
  if (!path?.length) return null

  return (
    <div className="sort-call-stack">
      <span className="sort-call-stack-label">Call path</span>
      <div className="sort-call-stack-items">
        {path.map((node, i) => (
          <span key={node.id} className={`sort-call-frame${i === path.length - 1 ? ' active' : ''}${node.status === 'sorted' ? ' sorted' : ''}`}>
            [{node.lo}..{node.hi}]
            {i < path.length - 1 && <span className="sort-call-arrow">→</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

function MergePanel({ ctx, message }) {
  if (!ctx) return null

  const { left, right, merged, li, ri, pickedFrom, pickedVal, comparing, done, lo, hi } = ctx
  const total = left.length + right.length
  const progress = total ? Math.round((merged.length / total) * 100) : 0

  return (
    <div className={`merge-panel merge-panel-focus${done ? ' merge-done' : ''}`}>
      <div className="merge-panel-header">
        <div className="merge-panel-title">
          {done ? '✓ MERGE COMPLETE' : '⬆ MERGING TWO SORTED HALVES'}
        </div>
        {lo != null && hi != null && (
          <div className="merge-panel-range">Range [{lo}..{hi}] in main array</div>
        )}
      </div>

      <div className="merge-progress-wrap">
        <div className="merge-progress-bar" style={{ width: `${progress}%` }} />
        <span className="merge-progress-text">{merged.length} / {total} values placed</span>
      </div>

      <div className="merge-panel-row">
        <div className="merge-side">
          <span className="merge-side-label">LEFT (sorted)</span>
          <div className="merge-side-vals">
            {left.map((v, i) => (
              <span
                key={i}
                className={[
                  'merge-val',
                  i < li ? 'consumed' : '',
                  i === li && (comparing || pickedFrom === 'left') ? 'highlight' : '',
                  pickedFrom === 'left' && i === li - 1 ? 'picked' : '',
                ].filter(Boolean).join(' ')}
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="merge-arrows">
          {comparing && left[li] != null && right[ri] != null && (
            <span className="merge-compare-text">{left[li]} vs {right[ri]}</span>
          )}
          {pickedFrom === 'left' && (
            <span className="merge-arrow left-arrow">← pick {pickedVal}</span>
          )}
          {pickedFrom === 'right' && (
            <span className="merge-arrow right-arrow">pick {pickedVal} →</span>
          )}
          {!pickedFrom && !comparing && !done && (
            <span className="merge-arrow idle-arrow">↓</span>
          )}
          {done && <span className="merge-arrow done-arrow">✓</span>}
        </div>

        <div className="merge-side">
          <span className="merge-side-label">RIGHT (sorted)</span>
          <div className="merge-side-vals">
            {right.map((v, i) => (
              <span
                key={i}
                className={[
                  'merge-val',
                  i < ri ? 'consumed' : '',
                  i === ri && (comparing || pickedFrom === 'right') ? 'highlight' : '',
                  pickedFrom === 'right' && i === ri - 1 ? 'picked' : '',
                ].filter(Boolean).join(' ')}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="merge-result">
        <span className="merge-side-label">RESULT (written back to parent)</span>
        <div className="merge-result-vals">
          {merged.length === 0 ? (
            <span className="merge-empty">Compare heads of left &amp; right, pick smaller...</span>
          ) : (
            merged.map((v, i) => (
              <span
                key={i}
                className={`merge-val merged${i === merged.length - 1 && !done ? ' just-added' : ''}`}
              >
                {v}
              </span>
            ))
          )}
        </div>
      </div>

      {message && <p className="merge-panel-message">{message}</p>}
    </div>
  )
}

function SplitView({ tree, activeId, message }) {
  const path = findPath(tree, activeId)
  const node = path?.[path.length - 1]
  if (!node?.left || !node?.right) return null

  return (
    <div className="split-view">
      <div className="split-view-title">SPLIT</div>
      <div className="split-parent">
        <span className="split-label">Parent [{node.lo}..{node.hi}]</span>
        <div className="split-vals">
          {node.values.map((v, i) => (
            <span key={i} className="merge-val">{v}</span>
          ))}
        </div>
      </div>
      <div className="split-arrow-down">↓ divide ↓</div>
      <div className="split-children">
        <div className="split-child left">
          <span className="split-label">Left [{node.left.lo}..{node.left.hi}]</span>
          <div className="split-vals">
            {node.left.values.map((v, i) => (
              <span key={i} className="merge-val">{v}</span>
            ))}
          </div>
        </div>
        <div className="split-child right">
          <span className="split-label">Right [{node.right.lo}..{node.right.hi}]</span>
          <div className="split-vals">
            {node.right.values.map((v, i) => (
              <span key={i} className="merge-val">{v}</span>
            ))}
          </div>
        </div>
      </div>
      {message && <p className="sort-tree-message">{message}</p>}
    </div>
  )
}

function CompactTreeNode({ node, activeId, depth = 0 }) {
  if (!node) return null

  const isActive = node.id === activeId
  const hasChildren = node.left || node.right
  const isCollapsed = node.status === 'sorted' && !hasChildren

  return (
    <div className="sort-tree-branch compact">
      <div className={`sort-tree-node ${node.status}${isActive ? ' node-active' : ''}${isCollapsed ? ' collapsed' : ''}`}>
        <div className="sort-tree-node-label">[{node.lo}..{node.hi}]</div>
        <div className="sort-tree-values">
          {node.values.map((val, i) => (
            <span key={`${node.id}-${i}`} className={`sort-tree-val ${node.status === 'sorted' ? 'sorted' : 'default'}`}>
              {val}
            </span>
          ))}
        </div>
        {node.status === 'sorted' && <span className="sort-tree-badge sorted">✓</span>}
      </div>

      {hasChildren && (
        <>
          <div className="sort-tree-connectors" />
          <div className="sort-tree-children">
            <CompactTreeNode node={node.left} activeId={activeId} depth={depth + 1} />
            <CompactTreeNode node={node.right} activeId={activeId} depth={depth + 1} />
          </div>
        </>
      )}
    </div>
  )
}

const MERGE_PHASES = new Set([
  'merge-start', 'compare', 'take-left', 'take-right', 'merging',
])

export default function SortTreeView({ tree, activeId, phase, message, mergeCtx }) {
  if (!tree) {
    return (
      <div className="sort-tree-empty">
        <p>Merge Sort ya Quick Sort select karo → Tree view</p>
        <p className="sort-tree-empty-hint">Merge phase mein left + right combine hote dikhenge</p>
      </div>
    )
  }

  const isMergePhase = MERGE_PHASES.has(phase) && mergeCtx
  const isSplitPhase = phase === 'split'

  return (
    <div className={`sort-tree-view${isMergePhase ? ' merge-mode' : ''}`}>
      {phase && (
        <div className={`sort-tree-phase phase-${phase}`}>
          {phase.replace(/-/g, ' ').toUpperCase()}
        </div>
      )}

      <CallStack tree={tree} activeId={activeId} />

      {isMergePhase ? (
        <MergePanel ctx={mergeCtx} message={message} />
      ) : isSplitPhase ? (
        <SplitView tree={tree} activeId={activeId} message={message} />
      ) : (
        <>
          <div className="sort-tree-scroll compact-tree">
            <CompactTreeNode node={tree} activeId={activeId} />
          </div>
          {message && <p className="sort-tree-message">{message}</p>}
        </>
      )}
    </div>
  )
}
