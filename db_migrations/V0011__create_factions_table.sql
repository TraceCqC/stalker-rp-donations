CREATE TABLE t_p38734199_stalker_rp_donations.factions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100) NOT NULL DEFAULT 'Shield',
  color VARCHAR(100) NOT NULL DEFAULT 'text-gray-400',
  alignment VARCHAR(100) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p38734199_stalker_rp_donations.factions (name, icon, color, alignment, description, is_paid, sort_order, is_active) VALUES
('Долг', 'Shield', 'text-red-400', 'Порядок', 'Военизированная группировка, цель которой — уничтожение Зоны. Железная дисциплина, тяжёлое вооружение, нулевая терпимость к мародёрам.', false, 1, true),
('Свобода', 'Wind', 'text-green-400', 'Хаос', 'Анархисты Зоны. Убеждены, что Зона — это дар человечеству. Открытый доступ к аномалиям для всех. Вечная война с Долгом.', false, 2, true),
('ОКСОП', 'Eye', 'text-blue-400', 'Закон', 'Отряд контроля и соблюдения общественного порядка. Официальная силовая структура, охраняющая периметр и патрулирующая Зону.', false, 3, true),
('Монолит', 'Triangle', 'text-purple-400', 'Фанатизм', 'Загадочная секта, поклоняющаяся Монолиту — источнику исполнения желаний. Безжалостны, безрассудны и смертоносны. Никто не знает, кем они были раньше.', false, 4, true),
('Грех', 'Skull', 'text-orange-400', 'Тьма', 'Тайная организация с мистическими ритуалами. Торгуют запрещёнными артефактами и информацией. Встреча с ними — дурной знак.', false, 5, true),
('Бандиты', 'Flame', 'text-yellow-400', 'Мародёрство', 'Отбросы Зоны. Грабят одиночек, торгуют краденым и устраивают засады. Ненавидимы всеми, но живут дольше, чем хотелось бы.', false, 6, true),
('Чистое Небо', 'CloudSun', 'text-cyan-400', 'Исследование', 'Наёмная группировка, стремящаяся остановить расширение Зоны. Изучают аномалии, охотятся за артефактами и противостоят выбросам.', false, 7, true),
('Учёные', 'FlaskConical', 'text-lime-400', 'Наука', 'Гражданские исследователи под эгидой института «Агропром». Не воюют, но знают о Зоне больше всех. Их данные стоят дороже любого артефакта.', false, 8, true);
