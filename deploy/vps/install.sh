#!/bin/sh
# Paquete oficial Culpeo — Proveedor Regional
# En el VPS, como root:
#   curl -fsSL https://raw.githubusercontent.com/Houmeecl/culpeo-sicr3p/main/deploy/vps/install.sh | sh
# o, si ya está el código:
#   sh /opt/culpeo/deploy/vps/install.sh

set -eu

DOMAIN="${CULPEO_DOMAIN:-culpeo.sicr3p.cl}"
ROOT="${CULPEO_ROOT:-/opt/culpeo}"
REPO="${CULPEO_REPO:-https://github.com/Houmeecl/culpeo-sicr3p.git}"
USER_NAME="culpeo"

if [ "$(id -u)" -ne 0 ]; then
  echo "Corre como root."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git gnupg debian-keyring debian-archive-keyring apt-transport-https

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE '^v2[2-9]'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -y
  apt-get install -y caddy
fi

if ! id "$USER_NAME" >/dev/null 2>&1; then
  useradd --system --home "$ROOT" --shell /usr/sbin/nologin "$USER_NAME"
fi

if [ ! -f "$ROOT/package.json" ]; then
  mkdir -p "$ROOT"
  git clone --depth 1 "$REPO" "$ROOT"
fi

chown -R "$USER_NAME:$USER_NAME" "$ROOT"

mkdir -p /etc/culpeo
if [ ! -f /etc/culpeo/env ]; then
  cp "$ROOT/deploy/vps/env" /etc/culpeo/env
  chmod 600 /etc/culpeo/env
fi

sed "s/culpeo.sicr3p.cl/$DOMAIN/g" "$ROOT/deploy/vps/Caddyfile" >/etc/caddy/Caddyfile

NODE_BIN="$(command -v node)"
sed "s#/usr/bin/node#$NODE_BIN#g" "$ROOT/deploy/vps/culpeo.service" \
  >/etc/systemd/system/culpeo.service

cd "$ROOT"
sudo -u "$USER_NAME" -H npm ci
sudo -u "$USER_NAME" -H npm run build:vps
chown -R "$USER_NAME:$USER_NAME" "$ROOT"

if command -v ufw >/dev/null 2>&1; then
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
fi

systemctl daemon-reload
systemctl enable --now caddy
systemctl enable --now culpeo
systemctl reload caddy || systemctl restart caddy
systemctl restart culpeo

echo
echo "Culpeo quedó en https://$DOMAIN/seleccion"
echo "Para que hable, edita /etc/culpeo/env y pon XAI_API_KEY, luego:"
echo "  systemctl restart culpeo"
