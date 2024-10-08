import process from "node:process";
import * as anchor from "npm:@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "npm:@solana/web3.js";
import idl from "./idl/bonding.json" with { type: "json" };
import * as store from "./store.ts";
import { Bonding } from "./types/bonding.ts";
import type { Trade } from "./types/types.ts";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const program = new anchor.Program<Bonding>(idl as Bonding, { connection });

// Event looks like this:
// Trade event detected: {
//     vToken: <BN: 3cfb1eaf1ad00>,
//     vSol: <BN: 6fc7e236e>,
//     isBuy: false,
//     timestamp: <BN: 66f58ef9>,
//     user: PublicKey [PublicKey(2k19Kg3opfYRWaA8VNCA8ezRxbFSAyXNBMdSV6vTC7fv)] {
//       _bn: <BN: 19dfd2ee86cd579566444818b8a5de605ce436539526f8754d0aa95f2dcbfb61>
//     },
//     tokenAmount: <BN: 48c6fb40>,
//     solAmount: <BN: 7ebc>,
//     mint: PublicKey [PublicKey(531zKjNh7kemzPvNEG1LLWwQTozHxp7a2ATqyHmJSFxH)] {
//       _bn: <BN: 3bf306de32c1b1cb5a2a33f64eb28b06c6d24634abe812db00effca6632227f6>
//     }
//   }

// const resp = await connection.getTokenLargestAccounts(
//     new PublicKey("531zKjNh7kemzPvNEG1LLWwQTozHxp7a2ATqyHmJSFxH"),
//     "confirmed",
// );
// console.log(resp);

const subscriptionId = program.addEventListener(
    "trade",
    async (trade: Trade, slot, signature) => {
        console.log("Trade event detected:", trade, signature);
        await store.onTx(`trade-${trade.mint.toString()}`, async (tx) => {
            await store.saveTradeToDB(tx, trade, signature);
            await store.saveCandle(tx, trade, "1m");
            await store.saveCandle(tx, trade, "5m");
        });
        // TODO
        // - calcula nuevo precio
        // - calculate Market Cap
        // - calculate Price per Token -> save in the current token table
        // - send data to frontend via webhooks so it updates!
        console.log("Trade event detected and saved:", trade, slot, signature);
    },
);

console.log("Listening for trade events:", subscriptionId);
process.on("SIGINT", async () => {
    console.log("\nCaught interrupt signal, cleaning up and exiting...");
    program.removeEventListener(subscriptionId);
    await store.end();
    process.exit();
});

setInterval(() => {}, 1000);
