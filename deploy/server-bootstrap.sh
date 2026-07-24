#!/usr/bin/env bash
# 在腾讯云服务器上首次执行（需 root 或 sudo）
set -euo pipefail

echo ">>> 安装基础依赖..."
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y curl git nginx build-essential python3
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y curl git nginx gcc-c++ make python3
elif command -v yum >/dev/null 2>&1; then
  yum install -y curl git nginx gcc-c++ make python3
else
  echo "不支持的系统，请手动安装 node/nginx/git"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo ">>> 安装 Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  if command -v apt-get >/dev/null 2>&1; then
    apt-get install -y nodejs
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y nodejs
  else
    yum install -y nodejs
  fi
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo ">>> 安装 PM2..."
  npm install -g pm2
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo ">>> 安装 pnpm..."
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi

mkdir -p /var/www/talk-to-god/server/data

echo ">>> 基础环境就绪"
node -v
pnpm -v
pm2 -v
nginx -v
