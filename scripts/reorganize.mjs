import fs from 'fs';
import path from 'path';

const root = process.cwd();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(filePath, content);
}

function stripChapterHeader(content, engineImport, extraImports = '') {
  // Remove icons through engine section (before MAIN COMPONENT)
  const mainIdx = content.indexOf('// --- MAIN COMPONENT ---');
  if (mainIdx === -1) return content;
  const afterMain = content.slice(mainIdx);
  const imports = `import React, { useState } from 'react';
import { useDiagramStore } from '../../../store/diagramStore';
${extraImports}
import { generateVariables } from '${engineImport}';
import { KeyIcon, CheckIcon, CrossIcon, DiceIcon } from '../../shared/WorksheetIcons';
import MathFraction from '../../shared/MathFraction';
import { getWorksheetTheme } from '../../shared/worksheetTheme';
import { checkAnswer } from '../../../utils/worksheetHelpers.js';

`;
  return imports + afterMain.replace('const Chapter', 'export default function Chapter');
}

// Create directories
const dirs = [
  'src/components/layout',
  'src/components/shared',
  'src/components/chapters/chapter1',
  'src/components/chapters/chapter2',
  'src/components/chapters/chapter3',
  'src/components/chapters/chapter5',
  'src/components/datapath',
  'src/components/pipeline',
];
dirs.forEach((d) => ensureDir(path.join(root, d)));

// Move layout components
copyFile('src/components/LandingPage.jsx', 'src/components/layout/LandingPage.jsx');
copyFile('src/components/NavigationMenu.jsx', 'src/components/layout/NavigationMenu.jsx');
copyFile('src/components/BugReportModal.jsx', 'src/components/layout/BugReportModal.jsx');
copyFile('src/components/Icons.jsx', 'src/components/shared/Icons.jsx');

// Move datapath
copyFile('src/components/DiagramCanvas.jsx', 'src/components/datapath/DiagramCanvas.jsx');
copyFile('src/components/InstructionPanel.jsx', 'src/components/datapath/InstructionPanel.jsx');
copyFile('src/components/Sidebar.jsx', 'src/components/datapath/Sidebar.jsx');

// Move pipeline
copyFile('src/components/Chapter4Page.jsx', 'src/components/pipeline/PipelinePage.jsx');
copyFile('src/components/Chapter4_2.jsx', 'src/components/pipeline/PipelineGrid.jsx');
copyFile('src/components/HazardSidebar.jsx', 'src/components/pipeline/HazardSidebar.jsx');

// Process chapters
const ch1Raw = fs.readFileSync('src/components/Chapter1.jsx', 'utf8');
const ch1Extra = '';
fs.writeFileSync(
  'src/components/chapters/chapter1/Chapter1.jsx',
  stripChapterHeader(ch1Raw, '../../../utils/chapter1Engine.js', ch1Extra)
    .replace('export default function Chapter1 = () =>', 'export default function Chapter1()')
    .replace(/\nexport default Chapter1;\n?$/, '\n')
);

const ch3Raw = fs.readFileSync('src/components/Chapter3.jsx', 'utf8');
const ch3Extra = `import { formatFraction, formatExponent, formatPowers, superscript } from '../../../utils/ieee754.js';\n`;
fs.writeFileSync(
  'src/components/chapters/chapter3/Chapter3.jsx',
  stripChapterHeader(ch3Raw, '../../../utils/ieee754.js', ch3Extra)
    .replace('export default function Chapter3 = () =>', 'export default function Chapter3()')
    .replace(/\nexport default Chapter3;\n?$/, '\n')
);

const ch5Raw = fs.readFileSync('src/components/Chapter5.jsx', 'utf8');
fs.writeFileSync(
  'src/components/chapters/chapter5/Chapter5.jsx',
  stripChapterHeader(ch5Raw, '../../../utils/chapter5Engine.js')
    .replace('export default function Chapter5 = () =>', 'export default function Chapter5()')
    .replace(/\nexport default Chapter5;\n?$/, '\n')
);

// Chapter2 - more complex, extract subcomponents
const ch2Raw = fs.readFileSync('src/components/Chapter2.jsx', 'utf8');
const refStart = ch2Raw.indexOf('const RefTableModal');
const refEnd = ch2Raw.indexOf('// --- RANDOMIZATION & FORMATTING HELPERS ---');
const refModal = ch2Raw.slice(refStart, refEnd)
  .replace('const RefTableModal', 'export default function RefTableModal');
fs.writeFileSync('src/components/chapters/chapter2/RefTableModal.jsx', `import React from 'react';\n\n${refModal}`);

const coloredStart = ch2Raw.indexOf('const getFieldColors');
const coloredEnd = ch2Raw.indexOf('// --- VARIABLE GENERATOR ---');
const coloredBlock = ch2Raw.slice(coloredStart, coloredEnd)
  .replace('const getFieldColors', 'export const getFieldColors')
  .replace('const ColoredInstruction', 'export const ColoredInstruction')
  .replace('const ColoredBinary', 'export const ColoredBinary');
fs.writeFileSync('src/components/chapters/chapter2/ColoredFields.jsx', `import React from 'react';\n\n${coloredBlock}`);

const ch2MainStart = ch2Raw.indexOf('// --- MAIN COMPONENT ---');
let ch2Main = ch2Raw.slice(ch2MainStart);
ch2Main = `import React, { useState } from 'react';
import { useDiagramStore } from '../../../store/diagramStore';
import { generateVariables } from '../../../utils/chapter2Engine.js';
import { KeyIcon, CheckIcon, CrossIcon, DiceIcon, BookIcon } from '../../shared/WorksheetIcons';
import { getWorksheetTheme } from '../../shared/worksheetTheme';
import { checkHexValue } from '../../../utils/worksheetHelpers.js';
import RefTableModal from './RefTableModal';
import { ColoredInstruction, ColoredBinary } from './ColoredFields';

${ch2Main.replace('const Chapter2 = () =>', 'export default function Chapter2()')}`;
ch2Main = ch2Main.replace(/\nexport default Chapter2;\n?$/, '\n');
fs.writeFileSync('src/components/chapters/chapter2/Chapter2.jsx', ch2Main);

// Fix import paths in moved files
const pathFixes = [
  ['src/components/layout/LandingPage.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
  ]],
  ['src/components/layout/NavigationMenu.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
  ]],
  ['src/components/layout/BugReportModal.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
  ]],
  ['src/components/datapath/DiagramCanvas.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
    ["from './Icons'", "from '../shared/Icons'"],
  ]],
  ['src/components/datapath/InstructionPanel.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
    ["from './Icons'", "from '../shared/Icons'"],
  ]],
  ['src/components/datapath/Sidebar.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
  ]],
  ['src/components/pipeline/PipelinePage.jsx', [
    ["import Chapter4_2 from './Chapter4_2';", "import PipelineGrid from './PipelineGrid';"],
    ['const Chapter4Page = () => {', 'export default function PipelinePage() {'],
    ['export default Chapter4Page;', ''],
    ['<Chapter4_2 ', '<PipelineGrid '],
  ]],
  ['src/components/pipeline/PipelineGrid.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
    ["from './Icons'", "from '../shared/Icons'"],
  ]],
  ['src/components/pipeline/HazardSidebar.jsx', [
    ["from '../store/diagramStore'", "from '../../store/diagramStore'"],
  ]],
];

for (const [file, reps] of pathFixes) {
  if (fs.existsSync(file)) replaceInFile(file, reps);
}

// LandingPage uses shared chapter config
replaceInFile('src/components/layout/LandingPage.jsx', [
  [`import React from 'react';`, `import React from 'react';\nimport { CHAPTERS } from '../../config/chapters.js';`],
  [`  const chapters = [
      { id: 1, title: "Chapter 1: CPU Performance", desc: "Execution time, CPI, and performance metrics." },
      { id: 2, title: "Chapter 2: MIPS Instructions", desc: "Registers, memory maps, and machine code." },
      { id: 3, title: "Chapter 3: IEEE-754 Floating Point", desc: "Binary representation of fractional numbers." },
      { id: 4.1, title: "Chapter 4.1: CPU Data Path", desc: "Tracing the single-cycle processor datapath." },
      { id: 4.2, title: "Chapter 4.2: Pipeline", desc: "Stalls, forwarding, and data hazards." },
      { id: 5, title: "Chapter 5: Memory Hierarchy", desc: "Caching, RAM, and memory optimization." }
    ];`, `  const chapters = CHAPTERS.map(({ id, title, desc }) => ({ id, title, desc }));`],
]);

// Update NavigationMenu to use CHAPTERS config
replaceInFile('src/components/layout/NavigationMenu.jsx', [
  [`          {[
            { id: 1, title: 'Chapter 1', subtitle: 'CPU Performance' },
            { id: 2, title: 'Chapter 2', subtitle: 'MIPS Instructions' },
            { id: 3, title: 'Chapter 3', subtitle: 'Pipeline Hazards' },
            { id: 4.1, title: 'Chapter 4.1', subtitle: 'CPU Datapath Diagram' },
            { id: 4.2, title: 'Chapter 4.2', subtitle: 'Pipeline Drag & Drop' },
            { id: 5, title: 'Chapter 5', subtitle: 'Memory Hierarchy' }
          ].map((chapter) => (`,
   `          {CHAPTERS.map((chapter) => (`],
  [`import React from 'react';`, `import React from 'react';\nimport { CHAPTERS } from '../../config/chapters.js';`],
  [`              {chapter.title}`, `              <span>{chapter.shortTitle}</span>\n              <span className="block text-xs opacity-70">{chapter.subtitle}</span>`],
]);

// Strip hazard engine from HazardSidebar and import from utils
replaceInFile('src/components/pipeline/HazardSidebar.jsx', [
  [/\/\/ --- MATH LOGIC ENGINE[\s\S]*?\n\};\n\n/, ''],
]);
replaceInFile('src/components/pipeline/HazardSidebar.jsx', [
  [`import { useDiagramStore } from '../../store/diagramStore';`,
   `import { useDiagramStore } from '../../store/diagramStore';\nimport { generateMipsProblem } from '../../utils/pipelineHazardEngine.js';`],
]);

// Update Sidebar to use shared INSTRUCTION_ANSWERS
replaceInFile('src/components/datapath/Sidebar.jsx', [
  [`import React`, `import React`],
]);
replaceInFile('src/components/datapath/Sidebar.jsx', [
  [`import { useDiagramStore }`, `import { INSTRUCTION_ANSWERS } from '../../utils/instructionAnswers.js';\nimport { useDiagramStore }`],
]);
replaceInFile('src/components/datapath/Sidebar.jsx', [
  [/  const INSTRUCTION_ANSWERS = \{[\s\S]*?\n  \};\n\n  const instructionDetails/, '  const instructionDetails'],
]);

console.log('Reorganization complete');
