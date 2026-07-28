# PROFIT TOOL — AI Decision Support System for Shopify Merchants
**Production-Ready Enterprise Revenue Recovery & Cart Intelligence Platform**

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-00c853.svg)](/.github/workflows/ci-cd.yml)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5-4285F4.svg)](https://ai.google.dev/)
[![Shopify API](https://img.shields.io/badge/Shopify%20API-Official%20OAuth%20%26%20Billing-96bf48.svg)](https://shopify.dev/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

---

## 📖 What is Profit Tool?
**Profit Tool** is an AI-powered Decision Support System built exclusively for high-volume Shopify merchants. Unlike generic chatbots or black-box marketing automation tools, Profit Tool analyzes abandoned carts, customer lifetime values (LTV), and real-time inventory rules to generate **explainable, verifiable, and immutable recommendation queues**.

### ✨ Why Profit Tool is Different:
* **🎯 One Active Recommendation per Cart**: Eliminates notification noise. If a cart updates, existing recommendations transition cleanly without cluttering the merchant queue.
* **🛡️ Immutable Evidence Snapshots**: Every AI recommendation is cryptographically backed by versioned JSONB snapshots of the exact cart line items, pricing, and LTV at the exact moment of evaluation.
* **⚖️ Traceable Rule Engine Studio**: Create and test custom threshold rules (`Cart Value >= $150`, `Customer Orders > 5`). Every rule fired adds explicit, verifiable weight to the AI confidence score.
* **📜 Append-Only Audit Trail**: Every automated calculation, status override (`Completed`, `Snoozed`, `Blocked`), and merchant feedback submission is logged to an immutable audit ledger.

---

## 🚀 Quickstart & Local Development

### Prerequisites:
* **Node.js** v20+ or v22+
* **npm** v10+
* **Docker** & **Docker Compose** (optional for containerized PostgreSQL/Redis execution)

### 1. Install Dependencies
```bash
npm ci
```

### 2. Configure Environment Variables
Copy the example configuration and add your Gemini API key:
```bash
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY from Google AI Studio
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:3000`. The server runs with Hot Module Replacement (HMR) and an embedded PostgreSQL memory simulator pre-seeded with 3 live enterprise store accounts (`Fashionista Boutique USD`, `TechPulse Hub EUR`, `Organic Living GBP`).

---

## 🧪 Automated Testing Suite
Run the automated unit, integration, and rule simulation test suite:
```bash
npm test
```
The test suite validates:
1. JWT authentication and refresh token rotation.
2. Rule Engine weighting algorithms and custom threshold evaluation.
3. AI Engine explainability and zero-hallucination deterministic fallbacks.
4. "One Active Recommendation per Cart" idempotency constraints.
5. Shopify Webhook HMAC SHA256 timing-safe cryptographic verification.
6. Immutable append-only audit trail logging.

---

## 🐳 Docker Production Deployment
Build and launch the enterprise multi-stage Docker container:
```bash
# Build standalone production bundle and launch container
docker-compose up --build -d

# Check system health
curl http://localhost:3000/api/health
```

---

## 🛍️ Shopify App Store Submission Checklist
This application is designed from the ground up to comply with Shopify's official App Store verification requirements:

- [x] **Official Shopify OAuth Flow**: Implemented under `/api/shopify/install` and `/api/shopify/callback` with token persistence.
- [x] **HMAC SHA256 Webhook Verification**: All incoming webhooks (`carts/update`, `orders/create`, `app/uninstalled`) undergo timing-safe cryptographic signature validation.
- [x] **GDPR & Privacy Webhook Compliance**: Implemented mandatory compliance endpoints:
  - `customers/data_request`: Exports merchant data upon request.
  - `customers/redact`: Anonymizes personally identifiable information (PII).
  - `shop/redact`: Clears merchant store records upon app uninstallation.
- [x] **Shopify Billing API Integration**: Implemented recurring subscription plans (`Starter $19/mo`, `Growth $49/mo`, `Scale $199/mo`) with Shopify confirmation redirect links.
- [x] **No Hardcoded Secrets**: All secrets, API keys, and store domains are injected dynamically via environment variables (`.env`).
- [x] **Uninstallation Cleanup**: Automatic deactivation of merchant stores and revocation of webhook queues upon `app/uninstalled` webhook receipt.

---

## 📁 Repository Structure (Exact Match for Document 13B)
```
├── /.github/workflows/ci-cd.yml      # Automated CI/CD build, test & docker verification
├── /migrations/
│   └── 0001_initial_schema.sql       # PostgreSQL DDL migrations (matching Document 13B)
├── /src/
│   ├── /components/                  # React 19 Merchant Dashboard UI (Tailwind + Recharts)
│   ├── /server/
│   │   ├── /controllers/             # Express REST API controllers & validation (Zod)
│   │   ├── /db/                      # PostgreSQL DDL schema & embedded enterprise engine
│   │   ├── /middleware/              # Enterprise Auth (RBAC), Shopify HMAC, Error handlers
│   │   ├── /repositories/            # Repository pattern (Stores, Carts, Recs, Audit, Billing)
│   │   ├── /routes/                  # Modular API routers (/api/v2/auth, rules, recs, etc.)
│   │   ├── /services/                # Core domain business logic (AI, Rules, Auth, Shopify)
│   │   └── /utils/                   # Enterprise logger, crypto SHA256 hashing, validation
│   ├── types.ts                      # Global TypeScript domain definitions & interfaces
│   ├── App.tsx                       # Main Dashboard controller & SPA layout
│   └── main.tsx                      # Client entry point
├── /tests/
│   └── profit-tool.test.ts           # Comprehensive automated test suite
├── Dockerfile                        # Multi-stage production container build
├── docker-compose.yml                # Container orchestration with PostgreSQL & Redis
├── PROFIT_TOOL_ARCHITECTURE.md       # Full architectural & algorithmic deep-dive
├── openapi.json                      # OpenAPI 3.0 specification for enterprise integration
├── server.ts                         # Root backend entry point (0.0.0.0 ingress on port 3000)
├── package.json                      # Enterprise build scripts & dependencies
├── package-lock.json                 # Lockfile ensuring deterministic builds
├── tsconfig.json                     # TypeScript compilation config
└── vite.config.ts                    # Vite bundler & proxy configuration
```

### 💡 Note on `server.ts`:
`server.ts` is placed at the repository root as the primary backend entry point. This architectural decision ensures seamless compatibility with Vite dev middleware (`vite.createServer`), zero relative path resolution issues for ESM bundles, and instant compatibility with containerized deployment platforms (Cloud Run, Docker, Shopify App hosting).
