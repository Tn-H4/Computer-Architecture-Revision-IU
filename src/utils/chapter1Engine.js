import { pick } from './worksheetHelpers.js';

export function generateVariables() {
  // Q1 Variables
  const q1Clock = pick([1.5, 2, 2.5, 3, 4]); // GHz
  const q1IC = pick([1000, 2000, 4000, 5000]);
  const pLS = pick([25, 30, 35]);
  const pJump = pick([5, 10, 15]);
  const pBranch = pick([15, 20, 25]);
  const pArith = 100 - pLS - pJump - pBranch;
  const cpiLS = pick([2.5, 3.0, 4.0]);
  const cpiJump = 1.0;
  const cpiBranch = pick([1.5, 2.0]);
  const cpiArith = pick([1.5, 2.0]);
  const q1ImproveFactor = pick([2, 2.5]);

  const q1Cycles = (q1IC * (pLS/100) * cpiLS) + (q1IC * (pJump/100) * cpiJump) + (q1IC * (pBranch/100) * cpiBranch) + (q1IC * (pArith/100) * cpiArith);
  const q1CPUTime = q1Cycles / (q1Clock * 1e9) * 1e6; // in micro seconds
  const q1AvgCPI = q1Cycles / q1IC;
  const newCPILS = cpiLS / q1ImproveFactor;
  const newQ1Cycles = (q1IC * (pLS/100) * newCPILS) + (q1IC * (pJump/100) * cpiJump) + (q1IC * (pBranch/100) * cpiBranch) + (q1IC * (pArith/100) * cpiArith);
  const q1Speedup = q1Cycles / newQ1Cycles;

  // Q2 Variables
  const pFP = pick([20, 25, 30, 40]);
  const cpiFP = pick([4.0, 5.0, 6.0]);
  const cpiOther = pick([1.2, 1.25, 1.33, 1.5]);
  const pOther = 100 - pFP;
  const pFPSQR = pick([2, 4, 5, 8]);
  const cpiFPSQR = pick([15, 20, 25]);
  const alt1FPSQR_CPI = pick([2, 3]);
  const alt2FP_CPI = pick([2.0, 2.5, 3.0]);

  const baseCPI = (pFP/100)*cpiFP + (pOther/100)*cpiOther;
  const alt1CPI = baseCPI - (pFPSQR/100) * (cpiFPSQR - alt1FPSQR_CPI);
  const alt2CPI = baseCPI - (pFP/100) * (cpiFP - alt2FP_CPI);
  const q2Speedup1 = baseCPI / alt1CPI;
  const q2Speedup2 = baseCPI / alt2CPI;

  // Q3 Variables
  const fpCount = pick([40, 50, 60]); 
  const intCount = pick([100, 110, 120]);
  const lsCount = pick([70, 80, 90]);
  const brCount = pick([16, 20, 24]);
  const q3SpeedupTarget = pick([1.5, 2]); 
  const cpiFP3 = 1;
  const cpiINT3 = 1;
  const cpiLS3 = pick([3, 4, 5]);
  const cpiBR3 = 2;
  const reducePart1 = pick([30, 40, 50]); 
  const reducePart2 = pick([20, 25, 30]); 

  const baseCycles3 = (fpCount * cpiFP3) + (intCount * cpiINT3) + (lsCount * cpiLS3) + (brCount * cpiBR3);
  const targetCycles3 = baseCycles3 / q3SpeedupTarget;

  // Q3a logic
  const nonFPCycles = (intCount * cpiINT3) + (lsCount * cpiLS3) + (brCount * cpiBR3);
  let q3aAns = "impossible";
  if (targetCycles3 > nonFPCycles) {
      q3aAns = (targetCycles3 - nonFPCycles) / fpCount;
  }

  // Q3b logic
  const nonLSCycles = (fpCount * cpiFP3) + (intCount * cpiINT3) + (brCount * cpiBR3);
  let q3bAns = "impossible";
  if (targetCycles3 > nonLSCycles) {
      q3bAns = (targetCycles3 - nonLSCycles) / lsCount;
  }

  // Q3c logic
  const newCpiFP3 = cpiFP3 * (1 - reducePart1/100);
  const newCpiINT3 = cpiINT3 * (1 - reducePart1/100);
  const newCpiLS3 = cpiLS3 * (1 - reducePart2/100);
  const newCpiBR3 = cpiBR3 * (1 - reducePart2/100);
  const newCycles3 = (fpCount * newCpiFP3) + (intCount * newCpiINT3) + (lsCount * newCpiLS3) + (brCount * newCpiBR3);
  const q3cSpeedup = baseCycles3 / newCycles3;

  return {
      q1: { clock: q1Clock, ic: q1IC, pLS, pJump, pBranch, pArith, cpiLS, cpiJump, cpiBranch, cpiArith, improveFactor: q1ImproveFactor, ansA: q1CPUTime, ansB: q1AvgCPI, ansC: q1Speedup, q1Cycles, newQ1Cycles, newCPILS },
      q2: { pFP, cpiFP, cpiOther, pOther, pFPSQR, cpiFPSQR, alt1FPSQR_CPI, alt2FP_CPI, ansA: baseCPI, ansB: q2Speedup1, ansC: q2Speedup2, alt1CPI, alt2CPI, alt1Better: q2Speedup1 > q2Speedup2 },
      q3: { fp: fpCount, int: intCount, ls: lsCount, br: brCount, speedupTarget: q3SpeedupTarget, reduce1: reducePart1, reduce2: reducePart2, cpiLS: cpiLS3, baseCycles: baseCycles3, targetCycles: targetCycles3, nonFPCycles, nonLSCycles, newCycles3, newCpiFP: newCpiFP3, newCpiINT: newCpiINT3, newCpiLS: newCpiLS3, newCpiBR: newCpiBR3, ansA: q3aAns, ansB: q3bAns, ansC: q3cSpeedup }
  };
};
