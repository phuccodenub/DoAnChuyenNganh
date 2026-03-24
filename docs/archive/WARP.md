# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

Monorepo for a real-time Learning Management System (LMS):
- `backend/`: Node.js + Express + TypeScript API with PostgreSQL, Redis, Socket.IO, OpenTelemetry, and rich monitoring/caching.
- `frontend/`: React + Vite + TypeScript SPA using React Router, React Query, Zustand, Socket.IO client, Tailwind CSS.
- `docker/`: Centralized Docker Compose and PowerShell scripts for local dev, e2e testing, and production-like environments (supersedes `backend/docker`, which is deprecated).

The main human-facing overview and environment setup are in `README.md` and `docker/README.md`. Backend-specific docs live under `backend/src/docs/`.

## Key development commands

### Top-level Docker workflows (recommended)

These scripts assume PowerShell (see `package.json` and `docker/scripts/*.ps1`).

- **Full-stack dev (frontend + backend + DB + Redis)**
  - Start: `npm run dev:web`
  - Rebuild images: `npm run dev:web:build`
  - View logs: `npm run dev:web:logs`
  - Stop: `npm run dev:down:web`

- **API-only dev (backend + DB + Redis)**
  - Start: `npm run dev:api`
  - Rebuild images: `npm run dev:api:build`
  - View logs: `npm run dev:api:logs`
  - Stop: `npm run dev:down:api`

- **Docker cleanup utilities**
  - Interactive cleanup: `npm run docker:cleanup`
  - Aggressive cleanup (containers/images/networks/volumes): `npm run docker:cleanup:all`

- **Manual Docker Compose (if you need to bypass PowerShell scripts)**
  - Full-stack dev: `docker-compose -f docker/environments/development/full-stack.yml up -d`
  - API-only dev: `docker-compose -f docker/environments/development/backend-only.yml up -d`

Refer to `docker/README.md` for port mappings, container names, and advanced options (host-Postgres test env, mobile dev endpoints, cleanup variants, etc.).

### Backend (Node/Express API) without Docker

From `backend/`:

- **Install dependencies**: `npm install`
- **Run in dev mode** (ts-node-dev on `src/server.ts`): `npm run dev`
- **Build TypeScript and run compiled server**:
  - Build: `npm run build`
  - Start compiled app: `npm start`

#### Linting and type checks

- TypeScript project check (no emit): `npm run lint`
- ESLint: `npm run lint:eslint`
- Per-subdomain TS configs (useful for faster feedback in focused areas):
  - Monitoring: `npm run lint:monitoring`
  - Cache: `npm run lint:cache`
  - Auth: `npm run lint:auth`
  - Users: `npm run lint:users`
  - Courses: `npm run lint:courses`
  - Enrollments: `npm run lint:enrollments`
  - Shared: `npm run lint:shared`

#### Tests (Jest)

From `backend/`:

- All tests: `npm test`
- Watch mode: `npm run test:watch`
- Unit tests only: `npm run test:unit`
- Integration tests only: `npm run test:integration`
- e2e tests (backend, requires e2e environment): `npm run test:e2e`
- Coverage report: `npm run test:coverage`
- CI-friendly run with coverage: `npm run test:ci`

**Run a single test file** (Jest pattern, not wired as a dedicated script):
- Example from `backend/`: `npx jest src/modules/auth/__tests__/auth.controller.test.ts`
- Or use the `test` script with extra args: `npm test -- auth.controller.test.ts`

`jest.config.js` is configured to:
- Use `ts-jest` with `src/` as root.
- Ignore `dist/`, migrations, scripts, and server bootstrap for coverage.
- Run common setup via `src/tests/jest.env.ts` and `src/tests/setup.ts`.

#### Database migrations and seed scripts

From `backend/` (see `backend/src/migrations/README.md` for details):

- General migration runner: `npm run migrate`
  - The underlying script supports subcommands such as `migrate`, `status`, `rollback`, `rollbackAll` (run as `npm run migrate <subcommand>`).
- Reset database schema: `npm run reset-db` or `npm run reset-db-simple`
- Initial schema setup (no destructive reset): `npm run setup-db` or `npm run setup-db-simple`
- Seed sample data (local dev): `npm run seed`
- Seed a complete demo course: `npm run seed:complete-course`
- Docker-focused seeding and connectivity checks (uses `.env.local` / `.env.docker`):
  - Check DB connectivity: `npm run db:check` / `npm run db:check:docker`
  - Seed specifically for Docker dev DB: `npm run seed:docker`

### Frontend (React/Vite)

From `frontend/` (see `frontend/package.json`):

- Install dependencies: `npm install`
- Dev server (Vite): `npm run dev`
- Production build: `npm run build`
- Preview built app: `npm run preview`
- ESLint: `npm run lint`
- Type-check only: `npm run type-check`

### E2E / integration environment orchestration

At repo root (`package.json`):

- Standalone e2e dev environment (backend+frontend wired to host Postgres/Redis as per `docker/README.md`): `npm run dev:test`
- Dedicated e2e docker-compose env (no tests yet):
  - Up: `npm run test:e2e:env:up`
  - Down: `npm run test:e2e:env:down`
  - Logs: `npm run test:e2e:env:logs`
  - Status: `npm run test:e2e:env:ps`
- Full e2e cycle (spin up env, run Jest e2e suite, then tear down): `npm run test:e2e:safe`
- Keep env up after Jest run for debugging: `npm run test:e2e:keep`

## Backend architecture (high level)

### Express app and cross-cutting concerns

- Entry point is `backend/src/app.ts` (bootstrapped by `src/server.ts` when running the app).
- Core pipeline:
  - Loads `dotenv-flow` configuration via `env.config.ts` into a centralized `env` object (`@config/env.config`).
  - Registers request ID and logging middleware from `src/middlewares/logger.middleware.ts`.
  - Starts OpenTelemetry tracing (`src/tracing/tracing.ts`) and applies `tracingMiddleware`.
  - Attaches metrics middleware (HTTP, memory, CPU, uptime, domain-specific metrics) from `src/monitoring` unless `DISABLE_METRICS=true`.
  - Adds cache middleware from `src/cache` (see below) unless `DISABLE_CACHE=true`.
  - Applies security middleware: Helmet, CORS (`src/config/cors.config.ts`), and rate limiting (disabled when `DISABLE_RATE_LIMIT=true` or `NODE_ENV=test`).
  - Registers monitoring routes under `/health`, `/metrics`, `/ping`.
  - Serves Swagger UI at `/api-docs` using `src/config/swagger.config.ts`.
  - Mounts the versioned API router at `/api` (see next section).
  - Adds cache invalidation middleware for write operations to keep Redis/memory cache consistent.
  - Finalizes with a centralized error-handling pipeline in `src/errors` and `src/middlewares/error.middleware.ts`.

Environment-driven feature flags (used heavily in tests and debugging):
- `DISABLE_METRICS`, `DISABLE_CACHE`, `DISABLE_RATE_LIMIT` toggle performance-heavy cross-cutting layers.
- `ENABLE_OTLP` and related OTEL variables control whether traces are exported (see the tracing section in `README.md`).

### API versioning and routing

The API is structured around a versioned router in `backend/src/api/`:

- `src/api/routes.ts` creates the top-level `apiRoutes` router which:
  - Exposes some critical user/profile/auth endpoints directly under `/api/...` (e.g. `/api/users/profile`) for stability in tests and clients.
  - Mounts the v1 and v2 routers (`src/api/v1/routes.ts`, `src/api/v2/routes.ts`) both at explicit paths (e.g. `/api/v1`, `/api/v1.3.0`, `/api/v2.0.0`) and via a version-negotiation fallback.
  - Exposes a debug introspection route at `/api/__routes_debug` that inspects registered Express routes.
  - Delegates version negotiation to `versionManager.versionMiddleware` from `src/api/versioning`.

- `src/api/versioning/version.manager.ts` and `version.config.ts` implement a custom version manager:
  - Determines API version using (in order): URL path (`/api/vX.Y.Z/...`), `?version=` query param, `api-version` header, or `Accept` header `version=` parameter, then falls back to `env.api.defaultVersion` (default set in `env.config.ts`, currently `v1.3.0`).
  - Maintains version metadata (status, release/sunset dates, change logs, migration guides).
  - Adds response headers (`X-API-Version`, `X-API-Supported-Versions`, `X-API-Default-Version`, `X-API-Deprecation-Warning`, `X-API-Sunset-Date`).
  - Provides `GET /api/versions` and `GET /api/versions/:version` endpoints via `version.routes.ts` for introspection.

**Practical note for Warp:** when adding new endpoints, prefer to:
- Implement them inside the appropriate `src/api/v1/routes/*.routes.ts` (or v2) file.
- Delegate actual work to `src/modules/*` controllers/services instead of implementing logic directly in the route layer.
- Keep backwards compatibility in mind by wiring new versions into `version.config.ts` and `env.api.supportedVersions` if you add a major/minor version.

### Domain modules and services

Domain logic is organized by feature under `backend/src/modules/`. Each module typically exposes:

- `*.controller.ts`: Express-facing controller; handles HTTP-level concerns and maps req/res to service calls.
- `*.service.ts`: Business logic; orchestrates repositories, models, validations, and cross-cutting utilities.
- `*.repository.ts`: Data access using Sequelize models from `src/models`.
- `*.routes.ts`: Express routes (usually mounted via `src/api/v1/routes/*.routes.ts`).
- `*.types.ts` and `*.validate.ts`: Zod / validation schemas and shared types.
- `index.ts`: Central export hub and, in some cases (e.g. course module), pre-wired module instances.

Key modules include (non-exhaustive):
- `auth/`: Registration, login, refresh tokens, email verification, password reset, 2FA. See `auth.routes.ts` for rate-limited public routes and protected auth operations.
- `user/`: Profile management and user administration (wired in `src/api/routes.ts` for key profile endpoints).
- `course/`: Course CRUD, enroll/unenroll, instructor and student views, and course-level student management (`course.routes.ts`).
- `course-content/`: Sections, lessons, lesson materials, and progress tracking.
- `assignment/`: Assignments and submissions, including grading flows (`assignment.routes.ts`).
- `quiz/`: Quizzes, questions, options, attempts, scoring and statistics.
- `chat/`: Real-time course chat, implemented with both HTTP endpoints and a Socket.IO gateway (`chat.gateway.ts`).
- `analytics/`: Aggregated stats and user activity (`analytics.routes.ts`).
- `files/`: File upload/download and storage backends (Cloudinary, S3, GCS configured via env and `config/`).

When implementing new backend features, align with this pattern: add types/validations → repository → service → controller → routes, then surface via the corresponding `api/vX` router.

### Data layer: models and migrations

- Sequelize models live under `backend/src/models/` and represent core LMS entities: `user`, `course`, `enrollment`, `chat-message`, `quiz`, `assignment`, `grade`, livestream session models, notifications, etc.
- Associations and extended relationships are defined in `associations.ts` and `associations-extended.ts`.
- Migrations under `backend/src/migrations/` mirror the evolution of this schema; `backend/src/migrations/README.md` provides a human-readable catalog of major migrations (users, courses, enrollments, chat messages, indexes, extended LMS tables, etc.).

### Caching and performance

The cache module (`backend/src/cache/`) abstracts caching strategies:

- Strategies (`strategies/*.strategy.ts`):
  - `RedisCacheStrategy`: external cache (Redis).
  - `MemoryCacheStrategy`: in-process cache.
  - `HybridCacheStrategy`: combines memory + Redis for hot-path responses.
- `CacheManager` and `CacheMiddleware`:
  - `cacheMiddleware.cacheGet` for GET response caching (with route-level skip logic for authenticated or monitoring endpoints).
  - `cacheMiddleware.cacheUserData` for user-specific caching.
  - `cacheMiddleware.invalidateCache` for invalidating keys after write operations.

Warp should respect the existing abstraction when adding new cached endpoints: use `CacheManager` and middleware helpers instead of accessing Redis directly.

### Error handling

- `backend/src/errors/` contains a structured error system:
  - Domain-specific error classes: `ApiError`, `ValidationError`, `AuthenticationError`, `AuthorizationError`, `DatabaseError`, `FileError`, `ExternalServiceError`.
  - `ErrorFactory` and `ErrorUtils` centralize error creation and formatting.
  - `ERROR_CODES`, `ERROR_MESSAGES`, `ERROR_TYPES` ensure consistent responses across modules.
- `src/middlewares/error.middleware.ts` and `ErrorHandler` integrate these into the Express pipeline.

When introducing new errors, prefer extending the existing error classes or adding codes/messages to `error.constants.ts` rather than ad-hoc JSON responses.

## Frontend architecture (high level)

The frontend is a Vite-based React SPA, organized around routes, domain-specific pages, and shared providers/services.

### App bootstrap and providers

- `frontend/src/main.tsx` mounts `<App />` into `#root` and imports global styles and i18n initialization (`./i18n`).
- `frontend/src/App.tsx` wraps routes with:
  - `<BrowserRouter>` for client-side routing.
  - `<AppProviders>` (see below) for global context/providers.
  - A simple full-screen spinner while auth initialization (`useAuthStore`) is in progress.

- `frontend/src/app/providers/AppProviders.tsx` composes key providers and side effects:
  - `QueryProvider` for React Query.
  - `AuthModalProvider` for auth modals.
  - HTTP interceptors setup via `setupInterceptors()` (injects tokens, handles refresh, standardizes error handling).
  - Socket.IO client lifecycle via `socketService`, auto-connecting when the user is authenticated and reconnecting on token refresh.
  - `SocketStatus` debug component for real-time connection diagnostics.
  - `react-hot-toast` `Toaster` with centralized styling and success/error variants.

### Routing and role-based access control

- `frontend/src/routes/index.tsx` defines the main routing tree using `react-router-dom`:
  - Public routes: landing page, course catalog, course detail, livestream lobby/session, and auth flows (verify email, 2FA setup, forgot/reset password).
  - Protected routes wrapped by `<ProtectedRoute>`: require authentication and gate all role-specific sections.
  - Role-based routes using `<RoleGuard>`:
    - **Student routes** (role `student`): dashboard, enrolled courses, assignments, learning view, quizzes and results, notifications, settings.
    - **Instructor routes** (roles `instructor`, `admin`): instructor dashboard layout, course management, curriculum/quiz/assignment builders, grading, student management, livestream management/hosting and dedicated livestream creation flow.
    - **Admin routes** (roles `admin`, `super_admin`): admin dashboard layout, user management, course/category management, system settings, reports, activity logs.
  - A shared profile page route accessible to all authenticated roles.
  - A redirect helper (`InstructorLivestreamRedirect`) for some legacy/alternative livestream URLs.
  - Fallback 404 handling via `NotFoundPage` and a catch-all redirect.

Warp should respect this structure by:
- Adding new pages via lazy-loaded imports and wiring them through the appropriate `RoleGuard` blocks.
- Updating `ROUTES` and `generateRoute` in `frontend/src/constants/routes` when adding new navigable paths.

### State management, data fetching, and real-time

- Auth and global state: managed via Zustand stores (e.g. `authStore.enhanced`), with initialization in `App.tsx` and subscription-based Socket.IO reconnection in `AppProviders`.
- Server state: React Query (`QueryProvider`) is the primary data-fetching and caching layer for API calls.
- HTTP layer: centralized Axios configuration and interceptors under `frontend/src/services/http/` (used by data hooks and services throughout the app).
- Real-time features: `socketService` handles Socket.IO connection, authentication via JWT tokens, reconnection on token updates, and is consumed by chat, quiz, livestream, and notification UIs.

## Tooling, docs, and manual API testing

- **Central Docker docs**: `docker/README.md` explains all dev/production stacks, environment files, host Postgres setups, mobile development endpoints, and maintenance/cleanup commands.
- **Backend Docker (legacy)**: `backend/docker/README.md` is marked as deprecated; new Docker work should target the root `docker/` system and root `package.json` scripts.
- **Backend documentation**: `backend/src/docs/README.md` describes the structure of API docs (`api/*.md`, `openapi.yaml`), guides (`getting-started.md`, `architecture.md`, `database.md`, `deployment.md`), and doc-generation scripts (currently referenced as `npm run docs:*`, which may require adding corresponding npm scripts if they are not yet present in `backend/package.json`).
- **Migrations documentation**: `backend/src/migrations/README.md` documents each major migration and best practices (testing on dev DB, using indexes, rollback patterns, troubleshooting).
- **Postman collection**: `backend/postman/README.md` explains how to import the curated Postman collection and environment, recommended test flows (auth → categories/courses → content → quizzes → assignments → grades → communication → analytics), automatic environment-variable wiring, and common error scenarios.

For manual backend debugging, the Postman collection is the most complete reference of existing endpoints and typical request/response shapes; it also encodes role-based flows for students, instructors, and admins.

## Notes for future Warp instances

- Prefer using the **root Docker scripts** (`npm run dev:web`, `npm run dev:api`, `npm run dev:test`) for environment setup; treat `backend/docker` as legacy.
- When modifying or adding APIs, go through the full stack:
  1. Sequelize models and migrations (`backend/src/models`, `backend/src/migrations`).
  2. Domain module (repository → service → controller → routes under `backend/src/modules/*`).
  3. Versioned API router (`backend/src/api/v1` or `v2`) and, if needed, `version.config.ts` / `env.api`.
  4. Optionally update Postman collection and backend docs in `backend/src/docs/`.
- To avoid flakiness or overhead in tests and scripted tooling, consider disabling heavy cross-cutting concerns via env vars (`DISABLE_METRICS`, `DISABLE_CACHE`, `DISABLE_RATE_LIMIT`) where appropriate instead of removing middleware in code.
- Keep frontend routing and role-guarding consistent: new pages should integrate with `ProtectedRoute`, `RoleGuard`, and `ROUTES`/`generateRoute` for a coherent UX aligned with the LMS roles model.
