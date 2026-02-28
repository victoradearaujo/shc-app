# Low-Level Design — Sunshine Hot Cars

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    Client {
        String id PK "UUID"
        String firstName "required"
        String lastName "required"
        String email "optional"
        String phone "required"
        String address "optional"
        String suburb "optional"
        String notes "optional"
        DateTime createdAt "auto"
        DateTime updatedAt "auto"
    }

    Vehicle {
        String id PK "UUID"
        String clientId FK "required"
        String make "required"
        String model "required"
        Int year "optional"
        String color "optional"
        String rego "optional"
        String vehicleType "hatch_sedan | suv | 4x4"
        String notes "optional"
        DateTime createdAt "auto"
        DateTime updatedAt "auto"
    }

    Service {
        String id PK "UUID"
        String name "required"
        String description "optional"
        Float priceHatchSedan "default 0"
        Float priceSuv "default 0"
        Float price4x4 "default 0"
        Boolean isExtra "default false"
        Boolean isActive "default true"
        Int sortOrder "default 0"
        DateTime createdAt "auto"
    }

    Booking {
        String id PK "UUID"
        String clientId FK "required"
        String vehicleId FK "required"
        String serviceId FK "required"
        DateTime bookingDate "required"
        String bookingTime "optional (HH:MM)"
        String status "booked | in_progress | completed | cancelled"
        Float estimatedPrice "optional"
        Float finalPrice "optional"
        Float travelSurcharge "default 0"
        String notes "optional"
        String cancellationReason "optional"
        DateTime createdAt "auto"
        DateTime updatedAt "auto"
    }

    BookingExtra {
        String id PK "UUID"
        String bookingId FK "required"
        String serviceId FK "required"
        Float price "required"
    }

    Client ||--o{ Vehicle : "owns (CASCADE delete)"
    Client ||--o{ Booking : "has"
    Vehicle ||--o{ Booking : "used in"
    Service ||--o{ Booking : "main service"
    Service ||--o{ BookingExtra : "extra service"
    Booking ||--o{ BookingExtra : "add-ons (CASCADE delete)"
```

## 2. Sequence Diagrams

### 2a. Create Booking Flow

```mermaid
sequenceDiagram
    actor User
    participant Page as /bookings/new<br/>(Server Component)
    participant Form as BookingForm<br/>(Client Component)
    participant API as POST /api/bookings
    participant Prisma as Prisma ORM
    participant DB as SQLite

    rect rgba(26, 26, 94, 0.15)
        Note over User,DB: Page Load (Server-Side)
        User->>Page: Navigate to /bookings/new
        activate Page
        Page->>Prisma: prisma.client.findMany()
        Prisma->>DB: SELECT clients + vehicles
        DB-->>Prisma: rows
        Page->>Prisma: prisma.service.findMany()
        Prisma->>DB: SELECT services
        DB-->>Prisma: rows
        Page-->>Form: Render with clients[] and services[]
        deactivate Page
    end

    rect rgba(74, 26, 107, 0.15)
        Note over User,Form: User Interaction (Client-Side)
        User->>Form: Select client
        Form->>Form: Filter vehicles for selected client
        User->>Form: Select vehicle, service, date, time
        Form->>Form: Calculate estimatedPrice<br/>via getPriceForVehicle()
    end

    rect rgba(13, 74, 46, 0.15)
        Note over User,DB: Form Submission
        User->>Form: Click "Save Booking"
        activate Form
        Form->>API: POST /api/bookings<br/>{clientId, vehicleId, serviceId,<br/>bookingDate, estimatedPrice, ...}
        activate API
        API->>API: Validate required fields
        API->>Prisma: prisma.booking.create({data})
        Prisma->>DB: INSERT INTO Booking
        DB-->>Prisma: created row
        Prisma-->>API: booking object
        API-->>Form: 201 {booking}
        deactivate API
        Form->>Form: router.push(/bookings/[id])
        deactivate Form
    end
```

### 2b. AI Assistant Query Flow

```mermaid
sequenceDiagram
    actor User
    participant Widget as AssistantWidget<br/>(Client Component)
    participant API as POST /api/assistant
    participant Mastra as Mastra Agent
    participant Claude as Claude Haiku 4.5<br/>(Anthropic API)
    participant Tool as listTodaysBookings<br/>(Agent Tool)
    participant Prisma as Prisma ORM
    participant DB as SQLite

    rect rgba(26, 26, 94, 0.15)
        Note over User,DB: User Input
        User->>Widget: Types "What jobs do I have today?"
        activate Widget
        Widget->>API: POST /api/assistant<br/>{messages: [{role: "user", content: "..."}]}
        activate API
        API->>API: Check ASSISTANT_ENABLED === "true"
    end

    rect rgba(74, 26, 107, 0.15)
        Note over API,DB: Agent Processing
        API->>Mastra: agent.generate(messages)
        activate Mastra
        Mastra->>Claude: Send prompt + tool definitions
        activate Claude
        Claude-->>Mastra: Tool call: listTodaysBookings()
        deactivate Claude
    end

    rect rgba(13, 74, 46, 0.15)
        Note over Mastra,DB: Tool Execution
        Mastra->>Tool: Execute listTodaysBookings()
        activate Tool
        Tool->>Tool: Calculate today's date (YYYY-MM-DD)
        Tool->>Prisma: prisma.booking.findMany({where: {date: today}})
        Prisma->>DB: SELECT bookings + relations
        DB-->>Prisma: rows
        Prisma-->>Tool: booking objects
        Tool-->>Mastra: {date, count, bookings[]}
        deactivate Tool
    end

    rect rgba(26, 58, 94, 0.15)
        Note over User,Claude: Response Generation
        Mastra->>Claude: Send tool result
        activate Claude
        Claude-->>Mastra: Natural language summary
        deactivate Claude
        Mastra-->>API: {text: "You have 3 bookings today..."}
        deactivate Mastra
        API-->>Widget: {reply: "You have 3 bookings today..."}
        deactivate API
        Widget->>Widget: Append assistant message to chat
        deactivate Widget
    end
```

### 2c. Update Booking Status Flow

```mermaid
sequenceDiagram
    actor User
    participant Btn as BookingStatusButton<br/>(Client Component)
    participant API as PUT /api/bookings/[id]
    participant Prisma as Prisma ORM
    participant DB as SQLite

    rect rgba(26, 26, 94, 0.15)
        Note over User,DB: Status: "booked" → "in_progress"
        User->>Btn: Click "Start Job"
        activate Btn
        Btn->>API: PUT /api/bookings/[id]<br/>{status: "in_progress"}
        activate API
        API->>Prisma: prisma.booking.update({status})
        Prisma->>DB: UPDATE Booking SET status
        DB-->>Prisma: updated row
        Prisma-->>API: booking object
        API-->>Btn: 200 {booking}
        deactivate API
        Btn->>Btn: router.refresh()
        deactivate Btn
    end

    rect rgba(13, 74, 46, 0.15)
        Note over User,DB: Status: "in_progress" → "completed"
        User->>Btn: Click "Complete"
        Btn->>Btn: Show final price prompt
        User->>Btn: Confirm with finalPrice
        activate Btn
        Btn->>API: PUT /api/bookings/[id]<br/>{status: "completed", finalPrice: 250}
        activate API
        API->>Prisma: prisma.booking.update({status, finalPrice})
        Prisma->>DB: UPDATE Booking
        DB-->>Prisma: updated row
        API-->>Btn: 200 {booking}
        deactivate API
        Btn->>Btn: router.refresh()
        deactivate Btn
    end
```

## 3. Component Hierarchy

```mermaid
graph TD
    subgraph Root["RootLayout (app/layout.tsx)"]
        Sidebar["Sidebar<br/><i>client component</i><br/>Nav items, mobile drawer"]
        Main["main container"]
        AssistantWidget["AssistantWidget<br/><i>client component, conditional</i><br/>Floating chat bubble + panel"]
    end

    Main --> DashboardPage["/dashboard<br/><i>server component</i><br/>Stats cards, recent bookings"]
    Main --> ClientsPage["/clients<br/><i>server component</i><br/>Search, client list"]
    Main --> ClientDetailPage["/clients/[id]<br/><i>server component</i><br/>Contact, vehicles, history"]
    Main --> NewClientPage["/clients/new<br/><i>server component</i>"]
    Main --> EditClientPage["/clients/[id]/edit<br/><i>server component</i>"]
    Main --> BookingsPage["/bookings<br/><i>server component</i><br/>Calendar strip, status filter"]
    Main --> NewBookingPage["/bookings/new<br/><i>server component</i>"]
    Main --> BookingDetailPage["/bookings/[id]<br/><i>server component</i><br/>Details, status actions"]
    Main --> HistoryPage["/history<br/><i>server component</i><br/>Date range, filters, revenue"]
    Main --> SettingsPage["/settings<br/><i>server component</i>"]

    NewClientPage --> ClientForm["ClientForm<br/><i>client component</i><br/>Client fields + nested vehicles"]
    EditClientPage --> ClientForm
    ClientDetailPage --> DeleteClientButton["DeleteClientButton<br/><i>client component</i><br/>Confirm + delete"]

    NewBookingPage --> BookingForm["BookingForm<br/><i>client component</i><br/>Client/vehicle/service selection,<br/>date, price summary"]

    BookingDetailPage --> BookingStatusButton["BookingStatusButton<br/><i>client component</i><br/>Start / Complete / Cancel"]

    SettingsPage --> SettingsClient["SettingsClient<br/><i>client component</i><br/>Service list + inline editing"]
    SettingsClient --> ServiceForm["ServiceForm<br/><i>client component</i><br/>Name, prices, flags"]

    style Root fill:#4a1a6b,stroke:#2e0e45,color:#fff
    style Sidebar fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style AssistantWidget fill:#0d4a2e,stroke:#072e1b,color:#fff
    style Main fill:#1a3a5e,stroke:#0d2440,color:#fff
    style DashboardPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style ClientsPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style ClientDetailPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style NewClientPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style EditClientPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style BookingsPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style NewBookingPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style BookingDetailPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style HistoryPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style SettingsPage fill:#1a1a5e,stroke:#0d0d3b,color:#fff
    style ClientForm fill:#0d4a2e,stroke:#072e1b,color:#fff
    style DeleteClientButton fill:#0d4a2e,stroke:#072e1b,color:#fff
    style BookingForm fill:#0d4a2e,stroke:#072e1b,color:#fff
    style BookingStatusButton fill:#0d4a2e,stroke:#072e1b,color:#fff
    style SettingsClient fill:#0d4a2e,stroke:#072e1b,color:#fff
    style ServiceForm fill:#0d4a2e,stroke:#072e1b,color:#fff
```
