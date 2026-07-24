# 与哲对话 (Talk to God)

哲学家人格化 AI 对话产品 — H5 / Web / 小程序（MVP 阶段先实现 Web/H5）。

## 项目结构

```
talk-to-god/
├── apps/web/          # React + Vite 前端（Web / H5 响应式）
├── server/            # Fastify API 后端
├── packages/shared/   # 共享 TypeScript 类型
├── 产品文档.md
└── 技术评估参考.md
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入 LLM_API_KEY（支持 OpenAI 兼容接口）
```

### 3. 初始化数据库

```bash
pnpm db:migrate
pnpm db:seed
```

### 4. 启动开发服务

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:server   # http://localhost:3002
pnpm dev:web      # http://localhost:5180
```

## MVP 功能

- [x] 哲学家图鉴（列表、筛选、搜索、详情）
- [x] 与哲学家对话（SSE 流式输出）
- [x] 会话列表与历史记录
- [x] 游客模式（localStorage 标识）
- [x] 8 位种子哲学家（尼采、苏格拉底、孔子、老子、柏拉图、康德、庄子、萨特）
- [x] 登录/注册（手机号 + 密码，JWT，游客会话合并）
- [x] 后台哲学家配置（Admin CMS）

## 后台管理

1. 在 `.env` 中设置 `ADMIN_SECRET=你的密钥`
2. 访问 http://localhost:5180/admin
3. 输入密钥后即可增删改哲学家信息

可配置字段：姓名、简介、流派、核心概念、代表著作、开场白、**系统提示词（人设 Prompt）**、头像 URL 等。前台图鉴与对话会实时读取数据库最新配置。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite + Tailwind CSS 4 + React Router |
| 后端 | Fastify + TypeScript |
| 数据库 | SQLite（开发）/ 可迁移 PostgreSQL |
| AI | OpenAI 兼容 API（SSE 流式） |

## 部署到腾讯云

目标服务器：**81.70.46.23**（第一台轻量服务器）

### 1. 配置 SSH 登录

在腾讯云控制台 → 轻量服务器 → 密钥/密码，绑定你的 SSH 公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

将输出内容添加到服务器。本地测试：

```bash
ssh root@81.70.46.23
```

### 2. 首次初始化服务器（只需一次）

```bash
scp deploy/server-bootstrap.sh root@81.70.46.23:/tmp/
ssh root@81.70.46.23 'bash /tmp/server-bootstrap.sh'
```

### 3. 配置生产环境变量

确保本地 `.env` 已填写 `LLM_API_KEY` 等，或参考 `deploy/env.production.example`。

**重要**：部署后 `.env` 中 `CORS_ORIGIN` 会自动改为 `http://81.70.46.23`。

### 4. 一键部署

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

自定义服务器：

```bash
DEPLOY_HOST=81.70.46.23 DEPLOY_USER=root ./deploy/deploy.sh
```

### 5. 安全组

在腾讯云防火墙中放行 **80**（HTTP）端口。

### 部署架构

```
Nginx :80  →  静态前端 (apps/web/dist)
          →  /api/* 反代到 Node :3002 (PM2)
SQLite 数据  →  server/data/talk-to-god.db
```

访问地址：
- 前台：http://81.70.46.23
- 后台：http://81.70.46.23/admin

## 部署参考（腾讯云）

- **Web/H5**：部署到第一台服务器（81.70.46.23），Nginx 反代
- **API**：同服务器或独立部署，配置 `CORS_ORIGIN`
- **静态资源**：腾讯云 COS（lhcos）存储哲学家头像等
- **小程序**：后续使用 Taro 接入，共享同一套 API

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/philosophers` | 哲学家列表 |
| GET | `/api/philosophers/:id` | 哲学家详情 |
| GET | `/api/conversations` | 会话列表 |
| POST | `/api/conversations` | 创建会话 |
| GET | `/api/conversations/:id/messages` | 消息历史 |
| POST | `/api/chat/:conversationId` | 发送消息（SSE 流式） |
| POST | `/api/auth/register` | 注册（自动合并游客会话） |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户信息 |
| POST | `/api/auth/logout` | 退出（客户端清除 token） |
| DELETE | `/api/conversations/:id` | 删除会话 |
| GET | `/api/admin/philosophers` | 后台：哲学家列表（含 Prompt） |
| GET | `/api/admin/philosophers/:id` | 后台：哲学家详情 |
| POST | `/api/admin/philosophers` | 后台：新增哲学家 |
| PUT | `/api/admin/philosophers/:id` | 后台：更新哲学家 |
| DELETE | `/api/admin/philosophers/:id` | 后台：删除哲学家 |

> 后台接口需在请求头携带 `X-Admin-Key: <ADMIN_SECRET>`

## 后续规划

- v1.1：登录体系、分享卡片
- v1.2：会话管理增强、摘要记忆
- 小程序端（Taro）
- ~~哲学家 CMS 后台~~（已完成）
- 腾讯云 COS 头像上传
