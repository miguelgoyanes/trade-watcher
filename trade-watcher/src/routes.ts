import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as store from "./store.ts"
import * as httpStore from "./httpStore.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts"
import {generateTestTrades} from "./test-fakedata.ts"

// GENERAR DATOS FALSOS
generateTestTrades(360, Math.floor(Date.now() / 1000), 10);

const router = new Router();
const clients = new Map<WebSocket, { token: string, timeframe: string }>();
    
// Endpoint
router
    .get("/api/:range/:mint", async (context) => {
        const range = context.params.range as '1m' | '5m'
        console.log(range);
        if (range !== '1m' && range !== '5m') {
            context.response.status = 400;
            context.response.body = { error: "Invalid range. Expected '1m' or '5m'." };
            return;
        }

        const mint = context.params.mint

        await store.onTx(`get-candles-${range}`, async (tx) => {
            const candles = await httpStore.getCandles(tx, range, mint);
            
            context.response.body = JSON.stringify(candles, (_, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        });
    });





// Endpoint WebSocket
router.get("/ws", (context) => {
    if (context.isUpgradable) {
        const ws = context.upgrade();

        ws.onopen = () => {
            // Se inicializa la conexión pero sin una suscripción todavía
            clients.set(ws, { token: '', timeframe: '' });
        };

        ws.onmessage = (message: MessageEvent) => {
            try {
                const data = JSON.parse(message.data);
                // El cliente envía un mensaje con el token y la temporalidad que desea
                if (data.token && data.timeframe) {
                    clients.set(ws, { token: data.token, timeframe: data.timeframe });
                    console.log(`Client subscribed to token: ${data.token}, timeframe: ${data.timeframe}`);
                }
            } catch (err) {
                console.error("WebSocket message error:", err);
            }
        };

        ws.onclose = () => {
            clients.delete(ws);
        };

        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
        };
    }
});

// Función para notificar a los clientes WebSocket
export function notifyClients(trade: { token: string, timeframe: string, data: object }) {
    for (const [client, { token, timeframe }] of clients.entries()) {
        if (token === trade.token && timeframe === trade.timeframe) {
            client.send(JSON.stringify(trade.data, (_, value) =>
                typeof value === 'bigint' ? Number(value) : value
            ))
        }
    }
}




const app = new Application();

// Configurar CORS
app.use(oakCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
