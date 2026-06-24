import { pick } from './worksheetHelpers.js';

export function generateVariables() {
  // Common
  const wordSize = 4; // bytes per word
  const addressBits = 32;

  // Q1 Variables (Direct Mapped)
  const q1CacheSizeKB = pick([4, 8, 16, 32]);
  const q1BlockSizeWords = pick([4, 8, 16]);
  
  const q1CacheSizeBytes = q1CacheSizeKB * 1024;
  const q1BlockSizeBytes = q1BlockSizeWords * wordSize;
  const q1NumBlocks = q1CacheSizeBytes / q1BlockSizeBytes;
  const q1OffsetBits = Math.log2(q1BlockSizeBytes);
  const q1IndexBits = Math.log2(q1NumBlocks);
  const q1TagBits = addressBits - q1IndexBits - q1OffsetBits;
  const q1TotalBits = q1NumBlocks * ((q1BlockSizeWords * 32) + q1TagBits + 1);

  // Q2 Variables (Set Associative)
  const q2NWay = pick([2, 4, 8]);
  const q2CacheSizeKB = pick([8, 16, 32, 64]);
  const q2BlockSizeWords = pick([4, 8, 16]);

  const q2CacheSizeBytes = q2CacheSizeKB * 1024;
  const q2BlockSizeBytes = q2BlockSizeWords * wordSize;
  const q2TotalBlocks = q2CacheSizeBytes / q2BlockSizeBytes;
  const q2NumSets = q2TotalBlocks / q2NWay;
  const q2OffsetBits = Math.log2(q2BlockSizeBytes);
  const q2IndexBits = Math.log2(q2NumSets);
  const q2TagBits = addressBits - q2IndexBits - q2OffsetBits;
  const q2TotalBits = q2TotalBlocks * ((q2BlockSizeWords * 32) + q2TagBits + 1);

  // Q3 Variables (Fully Associative)
  const q3CacheSizeKB = pick([4, 8, 16, 32]);
  const q3BlockSizeWords = pick([4, 8, 16]);
  
  const q3CacheSizeBytes = q3CacheSizeKB * 1024;
  const q3BlockSizeBytes = q3BlockSizeWords * wordSize;
  const q3NumBlocks = q3CacheSizeBytes / q3BlockSizeBytes;
  const q3OffsetBits = Math.log2(q3BlockSizeBytes);
  const q3IndexBits = 0; // Fully associative has no index
  const q3TagBits = addressBits - q3OffsetBits;
  const q3TotalBits = q3NumBlocks * ((q3BlockSizeWords * 32) + q3TagBits + 1);

  return {
    q1: { cacheSize: q1CacheSizeKB, blockWords: q1BlockSizeWords, cacheBytes: q1CacheSizeBytes, blockBytes: q1BlockSizeBytes, ansBlocks: q1NumBlocks, ansOffset: q1OffsetBits, ansIndex: q1IndexBits, ansTag: q1TagBits, ansTotalBits: q1TotalBits },
    q2: { nWay: q2NWay, cacheSize: q2CacheSizeKB, blockWords: q2BlockSizeWords, cacheBytes: q2CacheSizeBytes, blockBytes: q2BlockSizeBytes, totalBlocks: q2TotalBlocks, ansSets: q2NumSets, ansOffset: q2OffsetBits, ansIndex: q2IndexBits, ansTag: q2TagBits, ansTotalBits: q2TotalBits },
    q3: { cacheSize: q3CacheSizeKB, blockWords: q3BlockSizeWords, cacheBytes: q3CacheSizeBytes, blockBytes: q3BlockSizeBytes, ansBlocks: q3NumBlocks, ansOffset: q3OffsetBits, ansIndex: q3IndexBits, ansTag: q3TagBits, ansTotalBits: q3TotalBits }
  };
};
