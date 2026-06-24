/** Single source of truth for chapter navigation metadata */
export const CHAPTERS = [
  {
    id: 1,
    title: 'Chapter 1: CPU Performance',
    shortTitle: 'Chapter 1',
    subtitle: 'CPU Performance',
    desc: 'Execution time, CPI, and performance metrics.',
  },
  {
    id: 2,
    title: 'Chapter 2: MIPS Instructions',
    shortTitle: 'Chapter 2',
    subtitle: 'MIPS Instructions',
    desc: 'Registers, memory maps, and machine code.',
  },
  {
    id: 3,
    title: 'Chapter 3: IEEE-754 Floating Point',
    shortTitle: 'Chapter 3',
    subtitle: 'IEEE-754 Floating Point',
    desc: 'Binary representation of fractional numbers.',
  },
  {
    id: 4.1,
    title: 'Chapter 4.1: CPU Data Path',
    shortTitle: 'Chapter 4.1',
    subtitle: 'CPU Datapath Diagram',
    desc: 'Tracing the single-cycle processor datapath.',
  },
  {
    id: 4.2,
    title: 'Chapter 4.2: Pipeline',
    shortTitle: 'Chapter 4.2',
    subtitle: 'Pipeline Drag & Drop',
    desc: 'Stalls, forwarding, and data hazards.',
  },
  {
    id: 5,
    title: 'Chapter 5: Memory Hierarchy',
    shortTitle: 'Chapter 5',
    subtitle: 'Memory Hierarchy',
    desc: 'Caching, RAM, and memory optimization.',
  },
];

/** Chapters that use the shared App header (hamburger, theme, bug report) */
export const CHAPTERS_WITH_HEADER = [1, 2, 3, 5];

/** Chapters with their own full-screen layout (no shared header) */
export const FULLSCREEN_CHAPTERS = [0, 4.1, 4.2];
