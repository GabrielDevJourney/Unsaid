#!/bin/bash
# Usage: ./scripts/test-ls-webhook.sh
# Requires: dev server running on localhost:3000

PAYLOAD_FILE=$(mktemp)

cat > "$PAYLOAD_FILE" << 'EOF'
{"meta":{"event_name":"subscription_created","custom_data":{"user_id":"user_39eoGko5Yt34Ie2ebzrFkDwZfvt"}},"data":{"type":"subscriptions","id":"test-sub-123","attributes":{"customer_id":999,"user_email":"gabspereira178@gmail.com","status":"active","cancelled":false,"trial_ends_at":null,"renews_at":"2026-04-17T10:00:00.000Z","ends_at":null,"variant_id":456,"variant_name":"Monthly","extra_field_from_ls":"should not break","urls":{"update_payment_method":"https://lemonsqueezy.com/billing","customer_portal":"https://lemonsqueezy.com/portal/test"}}}}
EOF

SECRET=$(grep LEMONSQUEEZY_WEBHOOK_SECRET .env.local | cut -d '=' -f2)
SIG=$(openssl dgst -sha256 -hmac "$SECRET" "$PAYLOAD_FILE" | awk '{print $2}')

echo "Sending webhook..."
curl -s -X POST http://localhost:3000/api/webhooks/lemonsqueezy \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIG" \
  --data-binary "@$PAYLOAD_FILE"

echo ""
rm "$PAYLOAD_FILE"
