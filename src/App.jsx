import { useState } from "react"
import Hero from "./components/Hero"
import FilterBar from "./components/FilterBar"
import BounceCards from "./components/BounceCards"
import BubbleSortVisualizer from "./Bubble Sort/BubbleSortVisualizer"
import TowerOfHanoiVisualizer from "./Tower of Hanoi/TowerOfHanoiVisualizer"
import BinarySearchVisualizer from "./Binary Search/BinarySearchVisualizer"
import HeapSortVisualizer from "./Heap Sort/HeapSortVisualizer"
import FibonacciVisualizer from "./fib/FibonacciVisualizer"
import InsertionSortVisualizer from "./insertion_sort/InsertionSortVisualizer"
import SelectionSortVisualizer from "./selection_sort/SelectionSortVisualizer"
import FactorialVisualizer from "./factorial/FactorialVisualizer"
import { algorithms, filters } from "./data/algorithms"

function App() {
  const [active, setActive] = useState("all")
  const [selectedAlgo, setSelectedAlgo] = useState(null)

  const filtered =
    active === "all"
      ? algorithms
      : algorithms.filter((a) => a.tag === active)

  if (selectedAlgo?.id === "bubble") {
    return (
      <BubbleSortVisualizer
        algo={selectedAlgo}
        onBack={() => setSelectedAlgo(null)}
      />
    )
  }

  if (selectedAlgo?.id === "towerofhanoi") {
    return (
      <TowerOfHanoiVisualizer
        algo={selectedAlgo}
        onBack={() => setSelectedAlgo(null)}
      />
    )
  }

  if (selectedAlgo?.id === "binarysearch") {
    return (
      <BinarySearchVisualizer
        algo={selectedAlgo}
        onBack={() => setSelectedAlgo(null)}
      />
    )
  }

  if (selectedAlgo?.id === "heap") {
    return (
      <HeapSortVisualizer
        algo={selectedAlgo}
        onBack={() => setSelectedAlgo(null)}
      />
    )
  }
  if (selectedAlgo?.id === "fibonacci") {
    return (
      <FibonacciVisualizer
        algo={selectedAlgo}
        onBack={() => setSelectedAlgo(null)}
      />
  )
}
if (selectedAlgo?.id === "selection") {
  return (
    <SelectionSortVisualizer
      algo={selectedAlgo}
      onBack={() => setSelectedAlgo(null)}
    />
  )
}
if (selectedAlgo?.id === "insertion") {
  return (
    <InsertionSortVisualizer
      algo={selectedAlgo}
      onBack={() => setSelectedAlgo(null)}
    />
  )
}
if (selectedAlgo?.id === "factorial") {
  return (
    <FactorialVisualizer
      algo={selectedAlgo}
      onBack={() => setSelectedAlgo(null)}
    />
  )
}

  return (
    <div className="page">
      <Hero />

      <div className="section-header">
        <p className="section-label">Explore</p>
        <h2 className="section-title">Pick an algorithm</h2>
        <p className="section-sub">
          {filtered.length} algorithms — click any card to dive in
        </p>
      </div>

      <FilterBar
        filters={filters}
        active={active}
        onFilter={setActive}
      />

      <BounceCards
        items={filtered}
        enableHover
        onSelect={(algo) => {
          if (
            algo.id === "bubble" ||
            algo.id === "towerofhanoi" ||
            algo.id === "binarysearch" ||
            algo.id === "heap" ||
            algo.id === "fibonacci" ||
            algo.id === "selection" ||
            algo.id === "insertion" ||
            algo.id === "factorial"
          ) {
            setSelectedAlgo(algo)
          }
        }}
      />
    </div>
  )
}

export default App
