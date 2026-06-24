import fs from 'fs';

const ch2 = fs.readFileSync('src/components/Chapter2.jsx', 'utf8');
const mid = ch2.indexOf('// --- EXTERNAL COMPONENTS FOR COLOR HIGHLIGHTING ---');
const end = ch2.indexOf('// --- MAIN COMPONENT ---');

const helpers = ch2
  .slice(ch2.indexOf('// --- RANDOMIZATION & FORMATTING HELPERS ---'), mid)
  .replace('// --- RANDOMIZATION & FORMATTING HELPERS ---\n', '')
  .replace(/const pick = .*?\n/, '');

const generator = ch2
  .slice(ch2.indexOf('// --- VARIABLE GENERATOR ---'), end)
  .replace('// --- VARIABLE GENERATOR ---\n', '')
  .replace('const generateVariables = () =>', 'export function generateVariables()');

let out = `import { pick } from './worksheetHelpers.js';\n\n`;
out += helpers
  .replace(/const toHex/g, 'export const toHex')
  .replace(/const signExt16/g, 'export const signExt16')
  .replace(/const signExt8/g, 'export const signExt8')
  .replace(/const binBlock/g, 'export const binBlock')
  .replace(/const formatBin/g, 'export const formatBin')
  .replace(/const REGISTERS/g, 'export const REGISTERS');
out += generator;

fs.writeFileSync('src/utils/chapter2Engine.js', out);
console.log('chapter2Engine fixed');
