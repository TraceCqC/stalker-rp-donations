CREATE TABLE t_p38734199_stalker_rp_donations.purchases (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL,
    item_name VARCHAR(128) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(128),
    contact VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_nickname ON t_p38734199_stalker_rp_donations.purchases(nickname);
CREATE INDEX idx_purchases_status ON t_p38734199_stalker_rp_donations.purchases(status);
CREATE INDEX idx_purchases_created_at ON t_p38734199_stalker_rp_donations.purchases(created_at DESC);