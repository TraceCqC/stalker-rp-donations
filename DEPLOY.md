# NightZone — деплой на свой хостинг

Стек: **React + Vite + TypeScript** (фронтенд) + **Python 3.11 Serverless Functions** (бэкенд) + **PostgreSQL** (база данных) + **S3-совместимое хранилище** (изображения).

---

## Быстрый старт

### 1. Клонируй репозиторий

```bash
git clone https://github.com/your-org/nightzone.git
cd nightzone
```

### 2. Установи зависимости фронтенда

Нужен **Node.js ≥ 18** и **npm / bun**.

```bash
npm install
# или
bun install
```

### 3. Создай файл переменных окружения

```bash
cp .env.example .env
```

Открой `.env` и заполни все значения (см. секцию «Переменные окружения» ниже).

### 4. Подними базу данных

Нужен **PostgreSQL ≥ 14**. Создай базу:

```sql
CREATE DATABASE nightzone;
```

Применяй миграции по порядку из папки `db_migrations/`:

```bash
psql $DATABASE_URL -f db_migrations/V0001__create_purchases_table.sql
psql $DATABASE_URL -f db_migrations/V0002__add_users_sessions_tables.sql
# ... и так далее все файлы по номеру
```

Или одной командой (bash):

```bash
for f in db_migrations/V*.sql; do
  echo "Applying $f..."
  psql "$DATABASE_URL" -f "$f"
done
```

### 5. Задеплой бэкенд-функции

Каждая папка в `backend/` — это отдельная serverless-функция (`index.py`).  
Задеплой их на любой Python 3.11 serverless-хостинг (Yandex Cloud Functions, AWS Lambda, Timeweb Cloud Functions и т.д.).

После деплоя каждой функции получишь публичный URL — вставь его в `.env` в соответствующую `VITE_FN_*` переменную.

Все функции требуют переменные окружения из секции **BACKEND** (`.env.example`).

### 6. Собери фронтенд

```bash
npm run build
```

Статика появится в папке `dist/`. Загрузи её на хостинг (Nginx, Vercel, Netlify, GitHub Pages и т.д.).

### 7. Настрой веб-сервер

Фронтенд — SPA (Single Page Application). Nginx нужно настроить так, чтобы все маршруты отдавали `index.html`:

```nginx
server {
    listen 80;
    server_name nightzone.shop;
    root /var/www/nightzone/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Для HTTPS — используй Certbot / Let's Encrypt.

---

## Переменные окружения

Все переменные описаны в `.env.example`. Краткая шпаргалка:

### Фронтенд (VITE_*)

| Переменная | Описание |
|---|---|
| `VITE_SITE_URL` | Публичный URL сайта, например `https://nightzone.shop` |
| `VITE_FN_AUTH_ME` | URL функции `auth-me` |
| `VITE_FN_AUTH_LOGOUT` | URL функции `auth-logout` |
| `VITE_FN_STEAM_CALLBACK` | URL функции `steam-callback` |
| `VITE_FN_SHOP_ITEMS` | URL функции `shop-items` |
| `VITE_FN_SHOP_APPLY_PROMO` | URL функции `shop-apply-promo` |
| `VITE_FN_ADMIN_ITEMS` | URL функции `admin-items` |
| `VITE_FN_ADMIN_NEWS` | URL функции `admin-news` |
| `VITE_FN_UPLOAD_IMAGE` | URL функции `upload-image` |
| `VITE_FN_ADMIN_FACTIONS` | URL функции `admin-factions` |
| `VITE_FN_ADMIN_PROMOS` | URL функции `admin-promocodes` |
| `VITE_FN_ADMIN_CATEGORIES` | URL функции `admin-categories` |

> `VITE_*` переменные встраиваются в JS-бандл при сборке. Не клади сюда секреты!

### Бэкенд (серверные)

| Переменная | Описание | Где взять |
|---|---|---|
| `DATABASE_URL` | PostgreSQL строка подключения | Панель хостинга БД |
| `MAIN_DB_SCHEMA` | Схема PostgreSQL | Задай сам, например `public` |
| `STEAM_API_KEY` | Steam Web API ключ | [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) |
| `SITE_URL` | URL сайта для Steam OpenID | Твой домен |
| `AWS_ACCESS_KEY_ID` | Ключ S3-хранилища | Панель хостинга хранилища |
| `AWS_SECRET_ACCESS_KEY` | Секрет S3-хранилища | Панель хостинга хранилища |
| `AWS_S3_ENDPOINT` | Endpoint S3 | Панель хостинга хранилища |
| `AWS_S3_BUCKET` | Имя бакета | Создай в панели хранилища |
| `ROBOKASSA_LOGIN` | Логин магазина Robokassa | [merchant.robokassa.ru](https://merchant.robokassa.ru) |
| `ROBOKASSA_PASS1` | Пароль #1 Robokassa | Настройки → Технические |
| `ROBOKASSA_PASS2` | Пароль #2 Robokassa | Настройки → Технические |

---

## Структура проекта

```
nightzone/
├── src/                    # Фронтенд (React + TypeScript)
│   ├── pages/              # Страницы: Index, Shop, Admin, Cabinet, SteamCallback
│   ├── hooks/              # use-auth.ts — авторизация через Steam
│   ├── components/ui/      # shadcn/ui компоненты
│   └── App.tsx             # Маршруты
├── backend/                # Серверные функции (Python 3.11)
│   ├── auth-me/            # Получить текущего пользователя
│   ├── auth-logout/        # Выход
│   ├── steam-login/        # Редирект на Steam OpenID
│   ├── steam-callback/     # Обработка ответа Steam
│   ├── shop-items/         # Список товаров и категорий
│   ├── shop-apply-promo/   # Применение промокода
│   ├── shop-create-order/  # Создание заказа (Robokassa)
│   ├── shop-robokassa-webhook/ # Вебхук подтверждения оплаты
│   ├── upload-image/       # Загрузка изображений в S3
│   ├── admin-items/        # CRUD товаров
│   ├── admin-news/         # CRUD новостей
│   ├── admin-factions/     # CRUD фракций
│   ├── admin-promocodes/   # CRUD промокодов
│   ├── admin-categories/   # CRUD категорий магазина
│   └── server-status/      # Статус DayZ-сервера (A2S Protocol)
├── db_migrations/          # SQL-миграции (применять по порядку V0001→...)
├── .env.example            # Шаблон переменных окружения
├── .gitignore
├── package.json
└── vite.config.ts
```

---

## Добавление первого администратора

После первого входа через Steam найди свой `steam_id` в таблице `users` и выполни:

```sql
-- Замени '76561198000000000' на свой Steam ID
UPDATE your_schema.users SET is_admin = TRUE WHERE steam_id = '76561198000000000';
INSERT INTO your_schema.admins (steam_id) VALUES ('76561198000000000') ON CONFLICT DO NOTHING;
```

---

## Маршруты сайта

| URL | Страница |
|---|---|
| `/` | Главная |
| `/shop` | Магазин |
| `/cabinet` | Личный кабинет |
| `/admin` | Панель администратора (только для admins) |
| `/steam-auth` | Callback Steam OAuth (не посещать вручную) |

---

## Зависимости фронтенда

Основные пакеты (`package.json`):

- **React 18** + **React DOM** — UI фреймворк
- **Vite** — сборщик
- **TypeScript** — типизация
- **TailwindCSS 3** — стили
- **shadcn/ui** (через @radix-ui/*) — UI-компоненты
- **react-router-dom 6** — маршрутизация
- **lucide-react** — иконки
- **@tanstack/react-query** — кэширование запросов
- **react-hook-form** + **zod** — формы и валидация
- **date-fns** — работа с датами

## Зависимости бэкенда (Python)

Каждая функция имеет свой `requirements.txt`. Общие зависимости:

```
psycopg2-binary>=2.9.0   # PostgreSQL драйвер
boto3>=1.26.0            # S3 / AWS SDK
requests>=2.31.0         # HTTP-запросы (steam-callback)
```

---

## Безопасность

- `.env` добавлен в `.gitignore` — секреты не попадут в репозиторий
- `VITE_*` переменные встраиваются в бандл — содержат только публичные URL функций, не секреты
- Все секреты (DATABASE_URL, API ключи, пароли) хранятся только на сервере в переменных окружения
- Проверка прав администратора происходит на бэкенде через сессию, не на фронтенде
- Steam авторизация использует официальный OpenID протокол
