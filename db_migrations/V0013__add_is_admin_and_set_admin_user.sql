ALTER TABLE t_p38734199_stalker_rp_donations.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

INSERT INTO t_p38734199_stalker_rp_donations.users (steam_id, username, avatar_url, is_admin)
VALUES ('76561199133932037', 'Admin', NULL, true)
ON CONFLICT (steam_id) DO UPDATE SET is_admin = true;