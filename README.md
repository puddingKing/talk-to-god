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
pnpm dev:server   # http://localhost:3001
pnpm dev:web      # http://localhost:5173
```

## MVP 功能

- [x] 哲学家图鉴（列表、筛选、搜索、详情）
- [x] 与哲学家对话（SSE 流式输出）
- [x] 会话列表与历史记录
- [x] 游客模式（localStorage 标识）
- [x] 8 位种子哲学家（尼采、苏格拉底、孔子、老子、柏拉图、康德、庄子、萨特）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite + Tailwind CSS 4 + React Router |
| 后端 | Fastify + TypeScript |
| 数据库 | SQLite（开发）/ 可迁移 PostgreSQL |
| AI | OpenAI 兼容 API（SSE 流式） |

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
| DELETE | `/api/conversations/:id` | 删除会话 |

## 后续规划

- v1.1：登录体系、分享卡片
- v1.2：会话管理增强、摘要记忆
- 小程序端（Taro）
- 哲学家 CMS 后台
- 腾讯云 COS 头像上传
