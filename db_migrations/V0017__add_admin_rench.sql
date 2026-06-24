INSERT INTO t_p38734199_stalker_rp_donations.admins (steam_id)
VALUES ('76561199133932037')
ON CONFLICT (steam_id) DO NOTHING;

UPDATE t_p38734199_stalker_rp_donations.users
SET is_admin = TRUE
WHERE steam_id = '76561199133932037';