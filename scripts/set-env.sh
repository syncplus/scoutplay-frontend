#!/bin/bash
if [ "$VERCEL_ENV" = "preview" ]; then
  echo "Preview: usando .env.development"
  cp .env.development .env.production
fi

set -a; source .env.production; set +a
