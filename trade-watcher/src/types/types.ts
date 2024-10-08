import type { PublicKey } from "@solana/web3.js";
import type { BN } from "npm:@coral-xyz/anchor";

export type Trade = {
    vToken: BN;
    vSol: BN;
    isBuy: boolean;
    timestamp: BN;
    user: PublicKey;
    tokenAmount: BN;
    solAmount: BN;
    mint: PublicKey;
};
