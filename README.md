# AdTextStore

Минимальный проект Next.js (App Router) + Prisma + NeonDB, готовый к деплою на Vercel.

## Быстрый старт

### 1. Установка зависимостей

```powershell
npm install
```

### 2. Настройка .env

Скопируй `.env.example` в `.env` и подставь строки подключения из [Neon Console](https://console.neon.tech):

```powershell
Copy-Item .env.example .env
# Отредактируй .env вручную
```

### 3. Миграция и seed

```powershell
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Запуск

```powershell
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## Деплой на Vercel

1. Подключи репозиторий к Vercel.
2. Добавь переменные окружения в настройках проекта:
   - `DATABASE_URL` — pooled connection string из Neon
   - `DIRECT_URL` — direct connection string из Neon
3. Build Command: `npm run build` (по умолчанию)
4. После деплоя выполни миграции и seed на production БД:

```powershell
$env:DATABASE_URL="твоя_production_url"
$env:DIRECT_URL="твоя_production_direct_url"
npx prisma migrate deploy
npx prisma db seed
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Режим разработки |
| `npm run build` | Сборка (Prisma generate + Next build) |
| `npm run start` | Запуск production |
| `npx prisma migrate dev` | Миграция (dev) |
| `npx prisma migrate deploy` | Миграция (production) |
| `npx prisma db seed` | Заполнение БД |
| `npx prisma studio` | UI для просмотра БД |
