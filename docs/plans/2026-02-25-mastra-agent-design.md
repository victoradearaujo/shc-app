# Mastra AI Assistant — Design Doc

**Date:** 2026-02-25
**Status:** Approved

---

## Overview

Add a floating AI chat widget to the Sunshine Hot Cars management app. The assistant uses Claude Haiku (via Anthropic) and the Mastra framework to answer business questions and perform simple write actions (create booking, update status). A feature flag makes it trivial to disable.

---

## Architecture

Direct integration into the existing Next.js 14 app. No separate server.

```
lib/mastra/
  index.ts                  — Mastra instance
  agents/
    assistant.ts            — Agent definition + system prompt
  tools/
    bookings.ts             — listTodaysBookings, listBookingsByDate, createBooking, updateBookingStatus
    clients.ts              — getClientInfo, listAllClients
    services.ts             — listServices

app/api/assistant/
  route.ts                  — POST endpoint (disabled if feature flag off)

components/assistant/
  AssistantWidget.tsx       — Floating bubble + chat panel (client component)

app/layout.tsx              — Conditionally renders widget
next.config.js              — serverExternalPackages for mastra + ai-sdk
.env.local                  — NEXT_PUBLIC_ASSISTANT_ENABLED=true
                               ANTHROPIC_API_KEY=...
```

---

## Feature Flag

```env
NEXT_PUBLIC_ASSISTANT_ENABLED=true
```

- Set to `false` (or remove) to hide the widget and disable the API route entirely.
- No code changes needed to turn it on/off.

---

## Tools (7 total)

| Tool | Type | Description |
|------|------|-------------|
| `listTodaysBookings` | Read | All bookings for today — client, vehicle, service, time, status |
| `listBookingsByDate` | Read | Bookings for a given `date` (YYYY-MM-DD) |
| `getClientInfo` | Read | Client by name — contact info + vehicles |
| `listAllClients` | Read | All clients — name, phone, email, vehicle count |
| `listServices` | Read | Active services with prices by vehicle type |
| `createBooking` | Write | Create a booking (clientId, vehicleId, serviceId, date, time?, notes?) |
| `updateBookingStatus` | Write | Change status: start / complete (finalPrice?) / cancel (reason?) |

All tools use Prisma directly (server-side only, inside the API route handler).

---

## Agent System Prompt

The agent is scoped tightly to the business:

> You are a business assistant for Sunshine Hot Cars, a car detailing business. You help the owner quickly look up bookings, clients, and services, and perform simple actions like creating bookings or updating their status. Be concise and practical. Today's date is always available to you. Do not answer questions unrelated to the business.

---

## Widget UI

**Bubble:** Fixed bottom-right, orange circle (brand color), chat icon. Click to toggle panel.

**Panel:** 380px wide × 500px tall, slides up from bottom-right.
- Header: "Business Assistant" + close button
- Message list: scrollable, assistant left / user right
- "Thinking..." placeholder while waiting for response
- Input bar + send button at the bottom
- Error message inline if API call fails

**State:** Conversation resets on page refresh (no persistence). Panel stays open across client-side navigation.

---

## API Route

`POST /api/assistant`

- Returns 403 if `NEXT_PUBLIC_ASSISTANT_ENABLED !== 'true'`
- Accepts `{ messages: [{role, content}] }`
- Runs the Mastra agent with the message history
- Returns `{ reply: string }`

---

## Dependencies

```
@mastra/core
@ai-sdk/anthropic
```

`next.config.js` must add both to `serverExternalPackages`.
