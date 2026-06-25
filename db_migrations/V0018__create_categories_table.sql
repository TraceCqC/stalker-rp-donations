CREATE TABLE t_p38734199_stalker_rp_donations.categories (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Package',
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p38734199_stalker_rp_donations.categories (key, label, icon, sort_order) VALUES
    ('privilege', 'Привилегии', 'Shield', 1),
    ('items', 'Снаряжение', 'Package', 2),
    ('currency', 'Валюта Зоны', 'Coins', 3),
    ('transport', 'Транспорт', 'Car', 4),
    ('furniture', 'Фурнитура', 'Armchair', 5);