#!/bin/bash
echo "TESTE: $TESTE"
if [ "$VERCEL_ENV" = "preview" ]; then
  echo "Preview: usando .env.development"
  cp .env.development .env.production
fi