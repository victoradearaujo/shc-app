# Mastra AI Assistant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a floating AI chat widget powered by Claude Haiku and Mastra that lets the owner ask business questions and perform simple actions (create booking, update status).

**Architecture:** Direct integration into the Next.js 14 app — no separate server. Tools use Prisma directly server-side. The API route streams nothing (simple generate), returns `{ reply: string }`. A `NEXT_PUBLIC_ASSISTANT_ENABLED` env flag controls everything.

**Tech Stack:** `@mastra/core`, `@ai-sdk/anthropic`, `zod`, Next.js 14 App Router, Prisma, Tailwind CSS, lucide-react.

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `next.config.js`

**Step 1: Install packages**

```bash
cd /Users/victoraugusto/Projects/shc
npm install @mastra/core @ai-sdk/anthropic zod
```

Expected: packages added to `node_modules`, `package-lock.json` updated.

**Step 2: Update next.config.js**

Replace the entire contents of `next.config.js` with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@mastra/core', '@ai-sdk/anthropic'],
};
module.exports = nextConfig;
```

> `serverExternalPackages` tells Next.js not to bundle these on the server — required for Mastra's native modules.

**Step 3: Commit**

```bash
git add package.json package-lock.json next.config.js
git commit -m "chore: install mastra + anthropic ai-sdk dependencies"
```

---

### Task 2: Environment variables

**Files:**
- Create/Modify: `.env.local`
- Check: `.gitignore` (ensure `.env.local` is listed)

**Step 1: Add env vars to `.env.local`**

If the file doesn't exist, create it. Add these lines:

```env
NEXT_PUBLIC_ASSISTANT_ENABLED=true
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

> Replace `your-anthropic-api-key-here` with a real key from https://console.anthropic.com. The app will not start the assistant without it.

**Step 2: Verify `.gitignore` contains `.env.local`**

Open `.gitignore` and confirm `.env.local` is listed. If it doesn't exist yet:

```bash
echo ".env.local" >> .gitignore
```

**Step 3: Commit .gitignore only (never commit .env.local)**

```bash
git add .gitignore
git commit -m "chore: ensure .env.local is gitignored"
```

---

### Task 3: Services tool

**Files:**
- Create: `lib/mastra/tools/services.ts`

**Step 1: Create the file**

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const listServices = createTool({
  id: 'listServices',
  description:
    'List all active services with their prices for each vehicle type (hatch/sedan, SUV, 4x4)',
  inputSchema: z.object({}),
  execute: async () => {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        priceHatchSedan: true,
        priceSuv: true,
        price4x4: true,
        isExtra: true,
      },
    });
    return { services };
  },
});
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (or only pre-existing ones unrelated to this file).

---

### Task 4: Clients tools

**Files:**
- Create: `lib/mastra/tools/clients.ts`

**Step 1: Create the file**

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const listAllClients = createTool({
  id: 'listAllClients',
  description: 'List all clients with their name, phone, email, and vehicle count',
  inputSchema: z.object({}),
  execute: async () => {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        _count: { select: { vehicles: true } },
      },
    });
    return { clients };
  },
});

export const getClientInfo = createTool({
  id: 'getClientInfo',
  description:
    'Look up a client by name (partial match). Returns contact info and their vehicles.',
  inputSchema: z.object({
    name: z.string().describe('Client name to search for (partial match)'),
  }),
  execute: async ({ context }) => {
    const clients = await prisma.client.findMany({
      where: { name: { contains: context.name } },
      include: {
        vehicles: {
          select: { id: true, make: true, model: true, year: true, type: true, colour: true },
        },
      },
    });
    if (clients.length === 0) {
      return { error: `No client found matching "${context.name}"` };
    }
    return { clients };
  },
});
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 5: Bookings tools

**Files:**
- Create: `lib/mastra/tools/bookings.ts`

**Step 1: Create the file**

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const bookingSelect = {
  id: true,
  date: true,
  time: true,
  status: true,
  estimatedPrice: true,
  finalPrice: true,
  notes: true,
  client: { select: { id: true, name: true, phone: true } },
  vehicle: { select: { id: true, make: true, model: true, type: true } },
  service: { select: { id: true, name: true } },
} as const;

export const listTodaysBookings = createTool({
  id: 'listTodaysBookings',
  description: "List all bookings scheduled for today",
  inputSchema: z.object({}),
  execute: async () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;

    const bookings = await prisma.booking.findMany({
      where: { date: today },
      orderBy: { time: 'asc' },
      select: bookingSelect,
    });
    return { date: today, count: bookings.length, bookings };
  },
});

export const listBookingsByDate = createTool({
  id: 'listBookingsByDate',
  description: 'List all bookings for a specific date',
  inputSchema: z.object({
    date: z.string().describe('Date in YYYY-MM-DD format'),
  }),
  execute: async ({ context }) => {
    const bookings = await prisma.booking.findMany({
      where: { date: context.date },
      orderBy: { time: 'asc' },
      select: bookingSelect,
    });
    return { date: context.date, count: bookings.length, bookings };
  },
});

export const createBooking = createTool({
  id: 'createBooking',
  description: 'Create a new booking',
  inputSchema: z.object({
    clientId: z.string().describe('Client ID'),
    vehicleId: z.string().describe('Vehicle ID'),
    serviceId: z.string().describe('Service ID'),
    date: z.string().describe('Date in YYYY-MM-DD format'),
    time: z.string().optional().describe('Time in HH:MM format (optional)'),
    notes: z.string().optional().describe('Optional notes'),
  }),
  execute: async ({ context }) => {
    // Look up price based on vehicle type
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: context.vehicleId },
      select: { type: true },
    });
    const service = await prisma.service.findUnique({
      where: { id: context.serviceId },
      select: { priceHatchSedan: true, priceSuv: true, price4x4: true },
    });

    if (!vehicle || !service) {
      return { error: 'Vehicle or service not found' };
    }

    let estimatedPrice = service.priceHatchSedan;
    if (vehicle.type === 'suv') estimatedPrice = service.priceSuv;
    if (vehicle.type === '4x4') estimatedPrice = service.price4x4;

    const booking = await prisma.booking.create({
      data: {
        clientId: context.clientId,
        vehicleId: context.vehicleId,
        serviceId: context.serviceId,
        date: context.date,
        time: context.time || null,
        notes: context.notes || null,
        status: 'booked',
        estimatedPrice,
      },
      select: bookingSelect,
    });

    return { success: true, booking };
  },
});

export const updateBookingStatus = createTool({
  id: 'updateBookingStatus',
  description:
    'Update a booking status. Actions: "start" (booked→in_progress), "complete" (in_progress→completed), "cancel" (booked/in_progress→cancelled)',
  inputSchema: z.object({
    bookingId: z.string().describe('Booking ID'),
    action: z.enum(['start', 'complete', 'cancel']).describe('Action to perform'),
    finalPrice: z.number().optional().describe('Final price (only for complete action)'),
    cancelReason: z.string().optional().describe('Reason for cancellation (only for cancel action)'),
  }),
  execute: async ({ context }) => {
    const statusMap = { start: 'in_progress', complete: 'completed', cancel: 'cancelled' } as const;
    const newStatus = statusMap[context.action];

    const data: any = { status: newStatus };
    if (context.action === 'complete' && context.finalPrice !== undefined) {
      data.finalPrice = context.finalPrice;
    }
    if (context.action === 'cancel' && context.cancelReason) {
      data.cancelReason = context.cancelReason;
    }

    const booking = await prisma.booking.update({
      where: { id: context.bookingId },
      data,
      select: bookingSelect,
    });

    return { success: true, booking };
  },
});
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 6: Mastra agent and instance

**Files:**
- Create: `lib/mastra/agents/assistant.ts`
- Create: `lib/mastra/index.ts`

**Step 1: Create the agent**

Create `lib/mastra/agents/assistant.ts`:

```typescript
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { listTodaysBookings, listBookingsByDate, createBooking, updateBookingStatus } from '../tools/bookings';
import { listAllClients, getClientInfo } from '../tools/clients';
import { listServices } from '../tools/services';

export const assistant = new Agent({
  name: 'sunshine-assistant',
  instructions: `You are a business assistant for Sunshine Hot Cars, a car detailing business.
You help the owner quickly look up bookings, clients, and services, and perform simple actions like creating bookings or updating their status.
Be concise and practical. Format responses clearly — use bullet points or tables for lists.
Today's date is available via the listTodaysBookings tool (it returns the current date).
Do not answer questions unrelated to the business.`,
  model: anthropic('claude-haiku-4-5-20251001'),
  tools: {
    listTodaysBookings,
    listBookingsByDate,
    createBooking,
    updateBookingStatus,
    listAllClients,
    getClientInfo,
    listServices,
  },
});
```

**Step 2: Create the Mastra instance**

Create `lib/mastra/index.ts`:

```typescript
import { Mastra } from '@mastra/core';
import { assistant } from './agents/assistant';

export const mastra = new Mastra({
  agents: { assistant },
});
```

**Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add lib/mastra/
git commit -m "feat: add mastra tools and agent for business assistant"
```

---

### Task 7: API route

**Files:**
- Create: `app/api/assistant/route.ts`

**Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/lib/mastra';

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_ASSISTANT_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Assistant is disabled' }, { status: 403 });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const agent = mastra.getAgent('assistant');
    const result = await agent.generate(messages);

    return NextResponse.json({ reply: result.text });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
```

**Step 2: Verify the build compiles**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. If you see import errors from Mastra (e.g. `@mastra/core/agent` not found), check the current import paths at https://github.com/mastra-ai/mastra — the package may use named exports from `@mastra/core` directly instead of subpaths.

**Step 3: Commit**

```bash
git add app/api/assistant/
git commit -m "feat: add /api/assistant route for chat"
```

---

### Task 8: AssistantWidget component

**Files:**
- Create: `components/assistant/AssistantWidget.tsx`

**Step 1: Create the widget**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-500 text-white">
            <span className="font-semibold text-sm">Business Assistant</span>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center pt-4">
                Ask me about bookings, clients, or services.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-xl rounded-bl-sm text-sm">
                  Thinking...
                </div>
              </div>
            )}
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Toggle assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 9: Layout integration

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update layout to conditionally render the widget**

Replace `app/layout.tsx` with:

```typescript
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AssistantWidget from "@/components/assistant/AssistantWidget";

export const metadata: Metadata = {
  title: "Sunshine Hot Cars - Management",
  description: "Car detailing management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const assistantEnabled = process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === 'true';

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        {assistantEnabled && <AssistantWidget />}
      </body>
    </html>
  );
}
```

> Note: `NEXT_PUBLIC_` vars are inlined at build time in Next.js. Reading `process.env.NEXT_PUBLIC_ASSISTANT_ENABLED` in a Server Component (layout.tsx is server-side) works fine.

**Step 2: Commit**

```bash
git add components/assistant/ app/layout.tsx
git commit -m "feat: add floating AssistantWidget to layout"
```

---

### Task 10: Build verification and smoke test

**Step 1: Run a production build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no TypeScript errors. The `/api/assistant` route should appear in the output.

**Step 2: Start the dev server**

```bash
npm run dev
```

**Step 3: Manual smoke test**

1. Open http://localhost:3000/dashboard
2. You should see an orange circle button in the bottom-right corner
3. Click it — the chat panel should open
4. Type: "What bookings do I have today?"
5. Expected: The assistant calls `listTodaysBookings` and returns a formatted list (or "no bookings today" if none exist)
6. Type: "List all clients"
7. Expected: A list of clients with their details

**Step 4: Test the feature flag**

1. In `.env.local`, change `NEXT_PUBLIC_ASSISTANT_ENABLED=false`
2. Restart the dev server (`npm run dev`)
3. Expected: The orange bubble is gone from the UI
4. Set it back to `true` and restart

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete mastra AI assistant integration with feature flag"
```

---

## Troubleshooting

**Import errors from `@mastra/core/agent` or `@mastra/core/tools`:**
Mastra's import paths may have changed. Check https://github.com/mastra-ai/mastra for the current API. Common alternative: `import { Agent, createTool } from '@mastra/core'`

**`Cannot find module '@ai-sdk/anthropic'`:**
Run `npm install @ai-sdk/anthropic` again and check `node_modules`.

**Agent returns empty text:**
Check that `ANTHROPIC_API_KEY` is set correctly in `.env.local` and that the key has credits.

**Widget shows but messages fail with 403:**
Check that `NEXT_PUBLIC_ASSISTANT_ENABLED=true` is set in `.env.local` and the dev server was restarted after changing it.
