import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import SortingVisualizer from './pages/SortingVisualizer'
import ArrayVisualizer from './pages/ArrayVisualizer'
import BinaryTreeVisualizer from './pages/BinaryTreeVisualizer'
import StackVisualizer from './pages/StackVisualizer'
import QueueVisualizer from './pages/QueueVisualizer'
import LinkedListVisualizer from './pages/LinkedListVisualizer'
import GraphVisualizer from './pages/GraphVisualizer'
import HashMapVisualizer from './pages/HashMapVisualizer'
import HeapVisualizer from './pages/HeapVisualizer'
import DijkstraVisualizer from './pages/DijkstraVisualizer'
import RecursionTreeVisualizer from './pages/RecursionTreeVisualizer'
import TrieVisualizer from './pages/TrieVisualizer'
import DoublyLinkedListVisualizer from './pages/DoublyLinkedListVisualizer'
import CircularQueueVisualizer from './pages/CircularQueueVisualizer'
import AVLTreeVisualizer from './pages/AVLTreeVisualizer'
import PrefixSum2DVisualizer from './pages/PrefixSum2DVisualizer'
import FenwickTreeVisualizer from './pages/FenwickTreeVisualizer'
import SegmentTreeVisualizer from './pages/SegmentTreeVisualizer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="sorting" element={<SortingVisualizer />} />
        <Route path="array" element={<ArrayVisualizer />} />
        <Route path="binary-tree" element={<BinaryTreeVisualizer />} />
        <Route path="stack" element={<StackVisualizer />} />
        <Route path="queue" element={<QueueVisualizer />} />
        <Route path="linked-list" element={<LinkedListVisualizer />} />
        <Route path="graph" element={<GraphVisualizer />} />
        <Route path="hashmap" element={<HashMapVisualizer />} />
        <Route path="heap" element={<HeapVisualizer />} />
        <Route path="dijkstra" element={<DijkstraVisualizer />} />
        <Route path="recursion-tree" element={<RecursionTreeVisualizer />} />
        <Route path="trie" element={<TrieVisualizer />} />
        <Route path="doubly-linked-list" element={<DoublyLinkedListVisualizer />} />
        <Route path="circular-queue" element={<CircularQueueVisualizer />} />
        <Route path="avl-tree" element={<AVLTreeVisualizer />} />
        <Route path="fenwick-tree" element={<FenwickTreeVisualizer />} />
        <Route path="segment-tree" element={<SegmentTreeVisualizer />} />
        <Route path="prefix-sum-2d" element={<PrefixSum2DVisualizer />} />
      </Route>
    </Routes>
  )
}
