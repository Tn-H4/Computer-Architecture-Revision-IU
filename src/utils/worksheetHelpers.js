export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const checkAnswer = (input, target) => {
  if (target.type === 'string') {
    return input.trim().toLowerCase() === target.value.toString().toLowerCase();
  }
  const num = parseFloat(input);
  if (isNaN(num)) return false;
  return Math.abs(num - target.value) <= target.tolerance;
};

export const checkHexValue = (input, target, isInst = false) => {
  if (input === undefined || input === null || input === '') return false;
  let cleanIn = input.toString().trim().toLowerCase();
  let cleanTg = target.toString().trim().toLowerCase();

  if (isInst) {
    cleanIn = cleanIn.replace(/[\s,]+/g, '');
    cleanTg = cleanTg.replace(/[\s,]+/g, '');
  } else if (cleanTg.startsWith('0x') || cleanIn.startsWith('0x')) {
    const numIn = parseInt(cleanIn, 16);
    const numTg = parseInt(cleanTg, 16);
    if (!isNaN(numIn) && !isNaN(numTg)) return numIn === numTg;
  }
  return cleanIn === cleanTg;
};

export const toHex = (num, padding = 8) => {
  if (num === undefined || num === null) return '00';
  // >>> 0 ensures negative numbers are properly converted to 32-bit unsigned hex
  return (num >>> 0).toString(16).padStart(padding, '0').toUpperCase();
};

export const createEmptyState = (keys) =>
  Object.fromEntries(keys.map((k) => [k, k.startsWith('q') && k.includes('a') ? '' : null]));
