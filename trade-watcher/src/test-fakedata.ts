import * as anchor from "npm:@coral-xyz/anchor";
const { BN } = anchor.default;
import { Keypair, PublicKey } from "npm:@solana/web3.js";
import * as store from "./store.ts";
import type { Trade } from "./types/types.ts";


//! FUNCIONES PARA PRUEBAS
// Función para generar datos de prueba
export async function generateTestTrades(
    numTrades: number,
    baseTimestamp: number,
    timeIncrement: number,
) {
    // const mintAngToken = generateValidPublicKey();
    const mintAngToken = new PublicKey('ATerk5yWcsr4w3m4UvBms4bfw2M11NGZZDRSYjUWDRR4');

    // Crear los datos
    for (let i = 0; i < numTrades; i++) {
        const trade = createTrade(baseTimestamp, timeIncrement, i, mintAngToken)
        simulateTradeEvent(trade);
    }

    // Función para esperar el tiempo especificado
    function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Crear los trades restantes de forma asíncrona
    for (let i = 0; i < numTrades; i++) {
        await delay(timeIncrement * 1000);
        const trade = createTrade(baseTimestamp + (numTrades * timeIncrement), timeIncrement, i, mintAngToken);
        simulateTradeEvent(trade);
    }
}

function generateValidPublicKey(): PublicKey {
    const keypair = Keypair.generate();
    return keypair.publicKey;
}


function createTrade(
    baseTimestamp: number,
    timeIncrement: number,
    i: number,
    mintAngToken: PublicKey,
) {
    const timestamp = new BN(baseTimestamp + i * timeIncrement);
    const isBuy = Math.random() > 0.5;
    const tokenAmount = new BN(Math.floor(100 + Math.random() * 300));
    const solAmount = new BN(Math.floor(4000 + Math.random() * 3000));
    const trade = {
        vToken: new BN(0), // No usar
        vSol: new BN(0), // No usar
        isBuy,
        timestamp,
        user: generateValidPublicKey(),
        tokenAmount,
        solAmount,
        mint: mintAngToken,
    };
    return trade
}

async function simulateTradeEvent(trade: Trade) {
    await store.onTx(`trade-${trade.mint.toString()}`, async (tx) => {
        await store.saveTradeToDB(tx, trade, "fake-signature");
        await store.saveCandle(tx, trade, "1m");
        await store.saveCandle(tx, trade, "5m");
    });
}