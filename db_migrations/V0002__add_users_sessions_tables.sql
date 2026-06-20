CREATE TABLE t_p38734199_stalker_rp_donations.users (
    id SERIAL PRIMARY KEY,
    steam_id VARCHAR(32) NOT NULL UNIQUE,
    username VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p38734199_stalker_rp_donations.sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p38734199_stalker_rp_donations.users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

ALTER TABLE t_p38734199_stalker_rp_donations.purchases
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES t_p38734199_stalker_rp_donations.users(id);

CREATE INDEX idx_sessions_user_id ON t_p38734199_stalker_rp_donations.sessions(user_id);
CREATE INDEX idx_users_steam_id ON t_p38734199_stalker_rp_donations.users(steam_id);
CREATE INDEX idx_purchases_user_id ON t_p38734199_stalker_rp_donations.purchases(user_id);