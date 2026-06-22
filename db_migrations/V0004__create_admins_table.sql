CREATE TABLE IF NOT EXISTS t_p38734199_stalker_rp_donations.admins (
    id SERIAL PRIMARY KEY,
    steam_id VARCHAR(32) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);