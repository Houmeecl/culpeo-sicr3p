#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
OUT="${1:-/tmp/culpeo-proveedor-vps.tar.gz}"
tar -czf "$OUT" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.output \
  --exclude=.vercel \
  --exclude=screenshots \
  --exclude=artifacts \
  --exclude=attachments \
  --exclude=.grok \
  --exclude=dist \
  .
echo "$OUT"
