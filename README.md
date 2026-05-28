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
cpu-visualizer/
├── package.json
├── README.md
├── index.html                 # Vite entry point
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite configuration
├── src/
│   ├── main.jsx               # React DOM rendering entry
│   ├── index.css              # Tailwind CSS imports
│   ├── App.jsx                # Main wrapper, handles global layout and routing between chapters
│   ├── store/
│   │   └── diagramStore.js    # Zustand store (theme, active chapter, user answers, verification)
│   └── components/
│       ├── LandingPage.jsx         # Welcoming page with chapter selection
│       ├── NavigationMenu.jsx      # Sliding hamburger menu for chapter selection
│       ├── Icons.jsx               # Reusable SVG components (Sun, Moon, Key, Trash, etc.)
│       ├── BugReportModal.jsx      # Hidden popup for the Google Form bug reporter
│       ├── DiagramCanvas.jsx       # The interactive SVG datapath and MiniPopup (Main Diagram)
│       ├── InstructionPanel.jsx    # Controls for highlighting instructions and the verify buttons
│       ├── Sidebar.jsx             # Right-side panel for worksheets, binary breakdown, and hints
│       ├── Chapter1.jsx            # CPU Performance math formulas and calculations
│       ├── Chapter2.jsx            # MIPS memory mapping and machine code translation
│       ├── Chapter3.jsx            # Pipeline hazard logic checking (Static UI)
│       ├── Chapter4_2.jsx          # Drag-and-drop @dnd-kit pipeline grid visualizer
│       └── HazardSidebar.jsx       # Right-side panel for hazard question and explanation