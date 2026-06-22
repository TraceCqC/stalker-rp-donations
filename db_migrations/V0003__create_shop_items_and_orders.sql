
CREATE TABLE IF NOT EXISTS t_p38734199_stalker_rp_donations.shop_items (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    badge VARCHAR(50),
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p38734199_stalker_rp_donations.orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES t_p38734199_stalker_rp_donations.users(id),
    item_id INT NOT NULL REFERENCES t_p38734199_stalker_rp_donations.shop_items(id),
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    robokassa_inv_id INT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

INSERT INTO t_p38734199_stalker_rp_donations.shop_items (category, name, description, price, badge, is_popular, sort_order) VALUES
('privilege', 'Сталкер', 'Доступ к /kit stalker каждые 24ч. Цветной ник в чате. +10% к опыту за выживание.', 199, NULL, FALSE, 1),
('privilege', 'Ветеран Зоны', 'Доступ к /kit veteran каждые 24ч. Золотой ник. +25% к опыту. Приоритет входа на сервер.', 399, 'Популярно', TRUE, 2),
('privilege', 'Хранитель Зоны', 'Максимальный статус. Эксклюзивный набор каждые 12ч. Красный ник. +50% к опыту. Слот навсегда.', 799, 'Топ', FALSE, 3),
('items', 'Стартовый набор Выживальщика', 'AKM + 4 магазина, аптечки x5, консервы x10, противогаз.', 149, NULL, FALSE, 1),
('items', 'Набор Рейдера', 'M4A1 + ELCAN, бронежилет 4кл, граната x3, аптечки x10.', 299, 'Популярно', TRUE, 2),
('items', 'Элитный набор «Призрак»', 'SVD + прицел, полный химзащитный костюм, аптечки x20, флягу воды x5.', 499, 'Редкий', FALSE, 3),
('currency', '500 Рублей Зоны', 'Внутриигровая валюта для торговли с NPC и другими игроками.', 99, NULL, FALSE, 1),
('currency', '1500 Рублей Зоны', 'Выгоднее на 50%. Хватит на снаряжение среднего уровня.', 249, 'Выгодно', TRUE, 2),
('currency', '5000 Рублей Зоны', 'Максимальный пакет. Экономия 40% по сравнению с базовой ценой.', 699, 'Максимум', FALSE, 3);
