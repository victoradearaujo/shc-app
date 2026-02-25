# Test Suite Design — Sunshine Hot Cars

**Date:** 2026-02-25
**Approach:** Vitest (API) + Playwright (E2E)

## Architecture

```
tests/
├── api/                   # Vitest — API route unit/integration tests
│   ├── clients.test.ts
│   ├── bookings.test.ts
│   └── services.test.ts
├── e2e/                   # Playwright — browser E2E tests
│   ├── clients.spec.ts
│   ├── bookings.spec.ts
│   └── dashboard.spec.ts
└── helpers/
    └── db.ts              # Test DB setup/teardown helper
vitest.config.ts
playwright.config.ts
```

## Test Database

- Separate `prisma/test.db` SQLite file
- Reset to clean seed state before each test run
- No risk of corrupting dev data

## API Test Coverage (Vitest)

Route handlers called directly (no HTTP server). Each test resets DB to known state.

| Route | Tests |
|---|---|
| `GET /api/clients` | returns list, empty array when none |
| `POST /api/clients` | creates client, validates required fields |
| `GET /api/clients/[id]` | returns client, 404 on missing |
| `PUT /api/clients/[id]` | updates fields, 404 on missing |
| `DELETE /api/clients/[id]` | deletes client, cascades to vehicles |
| `GET /api/bookings` | returns list with relations |
| `POST /api/bookings` | creates booking, validates relations exist |
| `GET /api/bookings/[id]` | returns booking with extras |
| `PUT /api/bookings/[id]` | updates status, price, notes |
| `GET /api/services` | returns active services |
| `POST /api/services` | creates service with pricing tiers |

## E2E Test Coverage (Playwright)

Runs against dev server (auto-started). Headless Chromium. Accessibility-first selectors.

| Flow | Steps |
|---|---|
| Client management | Create → view in list → edit → view profile |
| Booking flow | Select client → pick service → set date/time → confirm |
| Dashboard | Loads stats, shows upcoming bookings |
| Booking status | Open → in progress → completed |
| History | Completed bookings appear in history |
| Settings | Services list loads, prices display correctly |

## Scripts

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:all": "vitest run && playwright test"
```
