# Computer Architecture Revision

An educational React-based web application designed to help International University students visualize and understand CPU architecture, MIPS instruction execution, and pipelining concepts. 

Built with an interactive SVG-based datapath, drag-and-drop pipeline grids, and dynamic worksheets, this tool brings static computer architecture concepts to life.

## Website is hosting on: 

https://iuca-revision.netlify.app/

## Key Features

* **Interactive CPU Datapath (SVG):** Clickable components and wires that highlight data flow based on specific MIPS instructions (`lw`, `sw`, `add`, `beq`, etc.).
* **Cycle-by-Cycle Execution:** Step through instruction executions phase-by-phase with localized data popups.
* **Pipeline Drag-and-Drop (Chapter 4):** A highly interactive grid using `@dnd-kit` to visualize pipeline stages, stalls, and forwarding paths.
* **Interactive Worksheets & Verification (Chapters 1-3):** Fill-in-the-blank exercises for CPU performance math, memory mapping, and hazard detection. Includes a real-time `✅ / ❌` verification grading system.
* **Smart UI/UX:** * Responsive layout with a sliding hamburger navigation menu.
  * Beautiful Light/Dark mode toggling driven by Zustand.
  * Dedicated bug-reporting user workflow.

## Tech Stack

* **Core Framework:** React 18 + Vite (for lightning-fast HMR and building)
* **Styling:** Tailwind CSS (fully configured for dynamic theme toggling)
* **State Management:** Zustand (lightweight global state handling)
* **Drag and Drop:** `@dnd-kit/core` (for the complex pipeline grid interactions)
* **Icons:** Custom SVG native icons (scaling cleanly with `currentColor`)

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/Tn-H4/Computer-Architecture-Revision-IU.git
   cd Computer-Architecture-Revision-IU

2. **Install dependencies:**
  ```
  npm install --legacy-peer-deps
  ```
Note: Use --legacy-peer-deps if you encounter React 18/19 version conflicts with Tailwind/dnd-kit.

3. **Start the development server:**
  ```
  npm run dev
  ```

4. **View the app:**

Open your browser and navigate to http://localhost:5173

## Project Structure

```text
src/
├── config/chapters.js          ← single source of truth for nav labels
├── utils/
│   ├── worksheetHelpers.js     ← pick, checkAnswer, checkHexValue
│   ├── chapter1Engine.js … chapter5Engine.js
│   ├── ieee754.js
│   ├── pipelineHazardEngine.js
│   └── instructionAnswers.js   ← shared answer keys (no duplication)
├── components/
│   ├── shared/                 ← Icons, WorksheetIcons, MathFraction, theme
│   ├── layout/                 ← LandingPage, NavigationMenu, BugReportModal
│   ├── chapters/
│   │   ├── chapter1/Chapter1.jsx
│   │   ├── chapter2/           ← Chapter2, RefTableModal, ColoredFields
│   │   ├── chapter3/Chapter3.jsx
│   │   └── chapter5/Chapter5.jsx
│   ├── datapath/               ← Ch 4.1: DatapathLayout, DiagramCanvas, etc.
│   └── pipeline/               ← Ch 4.2: PipelinePage, PipelineGrid, HazardSidebar
└── App.jsx                     ← clean chapter router