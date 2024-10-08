import { Pool, Transaction } from "deno-pg";
import type { Trade } from "./types/types.ts";
import * as anchor from "npm:@coral-xyz/anchor";
const { BN } = anchor.default;
import "jsr:@std/dotenv/load";
import { notifyClients } from "./routes.ts";

// Lazy pool connection
const pool = new Pool(
    {
        user: Deno.env.get("PGUSER"),
        password: Deno.env.get("PGPASSWORD"),
        database: Deno.env.get("PGDATABASE"),
        hostname: Deno.env.get("PGHOST"),
        port: Deno.env.get("PGPORT"),
    },
    10,
    true,
);

export function end() {
    return pool.end();
}

export async function onTx(name: string, callback: (tx: Transaction) => Promise<void>): Promise<void> {
    const client = await pool.connect();
    const tx = client.createTransaction(name);
    try {
        await tx.begin();
        await callback(tx);
        await tx.commit();
    } finally {
        client.release();
    }
}

// Función para guardar velas
export async function saveCandle(tx: Transaction, trade: Trade, range: "1m" | "5m") {
    const price = trade.solAmount.div(trade.tokenAmount);
    const mintPublicKey = trade.mint.toString();
    const timestamp = trade.timestamp;
    const { startTimestamp, tableName } = getRangeData(timestamp, range);

    // TODO hacer que el open de una nueva consulta seal el close de la anterior 
    const query = `
        INSERT INTO ` + tableName + ` 
        (mint_public_key, start_timestamp, open_price, close_price, high_price, low_price)
        VALUES ($1, $2, $3, $3, $3, $3)
        ON CONFLICT (mint_public_key, start_timestamp)
        DO UPDATE SET
            close_price = $3,
            high_price = GREATEST(` + tableName + `.high_price, $3),
            low_price = LEAST(` + tableName + `.low_price, $3)
        RETURNING *  -- Devolvemos todas las columnas de la fila afectada
    `;

    const result = await tx.queryObject(query, [
        mintPublicKey,
        startTimestamp.toString(),
        price.toString(),
    ]);
    
    // mandar info al WebSocket
    if (typeof result.rows[0] === 'object' && result.rows[0] !== null) {
        notifyClients({
            token: mintPublicKey.toString(),
            timeframe: range,
            data: result.rows[0] as object
        });
    } else {
        console.error('El valor de data no es un objeto válido');
    }
}

function getRangeData(
    timestamp: anchor.BN,
    range: "1m" | "5m",
): { startTimestamp: anchor.BN; tableName: string } {
    switch (range) {
        case "1m":
            return {
                startTimestamp: timestamp.div(new BN(60)).mul(new BN(60)),
                tableName: "candles_1m",
            };
        case "5m":
            return {
                startTimestamp: timestamp.div(new BN(60 * 5)).mul(new BN(60 * 5)),
                tableName: "candles_5m",
            };
        default:
            throw new Error("Invalid range");
    }
}

// Función para guardar un solo trade en la base de datos
export async function saveTradeToDB(tx: Transaction, trade: Trade, txSignature: string) {
    const query = `
    INSERT INTO trades (v_token, v_sol, is_buy, timestamp, user_public_key, token_amount, sol_amount, mint_public_key, transaction_signature) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [
        trade.vToken.toString(),
        trade.vSol.toString(),
        trade.isBuy,
        trade.timestamp.toString(),
        trade.user.toBase58(),
        trade.tokenAmount.toString(),
        trade.solAmount.toString(),
        trade.mint.toBase58(),
        txSignature,
    ];
    await tx.queryObject(query, values);
}
