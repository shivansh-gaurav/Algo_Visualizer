# AlgoVisualizer

## Overview
**AlgoVisualizer** is an interactive, responsive web application built with **React** and **Vite** that visualizes complex sorting and pathfinding algorithms in real-time. It allows users to dynamically control data sizes, animation speeds, and algorithmic parameters, making abstract data structures visually intuitive.

## Why I Built It
As a Competitive Programmer, I often found myself mentally tracing through complex DP states and array manipulations. I built this tool to help visual learners fundamentally understand time complexities (Big-O) and array mutations. Furthermore, I wanted to challenge my Frontend Engineering skills by managing complex, high-frequency React state synchronizations alongside smooth CSS/SVG animations.

## Features
- **Real-Time Visualization**: Watch arrays dynamically mutate and swap as sorting algorithms (Merge Sort, Quick Sort, Heap Sort) execute step-by-step.
- **Dynamic Control Panel**: Users can adjust the array size, randomize the data distribution, and control the animation speed via a responsive slider.
- **Algorithm Comparison**: Select different algorithms from a dropdown and instantly see how their structural approaches differ on the exact same dataset.
- **Smooth Animations**: Integrated **GSAP** and **Framer Motion** to ensure element swaps are mathematically interpolated rather than aggressively snapped, providing a premium feel.

## Tech Stack
- **Framework**: React.js (Hooks, Functional Components)
- **Build Tool**: Vite (for rapid HMR and optimized bundling)
- **Animation**: GSAP (GreenSock), Framer Motion
- **Deployment**: Vercel

## Architecture
- **State Management**: The application heavily relies on React Hooks (`useState`, `useEffect`, `useRef`). The core array data is decoupled from the animation timeline to prevent React from re-rendering the entire DOM on every single algorithmic swap.
- **Animation Queueing**: Since sorting algorithms execute in milliseconds but humans process animations in seconds, the algorithm generates an array of "animation sequence objects." The UI then iterates through this queue sequentially using `async/await` and timeouts.

## Technical Challenges
1. **React State vs. Animation Timing**: Initially, updating the React state for every single array swap caused massive frame drops because React tried to re-render 1,000 `<div>` bars simultaneously. **Solution**: I decoupled the logical array from the visual array. The algorithm runs entirely in the background, pushing DOM manipulation instructions to a queue, which is then smoothly parsed by GSAP/Framer Motion.
2. **Interrupting Algorithms**: If a user clicked "Generate New Array" while a sort was already running, the `setTimeout` callbacks from the previous sort would continue executing on the new data, corrupting the UI. **Solution**: I implemented a robust cleanup system using standard `AbortController` patterns and React `useRef` to immediately halt execution queues on unmount/reset.

## Lessons Learned
- **Virtual DOM Limitations**: React is incredibly fast, but forcing it to render 100+ state changes per second is fundamentally the wrong approach. Bypassing the Virtual DOM for heavy animations (using GSAP direct DOM targeting) is sometimes necessary.
- **Clean UI / UX**: Building the logic was only 50% of the battle. Making the sliders responsive and ensuring the colors (Red for comparing, Green for sorted) were accessible taught me a lot about user experience.

## Installation
1. Clone the repository: `git clone https://github.com/shivansh-gaurav/algo-visualizer.git`
2. Navigate to the directory: `cd algo-visualizer`
3. Install dependencies: `npm install`
4. Start the Vite dev server: `npm run dev`

## License
MIT License
