CREATE TABLE t_p38734199_stalker_rp_donations.promocodes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(16) NOT NULL CHECK (type IN ('balance', 'discount')),
    value NUMERIC(10,2) NOT NULL,
    category VARCHAR(64) DEFAULT NULL,
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p38734199_stalker_rp_donations.promocode_uses (
    id SERIAL PRIMARY KEY,
    promocode_id INTEGER NOT NULL REFERENCES t_p38734199_stalker_rp_donations.promocodes(id),
    user_id INTEGER NOT NULL REFERENCES t_p38734199_stalker_rp_donations.users(id),
    used_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(promocode_id, user_id)
);

ALTER TABLE t_p38734199_stalker_rp_donations.users
    ADD COLUMN IF NOT EXISTS balance NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE t_p38734199_stalker_rp_donations.orders
    ADD COLUMN IF NOT EXISTS promo_id INTEGER DEFAULT NULL REFERENCES t_p38734199_stalker_rp_donations.promocodes(id),
    ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2) NOT NULL DEFAULT 0;