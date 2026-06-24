import { pick } from './worksheetHelpers.js';

export const formatFraction = (fracBits) => {
  const groups = [];
  for (let i = 0; i < 23; i += 4) {
    groups.push(fracBits.slice(i, i + 4));
  }
  return groups.join('_');
};

export const formatExponent = (expBits) => {
  return expBits.slice(0, 4) + '_' + expBits.slice(4);
};

export const parseIEEE754 = (hexStr) => {
  const bits = parseInt(hexStr, 16);
  const sign = (bits >>> 31) & 1;
  const expRaw = (bits >>> 23) & 0xFF;
  const fracBits = bits & 0x7FFFFF;
  const fracBinStr = fracBits.toString(2).padStart(23, '0');

  let fracVal = 0;
  for (let i = 0; i < 23; i++) {
    if (fracBinStr[i] === '1') fracVal += Math.pow(2, -(i + 1));
  }

  const fracPowers = [];
  for (let i = 0; i < 23; i++) {
    if (fracBinStr[i] === '1') fracPowers.push(-(i + 1));
  }

  const expVal = expRaw - 127;
  const decimalVal = Math.pow(-1, sign) * (1 + fracVal) * Math.pow(2, expVal);

  const expBinStr = expRaw.toString(2).padStart(8, '0');

  return {
    sign,
    expRaw,
    expVal,
    fracVal,
    fracPowers,
    fracBinStr,
    expBinStr,
    decimalVal,
    hexStr: '0x' + hexStr.toUpperCase(),
  };
};

export const toIEEE754 = (num) => {
  const sign = num < 0 ? 1 : 0;
  const absNum = Math.abs(num);

  const expVal = Math.floor(Math.log2(absNum));
  const expRaw = expVal + 127;

  const fracVal = absNum / Math.pow(2, expVal) - 1;

  let remaining = fracVal;
  let fracBinStr = '';
  for (let i = 0; i < 23; i++) {
    remaining *= 2;
    if (remaining >= 1) { fracBinStr += '1'; remaining -= 1; }
    else { fracBinStr += '0'; }
  }

  const fracBits = parseInt(fracBinStr, 2);
  const bits = (sign << 31) | (expRaw << 23) | fracBits;
  const hexStr = (bits >>> 0).toString(16).toUpperCase().padStart(8, '0');

  const fracPowers = [];
  for (let i = 0; i < 23; i++) {
    if (fracBinStr[i] === '1') fracPowers.push(-(i + 1));
  }

  return {
    sign,
    expRaw,
    expVal,
    fracVal,
    fracPowers,
    fracBinStr,
    expBinStr: expRaw.toString(2).padStart(8, '0'),
    hexStr: '0x' + hexStr,
    bits,
    fracBits,
  };
};

export const IEEE754_POOL = [
  { decimal: 12.75,    hex: '414C0000' },
  { decimal: 6.5,      hex: '40D00000' },
  { decimal: 0.75,     hex: '3F400000' },
  { decimal: 1.5,      hex: '3FC00000' },
  { decimal: 3.25,     hex: '40500000' },
  { decimal: 5.5,      hex: '40B00000' },
  { decimal: 11.25,    hex: '41340000' },
  { decimal: 7.125,    hex: '40E40000' },
  { decimal: 2.75,     hex: '40300000' },
  { decimal: 14.5,     hex: '41680000' },
  { decimal: 0.375,    hex: '3EC00000' },
  { decimal: 9.0,      hex: '41100000' },
  { decimal: 25.75,    hex: '41CE0000' },
  { decimal: 0.1875,   hex: '3E400000' },
  { decimal: 100.0,    hex: '42C80000' },
];

export function generateVariables() {
  const q1Entry = pick(IEEE754_POOL);
  const q1 = parseIEEE754(q1Entry.hex);

  let q2Entry;
  do { q2Entry = pick(IEEE754_POOL); } while (q2Entry.hex === q1Entry.hex);
  const q2 = toIEEE754(q2Entry.decimal);

  return { q1: { ...q1, inputHex: q1Entry.hex }, q2: { ...q2, inputDecimal: q2Entry.decimal } };
};

export const formatPowers = (powers) => {
  if (powers.length === 0) return '0';
  return powers.map(p => `2^${p}`).join(' + ');
};

export const superscript = (n) => {
  const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map(c => map[c] || c).join('');
};

