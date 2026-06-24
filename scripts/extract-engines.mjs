import fs from 'fs';

const ch1 = fs.readFileSync('src/components/Chapter1.jsx', 'utf8');
const m1 = ch1.match(/const generateVariables = \(\) => \{[\s\S]*?\n\};\n\n\/\/ --- MAIN/);
if (m1) {
  const body = m1[0]
    .replace('const generateVariables = () => {', 'export function generateVariables() {')
    .replace(/\n\/\/ --- MAIN$/, '');
  fs.writeFileSync('src/utils/chapter1Engine.js', `import { pick } from './worksheetHelpers.js';\n\n${body}`);
}

const ch5 = fs.readFileSync('src/components/Chapter5.jsx', 'utf8');
const m5 = ch5.match(/const generateVariables = \(\) => \{[\s\S]*?\n\};\n\n\/\/ --- MAIN/);
if (m5) {
  const body = m5[0]
    .replace('const generateVariables = () => {', 'export function generateVariables() {')
    .replace(/\n\/\/ --- MAIN$/, '');
  fs.writeFileSync('src/utils/chapter5Engine.js', `import { pick } from './worksheetHelpers.js';\n\n${body}`);
}

const ch3 = fs.readFileSync('src/components/Chapter3.jsx', 'utf8');
const start = ch3.indexOf('const formatFraction');
const end = ch3.indexOf('// --- MAIN COMPONENT ---');
let ieeeBlock = ch3.slice(start, end);
ieeeBlock = ieeeBlock.replace(/const pick = .*?\n\n/, '');
ieeeBlock = ieeeBlock.replace(/const (formatFraction|formatExponent|parseIEEE754|toIEEE754|IEEE754_POOL|formatPowers|superscript)/g, 'export const $1');
ieeeBlock = ieeeBlock.replace('const generateVariables = () =>', 'export function generateVariables()');
fs.writeFileSync('src/utils/ieee754.js', `import { pick } from './worksheetHelpers.js';\n\n${ieeeBlock}`);

const ch2 = fs.readFileSync('src/components/Chapter2.jsx', 'utf8');
const ch2Start = ch2.indexOf('// --- RANDOMIZATION & FORMATTING HELPERS ---');
const ch2End = ch2.indexOf('// --- MAIN COMPONENT ---');
let ch2Block = ch2.slice(ch2Start, ch2End).replace('// --- RANDOMIZATION & FORMATTING HELPERS ---\n', '');
ch2Block = ch2Block.replace(/const pick = .*?\n/, '');
ch2Block = ch2Block.replace('const toHex', 'export const toHex');
ch2Block = ch2Block.replace('const signExt16', 'export const signExt16');
ch2Block = ch2Block.replace('const signExt8', 'export const signExt8');
ch2Block = ch2Block.replace('const binBlock', 'export const binBlock');
ch2Block = ch2Block.replace('const formatBin', 'export const formatBin');
ch2Block = ch2Block.replace('const REGISTERS', 'export const REGISTERS');
ch2Block = ch2Block.replace('const generateVariables = () =>', 'export function generateVariables()');
fs.writeFileSync('src/utils/chapter2Engine.js', `import { pick } from './worksheetHelpers.js';\n\n${ch2Block}`);

const hs = fs.readFileSync('src/components/HazardSidebar.jsx', 'utf8');
const hsStart = hs.indexOf('const generateMipsProblem');
const hsEnd = hs.indexOf('const getMiniGridStyle');
let hsBlock = hs.slice(hsStart, hsEnd);
hsBlock = hsBlock.replace('const generateMipsProblem = () =>', 'export function generateMipsProblem()');
fs.writeFileSync('src/utils/pipelineHazardEngine.js', hsBlock);

const ds = fs.readFileSync('src/store/diagramStore.js', 'utf8');
const iaStart = ds.indexOf('const INSTRUCTION_ANSWERS');
const iaEnd = ds.indexOf('const INSTRUCTION_SEQUENCES');
const iaBlock = ds.slice(iaStart, iaEnd).replace('const INSTRUCTION_ANSWERS', 'export const INSTRUCTION_ANSWERS');
fs.writeFileSync('src/utils/instructionAnswers.js', iaBlock);

console.log('Engine files created');
