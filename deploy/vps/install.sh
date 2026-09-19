#!/bin/sh
# Instala Culpeo en un VPS Ubuntu (Node 22 + Caddy + systemd).
# Uso, como root, con el código ya en /opt/culpeo:
#   sh deploy/vps/install.sh culpeo.sicr3p.cl

set -eu
DOMAIN="${1:-culpeo.sicr3p.cl}"
ROOT="${CULPEO_ROOT:-/opt/culpeo}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Corre este script como root."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Instala Node 22 antes."
  exit 1
fi

if ! command -v caddy >/dev/null 2>&1; then
  apt-get update
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

mkdir -p /etc/culpeo
if [ ! -f /etc/culpeo/env ]; then
  cp "$ROOT/deploy/vps/env" /etc/culpeo/env
  chmod 600 /etc/culpeo/env
fi

sed "s/culpeo.sicr3p.cl/$DOMAIN/g" "$ROOT/deploy/vps/Caddyfile" \
  >/etc/caddy/Caddyfile

install -m 644 "$ROOT/deploy/vps/culpeo.service" /etc/systemd/system/culpeo.service

cd "$ROOT"
if [ ! -f "$ROOT/.output/server/index.mjs" ]; then
  npm ci
  npm run build:vps
fi

systemctl daemon-reload
systemctl enable --now culpeo
systemctl reload caddy

echo "Culpeo en https://$DOMAIN"
echo "Edita /etc/culpeo/env y pon XAI_API_KEY para que hable."
