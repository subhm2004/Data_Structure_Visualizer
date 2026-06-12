import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { section: 'Home', items: [
    { to: '/', icon: '🏠', label: 'Dashboard' },
  ]},
  { section: 'Core', items: [
    { to: '/sorting', icon: '📊', label: 'Sorting' },
    { to: '/array', icon: '🔢', label: 'Array' },
    { to: '/binary-tree', icon: '🌳', label: 'Binary Tree' },
    { to: '/avl-tree', icon: '⚖️', label: 'AVL Tree' },
    { to: '/linked-list', icon: '🔗', label: 'Linked List' },
    { to: '/doubly-linked-list', icon: '⇄', label: 'Doubly Linked List' },
  ]},
  { section: 'Structures', items: [
    { to: '/stack', icon: '📚', label: 'Stack' },
    { to: '/queue', icon: '🚶', label: 'Queue' },
    { to: '/circular-queue', icon: '🔄', label: 'Circular Queue' },
    { to: '/heap', icon: '🏔️', label: 'Heap' },
    { to: '/hashmap', icon: '🗂️', label: 'Hash Map' },
    { to: '/trie', icon: '🔤', label: 'Trie' },
  ]},
  { section: 'Advanced', items: [
    { to: '/fenwick-tree', icon: '📈', label: 'Fenwick Tree' },
    { to: '/segment-tree', icon: '🧱', label: 'Segment Tree' },
    { to: '/prefix-sum-2d', icon: '📋', label: '2D Prefix Sum' },
  ]},
  { section: 'Graphs & Advanced', items: [
    { to: '/graph', icon: '🕸️', label: 'Graph (DFS/BFS)' },
    { to: '/dijkstra', icon: '📐', label: 'Shortest Path' },
    { to: '/recursion-tree', icon: '🌲', label: 'Recursion Tree' },
  ]},
]

export default function Layout() {
  return (
    <>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">⚡</div>
            <div>
              <h1>DS Visualizer</h1>
              <p>Learn visually</p>
            </div>
          </div>
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div className="nav-section">{section}</div>
              {items.map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="icon">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  )
}
