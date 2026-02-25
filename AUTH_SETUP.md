# Настройка аутентификации (Google OAuth)

Инструкция по настройке NextAuth с провайдером Google для AdTextStore.

## 1. Google Cloud Console

1. Открой [Google Cloud Console](https://console.cloud.google.com/)
2. Создай проект или выбери существующий
3. Перейди в **APIs & Services** → **Credentials**

## 2. OAuth 2.0 Client ID

1. Нажми **Create Credentials** → **OAuth client ID**
2. Тип приложения: **Web application**
3. Имя: например, `AdTextStore`
4. **Authorized JavaScript origins**:
   - Локально: `http://localhost:3000`
   - Production: `https://твой-проект.vercel.app`
5. **Authorized redirect URIs**:
   - Локально: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://твой-проект.vercel.app/api/auth/callback/google`
6. Нажми **Create**
7. Скопируй **Client ID** и **Client Secret**

## 3. Переменные окружения

Добавь в `.env` (локально) или в настройках Vercel:

| Переменная | Описание | Пример |
|------------|----------|--------|
| `GOOGLE_CLIENT_ID` | Client ID из Google Console | `123456789-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret из Google Console | `GOCSPX-xxxxxxxxxxxx` |
| `AUTH_SECRET` | Секрет для подписи JWT/сессий | Сгенерируй: `openssl rand -base64 32` |

### Генерация AUTH_SECRET (PowerShell)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Или используй [generate-secret.vercel.app](https://generate-secret.vercel.app/32).

### Альтернативные имена

- `NEXTAUTH_SECRET` — NextAuth также принимает это имя вместо `AUTH_SECRET`

## 4. NEXTAUTH_URL (опционально)

- **Локально**: обычно не нужен, NextAuth подставляет `http://localhost:3000`
- **Vercel**: не нужен, определяется автоматически
- **Кастомный домен**: задай явно, например `https://prostore.example.com`

## 5. Деплой на Vercel

В **Project Settings** → **Environment Variables** добавь:

```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
AUTH_SECRET=xxx
```

И **Authorized redirect URIs** в Google Console должен содержать URL твоего Vercel-проекта.

## 6. Проверка

1. Запусти локально: `npm run dev`
2. Открой http://localhost:3000/login
3. Нажми «Войти через Google»
4. После входа должен открыться `/dashboard`

## 7. Частые ошибки

| Ошибка | Решение |
|--------|---------|
| `redirect_uri_mismatch` | Добавь точный redirect URI в Google Console |
| `invalid_client` | Проверь `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` |
| `[auth][error]` | Проверь `AUTH_SECRET`, перезапусти сервер |
| 401 на защищённых страницах | Убедись, что `AUTH_SECRET` задан |
