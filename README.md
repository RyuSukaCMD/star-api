# ⭐ StarNova API

> High Performance REST API Platform — Production Ready, Scalable, Secure.

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [WhatsApp Bot](#whatsapp-bot)
- [Contributing](#contributing)

---

## 🌌 Overview

StarNova API is a production-ready REST API platform built with Node.js, Express, MongoDB, and Redis. It provides a modular plugin-based architecture for building scalable APIs with built-in authentication, rate limiting, logging, caching, and more.

**Base URL:** `https://api.starnova.my.id/api/v1`  
**Dashboard:** `https://dash.starnova.my.id`

---

## ✨ Features

### Core
- 🚀 **High Performance** — Optimized with Redis caching, compression, clustering
- 🔐 **Secure** — JWT auth, API keys, Helmet, rate limiting, input sanitization
- 📦 **Modular** — Plugin-based module system for easy endpoint addition
- 📊 **Analytics** — Real-time request tracking and usage analytics
- 📝 **Logging** — Structured logging with Winston and MongoDB storage
- 🔄 **Auto Documentation** — OpenAPI/Swagger documentation generation
- 🌐 **CORS Ready** — Configurable cross-origin support

### Authentication
- JWT Token-based authentication
- API Key system (format: `snv_xxxxxxxxxxxx`)
- Role-based access control (user, admin, owner)
- Refresh token rotation
- IP whitelisting for API keys

### API Management
- Create, delete, enable/disable, regenerate API keys
- Daily and monthly usage limits per key
- Usage tracking and monitoring
- Webhook notifications

### Payment Integration
- Midtrans
- Xendit
- Manual payment (QRIS, Bank Transfer, etc.)
- Automated API key generation on payment success

### Admin Dashboard API
- User management (view, ban, unban)
- API key management
- System settings management
- Analytics and logs
- Maintenance mode

### WhatsApp Bot Integration
- Owner commands for API management
- Real-time database synchronization
- Command: `.createapikey`, `.listapikey`, `.delapikey`, `.regenapikey`, etc.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
├───────────────────┬───────────────────┬─────────────────┤
│   Web Dashboard   │  Mobile App      │   Third Party    │
└─────────┬─────────┴─────────┬─────────┴────────┬────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                    │
│                    (SSL + Rate Limit)                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Express.js Application                   │
├───────────┬───────────┬───────────┬─────────────────────┤
│  Auth     │  API Key  │  Modules  │  Admin              │
│  System   │  System   │  (Plugin) │  Dashboard          │
├───────────┴───────────┴───────────┴─────────────────────┤
│              Middleware Pipeline                         │
│  Helmet → CORS → Rate Limit → Auth → Validation → Cache │
└────────────┬────────────────────────────────┬───────────┘
             │                                │
             ▼                                ▼
┌─────────────────────┐          ┌─────────────────────┐
│     MongoDB         │          │     Redis            │
│  (Primary Storage)  │          │   (Cache + Session)  │
└─────────────────────┘          └─────────────────────┘
```

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                   Routes (HTTP Layer)                │
│         Route definitions, middleware binding         │
├─────────────────────────────────────────────────────┤
│                Controllers (Request Layer)            │
│         Request handling, response formatting         │
├─────────────────────────────────────────────────────┤
│                 Services (Business Layer)             │
│         Business logic, orchestration                 │
├─────────────────────────────────────────────────────┤
│               Repositories (Data Layer)               │
│         Database operations, caching abstraction      │
├─────────────────────────────────────────────────────┤
│                   Models (Schema Layer)               │
│         Mongoose schemas, indexes, relationships      │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
starnova-api/
├── src/
│   ├── config/           # Configuration & environment
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Mongoose models
│   ├── routes/           # Route definitions
│   ├── validators/       # Zod validation schemas
│   ├── database/         # Database connections & seeding
│   ├── utils/            # Helper utilities
│   ├── plugins/          # Plugin loader system
│   ├── modules/          # Feature modules (plugins)
│   │   ├── ai/           # AI endpoints
│   │   ├── downloader/   # Media downloader
│   │   ├── search/       # Search endpoints
│   │   ├── image/        # Image processing
│   │   ├── text/         # Text processing
│   │   ├── utility/      # Utility endpoints
│   │   └── brat/         # Brat generator
│   ├── types/            # TypeScript type definitions
│   └── server.ts         # Application entry point
├── tests/                # Unit & integration tests
├── scripts/              # Utility scripts
├── logs/                 # Log files (gitignored)
├── uploads/              # Uploaded files (gitignored)
├── .env.example          # Environment example
├── Dockerfile            # Docker build
├── docker-compose.yml    # Docker services
├── ecosystem.config.js   # PM2 configuration
├── nginx.conf            # Nginx configuration
└── vercel.json           # Vercel deployment config
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0 (optional, falls back gracefully)
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/starnova-api.git
cd starnova-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run database seed
npm run seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000/api/v1`

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build standalone
docker build -t starnova-api .
docker run -p 5000:5000 --env-file .env starnova-api
```

### Using PM2

```bash
# Build the project
npm run build

# Start with PM2
npm run start:pm2

# Or manually
pm2 start ecosystem.config.js --env production
```

---

## 🚢 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker (VPS)

```bash
# On your VPS
git clone https://github.com/yourusername/starnova-api.git
cd starnova-api

# Configure environment
cp .env.example .env
nano .env

# Deploy with Docker
docker-compose up -d
```

### Nginx Reverse Proxy

1. Copy `nginx.conf` to `/etc/nginx/nginx.conf`
2. Update SSL certificate paths
3. Restart Nginx: `sudo systemctl restart nginx`

---

## 📚 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login with credentials |
| `/auth/refresh` | POST | Refresh JWT token |
| `/auth/forgot-password` | POST | Request password reset |
| `/auth/reset-password` | POST | Reset password |
| `/auth/profile` | GET | Get user profile |
| `/auth/logout` | POST | Logout |

### API Keys

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/apikeys` | GET | List all API keys |
| `/apikeys` | POST | Create new API key |
| `/apikeys/:id` | GET | Get API key details |
| `/apikeys/:id` | PUT | Update API key |
| `/apikeys/:id` | DELETE | Delete API key |
| `/apikeys/:id/toggle` | PATCH | Toggle API key status |
| `/apikeys/:id/regenerate` | POST | Regenerate API key |

### Modules

| Module | Prefix | Endpoints |
|--------|--------|-----------|
| AI | `/ai` | Chat, Generate |
| Downloader | `/downloader` | TikTok, YouTube, Instagram |
| Search | `/search` | Web, Images |
| Image | `/image` | Analyze, Convert |
| Text | `/text` | Summarize, Translate, Detect Language |
| Utility | `/utility` | QR Code, URL Shortener, Weather |
| Brat | `/brat` | Generate |

### Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/stats` | GET | Dashboard statistics |
| `/admin/users` | GET | List users |
| `/admin/users/:id` | GET | User details |
| `/admin/users/:id/ban` | POST | Ban user |
| `/admin/users/:id/unban` | POST | Unban user |
| `/admin/apikeys` | GET | List all API keys |
| `/admin/analytics` | GET | Analytics data |
| `/admin/settings` | GET | System settings |
| `/admin/settings` | POST | Update setting |
| `/admin/maintenance` | POST | Toggle maintenance |
| `/admin/logs` | GET | System logs |

### Response Format

All endpoints return a consistent response format:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔌 Modules

Modules are plug-and-play feature extensions. Each module follows the same structure:

```
modules/module-name/
├── index.ts          # Module definition with routes
├── controller.ts     # Request handlers
├── service.ts        # Business logic
├── validator.ts      # Zod validation schemas
└── repository.ts     # Data access
```

### Creating a New Module

```typescript
// modules/example/index.ts
import { Router } from 'express';
import { authenticateApiKey } from '../../middlewares/auth';
import { successResponse } from '../../utils/helpers';

const router = Router();
router.use(authenticateApiKey);

router.get('/hello', (req, res) => {
  res.json(successResponse({ message: 'Hello from example module!' }));
});

export default {
  name: 'example',
  version: '1.0.0',
  description: 'Example module',
  enabled: true,
  routes: router,
  prefix: '/example',
};
```

---

## 🔒 Security

- **Helmet** — Security headers (CSP, HSTS, etc.)
- **Rate Limiting** — Per-IP and per-API-key limits
- **JWT Authentication** — Secure token-based auth
- **API Key System** — Scoped keys with permissions
- **Input Validation** — Zod schema validation
- **MongoDB Sanitization** — Prevents NoSQL injection
- **CORS** — Configurable cross-origin policy
- **AES Encryption** — For sensitive data
- **HTTPS Ready** — TLS/SSL support via Nginx

---

## 🛠 Environment Variables

### Domain Configuration
Set your custom domains in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `DOMAIN_API` | API domain URL | `https://api.starnova.my.id` |
| `DOMAIN_DASHBOARD` | Dashboard domain URL | `https://dash.starnova.my.id` |
| `DOMAIN_MAIN` | Main website URL | `https://starnova.my.id` |

### Server Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/starnova` |
| `REDIS_HOST` | Redis host | `localhost` |
| `JWT_SECRET` | JWT signing secret | `change-me` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `API_KEY_PREFIX` | API key prefix | `snv_` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `debug` |

> **💡 All domains are fully configurable via environment variables.**  
> Change `DOMAIN_API`, `DOMAIN_DASHBOARD`, and `DOMAIN_MAIN` to your own custom domains without touching any code.

See `.env.example` for all available variables.

---

## 🤖 WhatsApp Bot

The WhatsApp bot allows owners to manage the API directly from WhatsApp.

### Available Commands

| Command | Description |
|---------|-------------|
| `.createapikey <email> [name]` | Create API key for user |
| `.listapikey <email>` | List user's API keys |
| `.delapikey <key>` | Delete an API key |
| `.regenapikey <key>` | Regenerate API key |
| `.disableapikey <key>` | Disable API key |
| `.enableapikey <key>` | Enable API key |
| `.checkapikey <key>` | Check API key details |
| `.setlimit <key> <daily> <monthly>` | Set usage limits |
| `.setexpired <key> <days>` | Set expiration |
| `.statsapi` | Get API statistics |
| `.logsapi` | Get recent logs |
| `.reloadapi` | Reload configuration |
| `.restartapi` | Restart API server |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow SOLID principles
- Write clean, self-documenting code
- Add Zod validation for all endpoints
- Use TypeScript strictly
- Write unit tests for new features
- Follow the existing module pattern

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Support

- 📧 Email: support@starnova.my.id
- 🌐 Website: https://starnova.my.id
- 📚 Documentation: https://dash.starnova.my.id/documentation

---

<p align="center">Made with ⭐ by the StarNova Team</p>
