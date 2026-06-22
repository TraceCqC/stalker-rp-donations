CREATE TABLE t_p38734199_stalker_rp_donations.news (
  id SERIAL PRIMARY KEY,
  ver VARCHAR(100) NOT NULL,
  date VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  tag VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p38734199_stalker_rp_donations.news (ver, date, title, tag, text, sort_order) VALUES
('Патч 1.7.3', '18.06.2026', 'Новая аномальная зона «Янтарь»', 'Контент', 'Добавлена локация с радиоактивными аномалиями, редкими артефактами и фракцией учёных. Повышен риск — выросла награда.', 1),
('Патч 1.7.2', '09.06.2026', 'Переработка системы выживания', 'Баланс', 'Голод, жажда и радиация теперь влияют на стамину. Противогазы получили ресурс фильтров. Аптечки лечат медленнее.', 2),
('Хотфикс 1.7.1', '02.06.2026', 'Исправление дюпа транспорта', 'Фикс', 'Закрыт эксплойт с дублированием машин. Откатаны нечестно полученные предметы. Стабилизирован спавн мутантов.', 3);
