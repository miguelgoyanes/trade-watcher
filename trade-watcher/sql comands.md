```sql
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    mint_public_key VARCHAR(255),
    user_public_key VARCHAR(255),
    v_token BIGINT,
    v_sol BIGINT,
    is_buy BOOLEAN,
    timestamp BIGINT,
    token_amount BIGINT,
    sol_amount BIGINT,
    transaction_signature VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_trades_mint_public_key_timestamp ON trades (mint_public_key, timestamp);


CREATE TABLE IF NOT EXISTS candles_1m (
    mint_public_key VARCHAR(255),
    start_timestamp BIGINT,
    open_price BIGINT,
    close_price BIGINT,
    high_price BIGINT,
    low_price BIGINT,
    PRIMARY KEY (mint_public_key, start_timestamp)
);

CREATE TABLE IF NOT EXISTS candles_5m (
    mint_public_key VARCHAR(255),
    start_timestamp BIGINT,
    open_price BIGINT,
    close_price BIGINT,
    high_price BIGINT,
    low_price BIGINT,
    PRIMARY KEY (mint_public_key, start_timestamp)
);

TRUNCATE TABLE trades, candles_1m, candles_5m RESTART IDENTITY CASCADE;
```
