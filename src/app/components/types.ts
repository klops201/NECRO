import { PublicKey } from '@solana/web3.js';

export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  bondingCurveState?: {
    realTokenReserves: string;
    virtualTokenReserves: string;
    realSolReserves: string;
    virtualSolReserves: string;
    tokenTotalSupply: string;
    complete: boolean;
  };
  supply?: string;
  holders?: {
    count: number;
    topHolders: Array<{
      address: string;
      amount: string;
      percentage: number;
    }>;
  };
}

export interface MetadataResult {
  url: string;
  mintPubkey: PublicKey;
}

export interface HoldersData {
  count: number;
  topHolders: Array<{
    address: string;
    amount: string;
    percentage: number;
  }>;
  totalSupply: string;
}
