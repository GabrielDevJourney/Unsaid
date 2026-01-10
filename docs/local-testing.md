# Local Testing Guide

This guide covers how to test webhooks and payment flows locally using ngrok.

## Prerequisites

- Node.js 20+
- ngrok installed (`brew install ngrok`)
- Local Supabase or connection to dev database
- Clerk development instance
- Lemon Squeezy test mode access

## Quick Start

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok tunnel
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`)

---

## Webhook Configuration

### Clerk Webhook (User Creation)

1. Go to **Clerk Dashboard** → **Webhooks**
2. Add endpoint: `https://<ngrok-url>/api/webhooks/clerk`
3. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy **Signing Secret** to `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET=<signing-secret>
   ```

### Lemon Squeezy Webhook (Payments)

1. Go to **Lemon Squeezy Dashboard** → **Settings** → **Webhooks**
2. Add endpoint: `https://<ngrok-url>/api/webhooks/lemonsqueezy`
3. Generate signing secret (use `openssl rand -hex 32`) in terminal
4. Enter the same secret in both:
   - Lemon Squeezy webhook config
   - `.env.local`:
     ```bash
     LEMONSQUEEZY_WEBHOOK_SECRET=<same-secret>
     ```
5. Select events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_resumed`
   - `subscription_expired`
   - `subscription_paused`
   - `subscription_unpaused`

---

## Testing Flows

### Test User Creation

1. Sign out of the app
2. Sign up with a new test account
3. Watch terminal for webhook logs
4. Verify user created in Supabase `users` table
5. Verify subscription created in `subscriptions` table (status: `trial`)

### Test Checkout Flow

1. Log in to local app (`localhost:3000`)
2. Open browser DevTools → Console
3. Generate checkout URL:
   ```javascript
   fetch('/api/payments/checkout', { method: 'POST' })
     .then(r => r.json())
     .then(d => window.open(d.data.url))
   ```
4. Complete purchase with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/35`)
   - CVC: Any 3 digits (e.g., `123`)
5. Watch terminal for webhook logs
6. Verify in Supabase:
   - `subscriptions.status` → `active`
   - `subscriptions.lemon_subscription_id` populated
   - `subscriptions.customer_portal_url` populated
   - `payment_events` table has event logged

### Test Subscription Status

```javascript
// In browser console (while logged in)
fetch('/api/subscription')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "data": {
    "status": "active",
    "trialEndsAt": "...",
    "currentPeriodEnd": "...",
    "canceledAt": null,
    "access": {
      "canUseFeatures": true,
      "canViewEntries": true,
      "canExportData": true,
      "status": "active",
      "trialDaysRemaining": null,
      "isTrialExpired": false
    }
  }
}
```

### Test Subscription Events (Cancel, Pause, Resume)

1. Go to **Lemon Squeezy Dashboard** → **Subscriptions**
2. Find your test subscription
3. Use **"Simulate webhook"** or manually cancel/pause
4. Watch terminal for webhook processing
5. Verify status updates in Supabase

---

## Environment Variables

Required in `.env.local` for local testing:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=<your-dev-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<service-role-key>

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<dev-publishable-key>
CLERK_SECRET_KEY=<dev-secret-key>
CLERK_WEBHOOK_SECRET=<from-clerk-webhook>

# Payments
LEMONSQUEEZY_WEBHOOK_SECRET=<your-generated-secret>
LEMONSQUEEZY_VARIANT_ID=<uuid-from-share-link>
LEMONSQUEEZY_STORE_URL=https://your-store.lemonsqueezy.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Troubleshooting

### Webhook returns 500

- Check terminal logs for actual error
- Verify `SUPABASE_SECRET_KEY` is set (needed for admin client)
- Verify user exists in local database

### Webhook returns 400 "Invalid signature"

- Verify webhook secret matches in both places
- Make sure you're using the correct secret for each service

### User not found in webhook

- Clerk webhook might not be configured for local
- User exists in production but not local database
- Sign up again locally to create user

### ngrok URL changed

ngrok generates a new URL each restart (free plan). Update:
1. Clerk webhook URL
2. Lemon Squeezy webhook URL

### Checkout URL returns 404

- In test mode, use the UUID from product **Share** link, not variant ID
- Example: `34ad3c7b-73c0-493c-b495-ba84a21fde7a` not `1205047`

---

## Test Cards (Lemon Squeezy)

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `5555 5555 5555 4444` | Success (Mastercard) |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0027 6000 3184` | 3D Secure |

---

## Production vs Local

| Aspect | Local | Production |
|--------|-------|------------|
| Webhook URL | ngrok tunnel | `byunsaid.com` |
| Database | Local/dev Supabase | Production Supabase |
| Clerk | Development instance | Production instance |
| Lemon Squeezy | Test mode | Live mode (after activation) |
| Env vars | `.env.local` | Vercel env vars |
