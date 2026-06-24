export function generateMipsProblem() {
  const opcodes = ['add', 'sub', 'and', 'or', 'lw', 'sw'];
  const registers = ['$t1', '$t2', '$t3', '$t4', '$t5'];
  const length = Math.floor(Math.random() * 4) + 4; 

  let instructions = [];
  let parsedInstructions = [];

  for (let i = 0; i < length; i++) {
    const op = opcodes[Math.floor(Math.random() * opcodes.length)];
    const dest = registers[Math.floor(Math.random() * registers.length)];
    const src1 = registers[Math.floor(Math.random() * registers.length)];
    const src2 = registers[Math.floor(Math.random() * registers.length)];
    const offset = Math.floor(Math.random() * 20) * 4;

    let instString = '';
    let reads = [], writes = [];

    if (op === 'lw') {
      instString = `${op} ${dest}, ${offset}(${src1})`;
      reads = [src1]; writes = [dest];
    } else if (op === 'sw') {
      instString = `${op} ${dest}, ${offset}(${src1})`;
      reads = [dest, src1]; writes = [];
    } else {
      instString = `${op} ${dest}, ${src1}, ${src2}`;
      reads = [src1, src2]; writes = [dest];
    }

    instructions.push(`${i + 1}: ${instString}`);
    parsedInstructions.push({ index: i + 1, op, src1, src2, dest, reads, writes });
  }

  // --- 1. STALL-ONLY MATH ENGINE ---
  let stallHazards = [];
  let totalStallsOnly = 0;
  let regReadyCycleStall = {}; 
  let currentIssueStall = 1; 
  let stallSolutionGrid = Array(length).fill(null).map(() => []);

  for (let i = 0; i < parsedInstructions.length; i++) {
    const inst = parsedInstructions[i];
    let baseIM = currentIssueStall;
    let baseID = baseIM + 1;
    let reqID = baseID;

    inst.reads.forEach(reg => {
      if (regReadyCycleStall[reg] && regReadyCycleStall[reg] > reqID) {
        reqID = regReadyCycleStall[reg];
        let srcIdx = parsedInstructions.find(p => p.writes.includes(reg) && p.index < inst.index)?.index;
        if (srcIdx && !stallHazards.includes(`(${srcIdx})-(${inst.index})`)) {
          stallHazards.push(`(${srcIdx})-(${inst.index})`);
        }
      }
    });

    let s = reqID - baseID;
    totalStallsOnly += s;
    currentIssueStall = (baseIM + s) + 1;

    for(let c = 0; c < baseIM - 1; c++) stallSolutionGrid[i].push(null);
    for(let j = 0; j < s; j++) stallSolutionGrid[i].push('Stall');
    stallSolutionGrid[i].push('IM', 'Reg1', 'ALU', 'DM', 'Reg2');

    if (inst.writes.length > 0) {
      inst.writes.forEach(reg => { regReadyCycleStall[reg] = reqID + 3; });
    }
  }
  const maxCyclesStall = Math.max(...stallSolutionGrid.map(r => r.length));

  // --- 2. ADVANCED FORWARDING & MULTIPLEXER MATH ENGINE ---
  let fwdHazards = [];
  let solutionFwdPaths = []; 
  let remainingStalls = 0;
  let firstMuxAnswer = "ForwardA=00, ForwardB=00";
  let muxFound = false;
  let fwdSolutionGrid = Array(length).fill(null).map(() => []);
  
  let currentIssueFwd = 1;

  for (let i = 0; i < parsedInstructions.length; i++) {
    const inst = parsedInstructions[i];
    let baseIM = currentIssueFwd;
    let baseID = baseIM + 1;
    
    let needsLoadStall = false;
    let loadUseFwdA = false;
    let loadUseFwdB = false;

    if (i > 0 && parsedInstructions[i-1].op === 'lw') {
      const priorDest = parsedInstructions[i-1].dest;
      if (inst.op !== 'lw' && inst.op !== 'sw') {
        if (inst.src1 === priorDest) loadUseFwdA = true;
        if (inst.src2 === priorDest) loadUseFwdB = true;
      } else if (inst.op === 'sw') {
        if (inst.src1 === priorDest) loadUseFwdA = true; 
        if (inst.dest === priorDest) loadUseFwdB = true; 
      } else if (inst.op === 'lw') {
        if (inst.src1 === priorDest) loadUseFwdA = true; 
      }
      if (loadUseFwdA || loadUseFwdB) needsLoadStall = true;
    }

    let s = needsLoadStall ? 1 : 0;
    remainingStalls += s;
    
    let actIM = baseIM + s;
    currentIssueFwd = actIM + 1;

    for(let c = 0; c < baseIM - 1; c++) fwdSolutionGrid[i].push(null);
    for(let j = 0; j < s; j++) fwdSolutionGrid[i].push('Stall');
    fwdSolutionGrid[i].push('IM', 'Reg1', 'ALU', 'DM', 'Reg2');

    let fA = "00", fB = "00";
    
    if (i > 0) {
      const prev1 = parsedInstructions[i-1];
      if (prev1.writes.length > 0 && prev1.dest !== '$zero') {
        if (prev1.op === 'lw') {
           if (loadUseFwdA) { fA = "01"; fwdHazards.push(`(${prev1.index})-(${inst.index})`); solutionFwdPaths.push({from: {row: i-1, stage: 'DM'}, to: {row: i, stage: 'ALU'}}); }
           if (loadUseFwdB) { fB = "01"; fwdHazards.push(`(${prev1.index})-(${inst.index})`); solutionFwdPaths.push({from: {row: i-1, stage: 'DM'}, to: {row: i, stage: 'ALU'}}); }
        } else {
           let matchedA = false, matchedB = false;
           if (inst.op !== 'lw' && inst.op !== 'sw') {
             if (prev1.dest === inst.src1) { fA = "10"; matchedA = true; }
             if (prev1.dest === inst.src2) { fB = "10"; matchedB = true; }
           } else if (inst.op === 'sw') {
             if (prev1.dest === inst.src1) { fA = "10"; matchedA = true; }
             if (prev1.dest === inst.dest) { fB = "10"; matchedB = true; }
           } else if (inst.op === 'lw') {
             if (prev1.dest === inst.src1) { fA = "10"; matchedA = true; }
           }
           if (matchedA || matchedB) {
               fwdHazards.push(`(${prev1.index})-(${inst.index})`);
               solutionFwdPaths.push({from: {row: i-1, stage: 'ALU'}, to: {row: i, stage: 'ALU'}});
           }
        }
      }
    }
    
    if (i > 1) {
      const prev2 = parsedInstructions[i-2];
      if (prev2.writes.length > 0 && prev2.dest !== '$zero') {
         let matchedA = false, matchedB = false;
         if (inst.op !== 'lw' && inst.op !== 'sw') {
           if (prev2.dest === inst.src1 && fA === "00") { fA = "01"; matchedA = true; }
           if (prev2.dest === inst.src2 && fB === "00") { fB = "01"; matchedB = true; }
         } else if (inst.op === 'sw') {
           if (prev2.dest === inst.src1 && fA === "00") { fA = "01"; matchedA = true; }
           if (prev2.dest === inst.dest && fB === "00") { fB = "01"; matchedB = true; }
         } else if (inst.op === 'lw') {
           if (prev2.dest === inst.src1 && fA === "00") { fA = "01"; matchedA = true; }
         }
         if (matchedA || matchedB) {
            fwdHazards.push(`(${prev2.index})-(${inst.index})`);
            solutionFwdPaths.push({from: {row: i-2, stage: 'DM'}, to: {row: i, stage: 'ALU'}});
         }
      }
    }

    if (!muxFound && (fA !== "00" || fB !== "00")) {
      firstMuxAnswer = `ForwardA=${fA}, ForwardB=${fB}`;
      muxFound = true;
    }
  }
  
  fwdHazards = [...new Set(fwdHazards)];
  const maxCyclesFwd = Math.max(...fwdSolutionGrid.map(r => r.length));

  return {
    instructions,
    stallSolutionGrid,
    fwdSolutionGrid,
    solutionFwdPaths, 
    stallAnswers: {
      hazards: stallHazards.join(', ') || 'None',
      stalls: totalStallsOnly.toString(),
      cycles: maxCyclesStall.toString()
    },
    fwdAnswers: {
      hazards: fwdHazards.join(', ') || 'None',
      mux: firstMuxAnswer,
      stalls: remainingStalls.toString(),
      cycles: maxCyclesFwd.toString()
    }
  };
};

