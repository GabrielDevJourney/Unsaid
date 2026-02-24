#!/bin/bash

echo "VERCEL_ENV=$VERCEL_ENV"
echo "VERCEL_GIT_PULL_REQUEST_ID=$VERCEL_GIT_PULL_REQUEST_ID"

# Allow production builds
if [ "$VERCEL_ENV" = "production" ]; then
  echo "Production build → proceed"
  exit 1
fi

# Allow PR builds
if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
  echo "PR build → proceed"
  exit 1
fi

# Otherwise skip
echo "Not PR or production → skipping build"
exit 0