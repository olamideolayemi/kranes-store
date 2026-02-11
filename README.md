# Krane's Market

A full-stack **ecommerce demo** built with React + TypeScript and an Express API.

This project is designed as a portfolio-grade marketplace experience inspired by large ecommerce platforms, while staying easy to run locally from a ZIP download.

## Quick Start (Non-Technical)

1. Download and extract the ZIP.
2. Open the project folder in your terminal.
3. Run:

```bash
npm install
npm run dev:full
```

4. Open `http://localhost:5173` in your browser.

If you only want to check quality/build:

```bash
npm run typecheck
npm run lint
npm run build
```

## Demo Scope

Krane's Market is a learning/demo project that includes:

- Advanced storefront UI (home, catalog, product details, cart, wishlist)
- Server-backed auth and protected account area
- Orders, tracking, returns, saved addresses/cards
- Server-side product query features (search/filter/sort/pagination)
- Inventory-aware ordering flow
- Analytics event ingestion + experiment (A/B) assignments

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- Redux Toolkit (state)
- React Query (server state + caching)
- React Router
- Tailwind CSS (via `@tailwindcss/vite`) + custom component classes
- Framer Motion

### Backend

- Express 5 + TypeScript
- JWT auth (`jsonwebtoken`)
- Request validation (`zod`)
- Password hashing (`bcryptjs`)
- In-memory response caching (`lru-cache`)
- JSON-file persistence for app-owned data

### External Product Source

- **Fake Store API** (`https://fakestoreapi.com`) for product/catalog data

## Project Structure

```text
.
├─ src/                     # Frontend app
│  ├─ app/                  # Providers
│  ├─ components/           # UI/layout/feature components
│  ├─ hooks/                # Custom hooks (analytics, experiments, typed store hooks)
│  ├─ pages/                # Route pages
│  ├─ services/             # Frontend API client
│  ├─ store/                # Redux slices + store
│  ├─ types/                # Shared frontend TypeScript models
│  └─ utils/                # Storage helpers
├─ backend/
│  ├─ src/                  # Express API server
│  └─ data/                 # JSON persistence files (users/orders/returns/analytics/inventory shadow)
├─ vite.config.ts
└─ package.json
```

## Features

## 1) Storefront Experience

- Home merchandising sections (hero, categories, deals, trending)
- Product catalog with:
  - Search
  - Category filtering
  - Rating and price filtering
  - Popularity toggle
  - Sort options
  - Grid/list view
  - Server-side pagination
- Product detail tabs (overview/specs/reviews style)
- Cart with coupon + shipping options
- Wishlist support

## 2) Authentication + Protected Account

- Register/login with JWT
- Session hydration on app boot
- Protected routes:
  - `/account`
  - `/checkout`
- Role-protected admin route:
  - `/admin`
- Account modules:
  - Orders history
  - Tracking timeline
  - Returns request flow
  - Saved addresses
  - Saved cards

## 3) Admin Dashboard

Admin capabilities include:

- Product creation and catalog management
- Inventory updates by SKU/product
- Order status transitions
- Return request approvals/refunds
- Revenue/usage overview
- Analytics event summary

Default demo admin credentials:

- Email: `admin@kranes.market`
- Password: `Admin123!`

## 4) Ordering + Inventory

- Checkout uses saved address + saved card
- `POST /api/orders` creates order + payment record
- Inventory stock is validated and decremented on order
- Tracking and return endpoints connected to created orders

## 5) Performance / Scale-Oriented Patterns

- Server-side product query pipeline
- Pagination metadata returned by API
- LRU caching for product query responses
- Frontend query caching via React Query
- Analytics event endpoint + frontend tracking hook
- Experiment assignment endpoint + frontend experiment hook

## API Overview

Base URL (local): `http://localhost:4000/api`

### Health

- `GET /health`

### Products (sourced from Fake Store API)

- `GET /products`
- `GET /products/:id`
- `GET /products/meta/categories`

Supported `/products` query params:

- `q`
- `category`
- `minRating`
- `maxPrice`
- `sortBy` (`featured | price-low-high | price-high-low | rating-high | most-reviewed`)
- `onlyPopular`
- `page`
- `pageSize`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Account (auth required)

- `GET /account/orders`
- `GET /account/tracking/:orderId`
- `GET /account/returns`
- `POST /account/returns`
- `GET /account/addresses`
- `POST /account/addresses`
- `DELETE /account/addresses/:id`
- `GET /account/cards`
- `POST /account/cards`
- `DELETE /account/cards/:id`

### Admin (admin role required)

- `GET /admin/overview`
- `GET /admin/products`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `DELETE /admin/products/:id`
- `GET /admin/orders`
- `PATCH /admin/orders/:id/status`
- `GET /admin/returns`
- `PATCH /admin/returns/:id/status`
- `GET /admin/inventory`
- `PATCH /admin/inventory/:productId`
- `GET /admin/analytics`

### Orders

- `POST /orders` (auth required)

### Inventory

- `GET /inventory/:productId`

### Analytics / Experiments

- `POST /analytics/events`
- `GET /analytics/summary`
- `GET /experiments`

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run frontend + backend together

```bash
npm run dev:full
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### Run separately

```bash
npm run server:dev
npm run dev
```

## Build & Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Notes

No `.env` file is required for local demo defaults.

Optional frontend override:

- `VITE_API_BASE_URL` (defaults to `/api` and uses Vite proxy in dev)

Backend defaults in code:

- API port: `4000`
- JWT secret: dev fallback in `backend/src/config.ts`
- Admin bootstrap account from environment:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_NAME`

For public deployment, set a strong production `JWT_SECRET`.

## Persistence Model

The backend persists app-owned entities to JSON files in `backend/data/`:

- users
- orders
- returns
- analytics
- inventory shadow data (stock/SKU reference)

Product catalog content itself is fetched from Fake Store API and normalized in the backend.

## Known Demo Constraints

- Payment provider is simulated (no real gateway integration)
- JSON storage is for demo/dev; use a real DB for production
- No email verification / password reset flow
- Minimal fraud/risk controls (not production security posture)

## Suggested Next Upgrades

- PostgreSQL + Prisma migrations
- Real Stripe integration + webhooks
- Admin dashboard for inventory/order status management
- Robust test suite (unit/integration/e2e)
- CI pipeline and containerized deployment

## License

This project is licensed under the **MIT License**.

See the full license text in [`LICENSE`](LICENSE).
