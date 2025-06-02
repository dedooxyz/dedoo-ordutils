import type { UnspentOutput, UnspentOutputBase } from "./OrdTransaction.js";
import type { Network, Psbt } from "dedoo-coinjs-lib";

interface CreateSendBase {
  utxos: UnspentOutput[];
  toAddress: string;
  enableRBF?: boolean;
  signTransaction: (psbt: Psbt) => Promise<void>;
  changeAddress: string;
  feeRate?: number;
  network: Network;
  pubkey: string;
  calculateFee?: (tx: string, feeRate: number) => Promise<number>;
  tick?: string;
}

export interface CreateSendCoin extends CreateSendBase {
  toAmount: number;
  receiverToPayFee?: boolean;
}

export interface CreateMultiSendCoin extends CreateSendBase {
  outputs: Array<{
    address: string;
    amount: number;
  }>;
  receiverToPayFee?: boolean;
}

export interface CreateSendOrd extends CreateSendBase {
  outputValue: number;
}

export interface CreateMultiSendOrd {
  utxos: UnspentOutputBase[];
  toAddress: string;
  signPsbtHex: (psbtHex: string) => Promise<string>;
  changeAddress: string;
  feeRate?: number;
  network: Network; // Required for blockchain-agnostic operation
  publicKey: string;
}

export interface AddInputProps {
  psbt: Psbt;
  utxo: UnspentOutputBase;
  publicKey: string;
  network: Network;
  sighashType?: number;
}
