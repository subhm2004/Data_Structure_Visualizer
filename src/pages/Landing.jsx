import { Link } from 'react-router-dom'
import LandingScene from '../components/landing/LandingScene'

const STATS = [
  { value: '18', label: 'Visualizers' },
  { value: '9', label: 'Sort Algos' },
  { value: 'O(1)', label: '2D Queries' },
  { value: '100%', label: 'Frontend' },
]

const FEATURED = [
  { to: '/sorting', icon: '📊', title: 'Sorting', desc: 'Bars, numbers & merge tree', color: '#6366f1' },
  { to: '/graph', icon: '🕸️', title: 'Graphs', desc: 'DFS, BFS & Dijkstra', color: '#06b6d4' },
  { to: '/segment-tree', icon: '🧱', title: 'Segment Tree', desc: 'Range queries O(log n)', color: '#d946ef' },
  { to: '/heap', icon: '🏔️', title: 'Heap', desc: 'Min/Max heap operations', color: '#10b981' },
]

const CARDS = [
  { to: '/sorting', icon: '📊', title: 'Sorting Visualizer', desc: '9 algorithms with bars & animated number swap mode.', tag: '9 Algorithms', color: 'rgba(99,102,241,0.15)' },
  { to: '/array', icon: '🔢', title: 'Array Visualizer', desc: 'Linear search, binary search, insert & delete.', tag: '4 Operations', color: 'rgba(6,182,212,0.15)' },
  { to: '/binary-tree', icon: '🌳', title: 'Binary Tree', desc: 'BST insert/delete and 4 tree traversals.', tag: '4 Traversals', color: 'rgba(16,185,129,0.15)' },
  { to: '/avl-tree', icon: '⚖️', title: 'AVL Tree', desc: 'Self-balancing tree with LL, RR, LR, RL rotations.', tag: 'Rotations', color: 'rgba(234,179,8,0.15)' },
  { to: '/linked-list', icon: '🔗', title: 'Linked List', desc: 'Insert, delete, search and reverse.', tag: '4 Operations', color: 'rgba(236,72,153,0.15)' },
  { to: '/doubly-linked-list', icon: '⇄', title: 'Doubly Linked List', desc: 'Prev & next pointer animations.', tag: 'Bi-directional', color: 'rgba(244,114,182,0.15)' },
  { to: '/stack', icon: '📚', title: 'Stack', desc: 'LIFO push/pop with animated top pointer.', tag: 'LIFO', color: 'rgba(245,158,11,0.15)' },
  { to: '/queue', icon: '🚶', title: 'Queue', desc: 'FIFO enqueue/dequeue visualization.', tag: 'FIFO', color: 'rgba(139,92,246,0.15)' },
  { to: '/circular-queue', icon: '🔄', title: 'Circular Queue', desc: 'Ring buffer with wrap-around front & rear.', tag: 'Ring Buffer', color: 'rgba(168,85,247,0.15)' },
  { to: '/heap', icon: '🏔️', title: 'Heap Visualizer', desc: 'Min/max heap insert, extract & heapify.', tag: 'Min + Max', color: 'rgba(20,184,166,0.15)' },
  { to: '/hashmap', icon: '🗂️', title: 'Hash Map', desc: 'Chaining & linear probing collision handling.', tag: 'Collisions', color: 'rgba(249,115,22,0.15)' },
  { to: '/trie', icon: '🔤', title: 'Trie', desc: 'Insert, search, delete words character-by-character.', tag: 'Prefix Tree', color: 'rgba(59,130,246,0.15)' },
  { to: '/graph', icon: '🕸️', title: 'Graph (DFS/BFS)', desc: 'Depth-first & breadth-first with stack/queue.', tag: 'DFS + BFS', color: 'rgba(99,102,241,0.15)' },
  { to: '/dijkstra', icon: '📐', title: 'Shortest Path', desc: 'Dijkstra & BFS on weighted graphs.', tag: 'Weighted', color: 'rgba(6,182,212,0.15)' },
  { to: '/recursion-tree', icon: '🌲', title: 'Recursion Tree', desc: 'Merge & Quick sort call stack visualization.', tag: 'Call Stack', color: 'rgba(34,197,94,0.15)' },
  { to: '/fenwick-tree', icon: '📈', title: 'Fenwick Tree (BIT)', desc: 'Point update & prefix/range sum with LSB animation.', tag: 'O(log n)', color: 'rgba(14,165,233,0.15)' },
  { to: '/segment-tree', icon: '🧱', title: 'Segment Tree', desc: 'Range sum query & point update on intervals.', tag: 'Range Query', color: 'rgba(217,70,239,0.15)' },
  { to: '/prefix-sum-2d', icon: '📋', title: '2D Prefix Sum', desc: 'Submatrix sum in O(1) with inclusion-exclusion.', tag: '2D Matrix', color: 'rgba(251,146,60,0.15)' },
]

export default function Landing() {
  return (
    <div className="landing-page">
      <LandingScene />

      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <span className="landing-nav-logo">⚡</span>
          <span>DS Visualizer</span>
        </div>
        <div className="landing-nav-links">
          <a href="#featured">Featured</a>
          <a href="#all">All Tools</a>
          <Link to="/sorting" className="landing-nav-cta">Start Learning →</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-badge">Interactive · Animated · Free</div>
        <h1 className="landing-hero-title">
          Master Data Structures
          <span className="landing-gradient-text"> Visually</span>
        </h1>
        <p className="landing-hero-sub">
          18 live visualizers with step-by-step animations — sorting, trees, graphs,
          heaps, Fenwick &amp; segment trees. No backend. Just pure learning.
        </p>
        <div className="landing-hero-actions">
          <Link to="/sorting" className="landing-btn landing-btn-primary">
            Explore Visualizers
          </Link>
          <a href="#all" className="landing-btn landing-btn-ghost">
            Browse All
          </a>
        </div>

        <div className="landing-stats">
          {STATS.map(s => (
            <div key={s.label} className="landing-stat">
              <span className="landing-stat-value">{s.value}</span>
              <span className="landing-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="featured" className="landing-section">
        <div className="landing-section-head">
          <h2>Featured</h2>
          <p>Most popular visualizers to get started</p>
        </div>
        <div className="landing-featured-grid">
          {FEATURED.map(f => (
            <Link key={f.to} to={f.to} className="landing-featured-card">
              <div className="landing-featured-glow" style={{ background: f.color }} />
              <span className="landing-featured-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="landing-featured-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="all" className="landing-section landing-section-cards">
        <div className="landing-section-head">
          <h2>All Visualizers</h2>
          <p>Pick any topic and watch algorithms come alive</p>
        </div>
        <div className="landing-cards-grid">
          {CARDS.map(c => (
            <Link key={c.to} to={c.to} className="viz-card landing-viz-card">
              <div className="viz-card-icon" style={{ background: c.color }}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <span className="tag">{c.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p>Built for learners · React + Three.js · Open source spirit</p>
        <Link to="/sorting" className="landing-footer-link">Jump into Sorting Visualizer →</Link>
      </footer>
    </div>
  )
}
