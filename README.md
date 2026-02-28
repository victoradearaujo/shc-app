# Sunshine Hot Cars — Management App

A management tool for the Sunshine Hot Cars car detailing business. Handles clients, bookings, job history, and service pricing.

---

## Requirements

- **Node.js** v18 or later
- **npm** v9 or later

---

## First-Time Setup

Run these commands once when setting up the project for the first time.

### 1. Install dependencies

```bash
cd /Users/victoraugusto/Projects/shc
npm install
```

### 2. Set up the database

```bash
npx prisma generate
npx prisma db push
```

This creates the SQLite database file at `prisma/dev.db`.

### 3. Seed sample data (optional but recommended)

```bash
npm run db:seed
```

This loads:
- 11 services (Basic Wash, Mini Detailing, Full Detailing, Ceramic Coat Package, New Car Package + 6 extras)
- 2 sample clients: John Smith (2 vehicles) and Sarah Johnson (1 vehicle)

---

## Running the App

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

> If port 3000 is in use, Next.js will automatically try 3001, 3002, etc. Check the terminal output for the exact URL.

---

## Pages

| URL | Description |
|-----|-------------|
| `/dashboard` | Overview — client count, today's jobs, monthly revenue, recent bookings |
| `/clients` | Client list with search. Click a client to view detail and vehicles |
| `/clients/new` | Add a new client |
| `/bookings` | Booking list with week day-strip filter and status pills |
| `/bookings/new` | Create a booking — cascading client → vehicle → service, live price |
| `/bookings/[id]` | Booking detail — status actions (Start / Complete / Cancel) |
| `/history` | Job history with date range, status, and client name filters + revenue total |
| `/settings` | Service management — add, edit, and delete services inline |

---

## Booking Workflow

1. Go to `/bookings/new`
2. Select a **client** — the vehicle dropdown auto-populates
3. Select a **vehicle** — the price sidebar updates based on vehicle type
4. Select a **service** — price calculates live
5. Enter a **date** (and optional time, travel surcharge, notes)
6. Click **Save Booking** — redirects to the booking detail page

**Status transitions on the booking detail page:**
- `Booked` → click **Start Job** → `In Progress`
- `In Progress` → click **Complete** → confirm prompt with final price → `Completed`
- `Booked` or `In Progress` → click **Cancel Booking** → enter optional reason → `Cancelled`

---

## Other Commands

```bash
npm run build          # Production build (checks for errors)
npx prisma studio      # Visual database browser at http://localhost:5555
npx prisma db push     # Apply schema changes to the database
npm run db:seed        # Re-seed the database (clears existing data first)
```

---

## Tech Stack

| | |
|---|---|
| **Next.js 14** | React framework with App Router |
| **Prisma + SQLite** | Database ORM — data stored in `prisma/dev.db` |
| **TypeScript** | Type safety throughout |
| **Tailwind CSS** | Styling with custom `brand` (orange) and `navy` (blue) colours |
| **Lucide React** | Icons |

---

## Project Structure

```
app/
  dashboard/           → Dashboard page
  clients/             → Client list, detail, new, edit
  bookings/            → Booking list, new, detail
  history/             → Job history with filters
  settings/            → Service management
  api/
    clients/           → GET, POST, PUT, DELETE clients
    bookings/          → GET, POST, PUT, DELETE bookings
    services/          → GET, POST, PUT, DELETE services

components/
  forms/
    BookingForm.tsx    → New/edit booking form
    ServiceForm.tsx    → Inline add/edit service form
  settings/
    SettingsClient.tsx → Settings page client component
  ui/
    BookingStatusButton.tsx  → Start / Complete / Cancel actions

lib/
  prisma.ts            → Prisma client singleton
  utils.ts             → formatPrice, formatDate, getPriceForVehicle, etc.

prisma/
  schema.prisma        → Database schema
  seed.js              → Sample data seed script
  dev.db               → SQLite database file (created after db push)
```
# shc-app
