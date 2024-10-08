import type { Transaction } from "deno-pg";



export async function getCandles(tx: Transaction, range: "1m" | "5m", mint: string) {
    const tableName = `candles_${range}`;
    const query = `
        SELECT *
        FROM ${tableName}
        WHERE mint_public_key = $1
        AND start_timestamp >= (EXTRACT(EPOCH FROM NOW()) - 3600)
        ORDER BY start_timestamp ASC;
    `;
    
    const result = await tx.queryObject(query, [mint]);
    return result.rows;
}
