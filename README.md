<div align="center">

# ⚡ DS Visualizer

### Learn Data Structures & Algorithms — Visually

**18 interactive visualizers · Step-by-step animations · Pure frontend · No backend needed**

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

[Live Demo](#-live-demo) · [Features](#-features) · [All Visualizers](#-all-visualizers) · [Getting Started](#-getting-started) · [Deploy](#-deploy)

<br />

<img src="https://img.shields.io/badge/Visualizers-18-indigo?style=flat-square" />
<img src="https://img.shields.io/badge/Sort_Algorithms-9-blue?style=flat-square" />
<img src="https://img.shields.io/badge/100%25-Frontend-cyan?style=flat-square" />

</div>

---

## 📖 About

**DS Visualizer** is a modern, interactive web app that helps you **see** how data structures and algorithms work — not just read about them. Every operation is animated step-by-step: comparisons light up, nodes swap, trees split & merge, graphs traverse node-by-node.

Built from scratch with **React 19**, **Vite**, and **Three.js** — upgraded from the original vanilla JS sorting visualizer (preserved in `legacy/`).

> Perfect for students, interview prep, and anyone who learns better by watching algorithms in action.

---

## 🌐 Live Demo

> Deploy karke yahan apna link daal do 👇

```
https://your-app.vercel.app
```

**Quick deploy:** Push to GitHub → connect on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) → done.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎬 **Step-by-step animation** | Every compare, swap, insert & traverse — animated with speed control |
| 🎨 **Multiple view modes** | Sorting: bars, numbers (FLIP swap), merge/quick tree diagram |
| 🌳 **3D Landing Page** | Three.js hero — floating tree, sorting bars, particle field |
| ⚡ **Adjustable speed** | Ultra Slow → Ultra Fast on every visualizer |
| 📊 **Complexity info** | Time & space complexity shown live (sorting, heaps, etc.) |
| 🖥️ **Pure frontend** | No server, no database, no API keys — runs entirely in browser |
| 📱 **Responsive UI** | Dark theme, sidebar nav, clean dashboard |

---

## 🗂️ All Visualizers

### Core

| # | Visualizer | Route | What you can do |
|---|-----------|-------|-----------------|
| 1 | **Sorting** | `/sorting` | 9 algorithms — bars, animated numbers, merge/quick tree |
| 2 | **Array** | `/array` | Linear search, binary search, insert, delete |
| 3 | **Binary Tree** | `/binary-tree` | BST insert/delete, in/pre/post/level order traversals |
| 4 | **AVL Tree** | `/avl-tree` | Self-balancing BST with LL, RR, LR, RL rotations |
| 5 | **Linked List** | `/linked-list` | Search, insert, delete, reverse |
| 6 | **Doubly Linked List** | `/doubly-linked-list` | Bi-directional pointers, forward/backward traverse |

### Linear Structures

| # | Visualizer | Route | What you can do |
|---|-----------|-------|-----------------|
| 7 | **Stack** | `/stack` | Push, pop, peek — LIFO with top pointer animation |
| 8 | **Queue** | `/queue` | Enqueue, dequeue — FIFO visualization |
| 9 | **Circular Queue** | `/circular-queue` | Ring buffer with wrap-around front & rear |

### Non-Linear Structures

| # | Visualizer | Route | What you can do |
|---|-----------|-------|-----------------|
| 10 | **Heap** | `/heap` | Min/max heap — insert, extract, heapify |
| 11 | **Hash Map** | `/hashmap` | Chaining & linear probing collision handling |
| 12 | **Trie** | `/trie` | Insert, search, delete words character-by-character |

### Graphs

| # | Visualizer | Route | What you can do |
|---|-----------|-------|-----------------|
| 13 | **Graph (DFS/BFS)** | `/graph` | Build graph, run DFS & BFS with stack/queue trace |
| 14 | **Shortest Path** | `/dijkstra` | Dijkstra's algorithm on weighted graphs |
| 15 | **Recursion Tree** | `/recursion-tree` | Merge & quick sort call stack visualization |

### Advanced (Range Queries)

| # | Visualizer | Route | What you can do |
|---|-----------|-------|-----------------|
| 16 | **Fenwick Tree (BIT)** | `/fenwick-tree` | Point update, prefix sum, range sum — O(log n) |
| 17 | **Segment Tree** | `/segment-tree` | Range sum query & point update — O(log n) |
| 18 | **2D Prefix Sum** | `/prefix-sum-2d` | Submatrix sum in O(1) with inclusion-exclusion |

---

## 🔢 Sorting Algorithms

| Algorithm | Time (Avg) | Space | View Modes |
|-----------|-----------|-------|------------|
| Bubble Sort | O(n²) | O(1) | Bars · Numbers |
| Selection Sort | O(n²) | O(1) | Bars · Numbers |
| Insertion Sort | O(n²) | O(1) | Bars · Numbers |
| Merge Sort | O(n log n) | O(n) | Bars · Numbers · **Tree** |
| Quick Sort | O(n log n) | O(log n) | Bars · Numbers · **Tree** |
| Heap Sort | O(n log n) | O(1) | Bars · Numbers |
| Shell Sort | O(n^4/3) | O(1) | Bars · Numbers |
| Cocktail Sort | O(n²) | O(1) | Bars · Numbers |
| Counting Sort | O(n+k) | O(k) | Bars · Numbers |

---

## 🛠 Tech Stack

```
React 19          →  UI components & state
React Router 7    →  Multi-page navigation
Vite 6            →  Dev server & production build
Three.js          →  3D landing page scene
CSS (custom)      →  Dark theme, animations, responsive layout
```

---

## 📁 Project Structure

```
src/
├── algorithms/          # Core logic as JS generators
├── components/          # Layout, SpeedControl, LandingScene, etc.
├── hooks/               # useAnimationRunner
├── pages/               # 18 visualizer pages + Landing
└── index.css            # Global dark theme

legacy/                  # Original vanilla JS version
vercel.json              # Vercel deploy config
netlify.toml             # Netlify deploy config
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/subhm2004/Data_Structure_Visualizer.git
cd Data_Structure_Visualizer
npm install
npm run dev
```

Open **http://localhost:5173**

### Production Build

```bash
npm run build
npm run preview
```

---

## 🌍 Deploy

### Vercel (Recommended)

1. Push code to GitHub
2. [vercel.com](https://vercel.com) → Import Project
3. Build: `npm run build` · Output: `dist`
4. Deploy

### Netlify

Import repo on [netlify.com](https://netlify.com) — `netlify.toml` handles the rest.

---

## 👤 Author

**Shubham Malik**

- GitHub: [@subhm2004](https://github.com/subhm2004)
- Repo: [Data_Structure_Visualizer](https://github.com/subhm2004/Data_Structure_Visualizer)
- Email: subhu04012003@gmail.com

---

<div align="center">

**If this project helped you learn — ⭐ star the repo!**

Made with passion by **Shubham Malik**

</div>
