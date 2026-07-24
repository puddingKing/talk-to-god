#!/usr/bin/env bash
# 本地执行：构建并部署到腾讯云服务器
# 用法：./deploy/deploy.sh
# 可选：DEPLOY_HOST=81.70.46.23 SSH_KEY=~/.ssh/your.pem ./deploy/deploy.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_HOST="${DEPLOY_HOST:-81.70.46.23}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/talk-to-god}"
SSH_KEY="${SSH_KEY:-/Users/shane/dev/private/cloud-key/luca_for_beijing.pem}"
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
SSH_CMD=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)
RSYNC_SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new"

VITE_BASE_PATH="${VITE_BASE_PATH:-/talk-to-god/}"

echo ">>> 本地构建 (base=${VITE_BASE_PATH})..."
cd "$ROOT_DIR"
corepack pnpm install
VITE_BASE_PATH="$VITE_BASE_PATH" corepack pnpm build

echo ">>> 同步文件到 ${SSH_TARGET}:${DEPLOY_DIR} ..."
"${SSH_CMD[@]}" "$SSH_TARGET" "mkdir -p ${DEPLOY_DIR}"

rsync -avz -e "$RSYNC_SSH" --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude server/data \
  --exclude .env \
  --exclude '*.db' \
  --exclude '*.db-*' \
  "$ROOT_DIR/" "${SSH_TARGET}:${DEPLOY_DIR}/"

echo ">>> 同步生产环境配置..."
if [[ -f "$ROOT_DIR/.env" ]]; then
  rsync -avz -e "$RSYNC_SSH" "$ROOT_DIR/.env" "${SSH_TARGET}:${DEPLOY_DIR}/.env"
else
  echo "警告：本地无 .env，请确保服务器 ${DEPLOY_DIR}/.env 已配置"
fi

echo ">>> 远程安装依赖并启动..."
"${SSH_CMD[@]}" "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
cd ${DEPLOY_DIR}

if ! command -v pnpm >/dev/null 2>&1; then
  echo "请先运行 deploy/server-bootstrap.sh 初始化服务器"
  exit 1
fi

pnpm install --frozen-lockfile 2>/dev/null || pnpm install
VITE_BASE_PATH=${VITE_BASE_PATH:-/talk-to-god/} pnpm build
pnpm db:migrate
pnpm db:seed

# Nginx
cp deploy/nginx-talk-to-god.conf /etc/nginx/conf.d/talk-to-god.conf 2>/dev/null || \\
  cp deploy/nginx-talk-to-god.conf /etc/nginx/sites-available/talk-to-god.conf
if [[ -d /etc/nginx/sites-enabled ]]; then
  ln -sf /etc/nginx/sites-available/talk-to-god.conf /etc/nginx/sites-enabled/talk-to-god.conf
fi
nginx -t && (systemctl reload nginx 2>/dev/null || systemctl start nginx)

# PM2
pm2 startOrReload deploy/ecosystem.config.cjs
pm2 save

# 更新 CORS 为当前 IP（如 .env 仍是 localhost）
if grep -q 'CORS_ORIGIN=http://localhost' .env 2>/dev/null; then
  sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=http://${DEPLOY_HOST}|' .env
  pm2 restart talk-to-god-api
fi

echo ">>> 部署完成"
curl -s http://127.0.0.1:3002/api/health || true
REMOTE

echo ""
echo "=========================================="
echo "  部署成功！"
echo "  访问: http://${DEPLOY_HOST}"
echo "  后台: http://${DEPLOY_HOST}/admin"
echo "=========================================="
