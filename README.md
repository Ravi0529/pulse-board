<div align="center">

# ⚡ Pulse Board

### Turn Feedback Into Collective Power

A real-time polling and feedback platform where creators launch polls, share links, and watch analytics evolve live — like a feedback leaderboard.

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Demo Video](#-demo-video)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
  - [Docker Setup](#-docker-setup)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 About the Project

**Pulse Board** is a full-stack, real-time polling platform designed for creators, educators, and communities who need instant, actionable feedback. Create multi-question polls, share unique links, and watch votes stream in live via WebSocket-powered analytics — complete with bar charts, vote counts, and percentage breakdowns.

The platform supports two distinct response modes:

- **Private (Authenticated)** — Only logged-in users can vote, preventing duplicate submissions per account.
- **Public (Anonymous)** — Anyone with the link can vote using a display name, no signup required.

Polls auto-expire based on a creator-set deadline, after which results become publicly visible to everyone on the same shareable link.

---

## 🎬 Demo Video

<!-- Add your demo video link/embed below -->

> 🎥 **Coming soon** — A walkthrough video showcasing poll creation, real-time voting, and live analytics will be added here.

<!-- Uncomment and replace with your actual demo video link:
[![Pulse Board Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
-->

---

## ✨ Key Features

| Feature                     | Description                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **⚡ Real-time Updates**    | WebSocket-powered live analytics via Socket.IO + Redis Pub/Sub adapter. Every vote triggers instant UI updates for all connected clients. |
| **🔐 Smart Authentication** | JWT-based auth with bcrypt password hashing. Polls can be set to authenticated-only or open anonymous access.                             |
| **⏰ Auto-Expiry System**   | Creators set an expiry timestamp. Polls automatically close and publish results when the deadline passes.                                 |
| **📊 Analytics Dashboard**  | Per-question bar charts (Recharts), vote counts, percentage breakdowns, and total response tracking — all updating in real time.          |
| **🔗 Shareable Poll Links** | Each poll gets a unique URL (`/poll/:pollId`) that can be shared anywhere. One link for voting, analytics, and results.                   |
| **📝 Multi-Question Polls** | Create polls with 1–20 questions, each with 2–10 answer options. Mark questions as required or optional.                                  |
| **🎯 Duplicate Prevention** | Unique constraints prevent the same authenticated user or anonymous identifier from voting twice on the same poll.                        |
| **✏️ Full CRUD Workspace**  | Creators can edit poll titles, descriptions, questions, options, visibility mode, and expiry — all from a dedicated workspace.            |
| **🐳 Docker Ready**         | Full Docker Compose setup with PostgreSQL 17, Redis 7, and the application server — one command to spin up everything.                    |
| **⚡ Redis Caching**        | Vote counts and response totals are cached in Redis for blazing-fast reads with lazy hydration from PostgreSQL on cache misses.           |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React 19)                          │
│  TanStack Start + Router · Tailwind CSS 4 · shadcn/ui · Recharts  │
│  Socket.IO Client · React Hook Form · Axios                       │
└────────────────────────────┬───────────────────┬────────────────────┘
                             │  REST API         │  WebSocket
                             │  (Axios)          │  (Socket.IO)
┌────────────────────────────▼───────────────────▼────────────────────┐
│                        SERVER (Express 5)                           │
│  Auth · Poll · Response · Analytics Routes                         │
│  JWT Middleware · Zod Validation · Drizzle ORM                     │
├─────────────────────┬───────────────────────────┬───────────────────┤
│    PostgreSQL 17    │        Redis 7            │    Socket.IO      │
│  (Drizzle ORM +    │  (Vote count cache +      │  (Real-time       │
│   Migrations)      │   Redis Pub/Sub Adapter)  │   poll rooms)     │
└─────────────────────┴───────────────────────────┴───────────────────┘
```

**Data flow on vote submission:**

1. Client sends `POST /api/responses/:pollId` with answers
2. Server validates the request (Zod), checks expiry, auth mode, and duplicate constraints
3. Response + answers are saved to PostgreSQL in a transaction
4. Redis counters are atomically incremented (`INCR`)
5. Updated vote counts are fetched from Redis
6. Socket.IO emits `poll_response_update` to all clients in the poll room
7. Every connected client's UI updates instantly

---

## 🛠 Tech Stack

### Frontend

| Technology           | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| **React 19**         | UI library with latest features                              |
| **TanStack Start**   | Full-stack React framework (SSR-ready)                       |
| **TanStack Router**  | Type-safe file-based routing                                 |
| **TypeScript**       | Type safety across the entire frontend                       |
| **Tailwind CSS 4**   | Utility-first styling with dark mode                         |
| **shadcn/ui**        | Accessible, customizable UI components (Radix UI primitives) |
| **Recharts**         | Bar chart visualizations for analytics                       |
| **React Hook Form**  | Performant form state management                             |
| **Socket.IO Client** | Real-time WebSocket communication                            |
| **Axios**            | HTTP client for REST API calls                               |
| **Lucide React**     | Consistent icon set                                          |
| **date-fns**         | Date utility functions                                       |
| **Vite 8**           | Lightning-fast dev server and build tool                     |

### Backend

| Technology            | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| **Express 5**         | HTTP server and REST API framework             |
| **TypeScript**        | Type safety across the entire backend          |
| **Socket.IO**         | WebSocket server for real-time events          |
| **Drizzle ORM**       | Type-safe SQL query builder and migrations     |
| **PostgreSQL 17**     | Primary relational database                    |
| **Redis 7 (ioredis)** | Vote count caching + Socket.IO Pub/Sub adapter |
| **JSON Web Tokens**   | Stateless authentication                       |
| **bcryptjs**          | Secure password hashing                        |
| **Zod**               | Runtime request validation and env parsing     |
| **Docker**            | Containerized infrastructure                   |

---

## 📁 Project Structure

```
pulse-board/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── poll/                # Poll-specific components
│   │   │   │   ├── PollAnalyticsView.tsx   # Charts + vote breakdowns
│   │   │   │   ├── PollVotingView.tsx      # Question-by-question voting UI
│   │   │   │   ├── PollStateCard.tsx       # Status/blocked state cards
│   │   │   │   └── poll-shared.tsx         # Shared layout, helpers, types
│   │   │   ├── ui/                  # shadcn/ui components (button, card, etc.)
│   │   │   ├── DateTimePicker.tsx   # Custom 24h datetime picker
│   │   │   └── FeatureTile.tsx      # Landing page feature tile
│   │   ├── routes/
│   │   │   ├── index.tsx            # Landing page
│   │   │   ├── __root.tsx           # Root layout
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx        # Login page
│   │   │   │   └── signup.tsx       # Signup page
│   │   │   └── (app)/
│   │   │       ├── workspace.tsx          # Workspace layout (auth guard)
│   │   │       ├── workspace.index.tsx    # Dashboard — list all creator's polls
│   │   │       ├── workspace.create.tsx   # Multi-question poll creation form
│   │   │       ├── workspace.$pollId.tsx  # Poll editor + share link manager
│   │   │       └── poll.$pollId.tsx       # Public poll page (vote/view results)
│   │   ├── services/                # API service modules
│   │   │   ├── api.ts               # Axios instance configuration
│   │   │   ├── authServices.ts      # Signup, login, logout, get current user
│   │   │   ├── authSession.ts       # Token + user localStorage management
│   │   │   ├── pollServices.ts      # CRUD operations for polls
│   │   │   ├── responseServices.ts  # Submit poll responses
│   │   │   ├── analyticsServices.ts # Fetch poll analytics and vote counts
│   │   │   └── tokenStore.ts        # JWT token storage helpers
│   │   ├── lib/
│   │   │   └── utils.ts             # Utility functions (cn helper)
│   │   ├── router.tsx               # TanStack Router setup
│   │   ├── routeTree.gen.ts         # Auto-generated route tree
│   │   └── styles.css               # Global styles + Tailwind imports
│   ├── .env.example                 # Client env template
│   ├── components.json              # shadcn/ui configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # Backend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts               # Express app factory (CORS, routes, middleware)
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts   # Signup, login, logout, current user
│   │   │   │   ├── auth.routes.ts       # POST /signup, /signin, /logout, GET /me
│   │   │   │   └── auth.schema.ts       # Zod schemas for auth validation
│   │   │   ├── poll/
│   │   │   │   ├── poll.controller.ts   # Full CRUD for polls + questions + options
│   │   │   │   ├── poll.routes.ts       # GET/POST/PUT/DELETE /api/poll
│   │   │   │   └── poll.schema.ts       # Zod schemas for poll validation
│   │   │   ├── response/
│   │   │   │   ├── response.controller.ts  # Submit response + emit live update
│   │   │   │   ├── response.routes.ts      # POST /api/responses/:pollId
│   │   │   │   └── response.schema.ts      # Zod schema for response payload
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.controller.ts # Get poll analytics with Redis-cached counts
│   │   │   │   └── analytics.routes.ts     # GET /api/analytics/:pollId
│   │   │   ├── middleware/
│   │   │   │   └── auth.middleware.ts  # JWT verification + auth guard
│   │   │   ├── redis/
│   │   │   │   ├── redis.ts            # Redis client (ioredis)
│   │   │   │   └── analytics.redis.ts  # Vote count cache (INCR + lazy hydration)
│   │   │   ├── socket/
│   │   │   │   ├── socket.ts           # Socket.IO server + Redis adapter
│   │   │   │   ├── socket.events.ts    # join_poll / leave_poll room events
│   │   │   │   └── socket.types.ts     # Socket type definitions
│   │   │   └── utils/
│   │   │       └── token.ts            # JWT sign + verify helpers
│   │   ├── db/
│   │   │   ├── index.ts             # Drizzle client initialization
│   │   │   └── schema.ts            # Full database schema (6 tables + relations)
│   │   ├── types/                   # Express type augmentations
│   │   ├── env.ts                   # Zod-validated environment variables
│   │   └── index.ts                 # Server entry point (HTTP + Socket.IO init)
│   ├── drizzle/                     # SQL migration files
│   ├── docker/
│   │   ├── Dockerfile               # Multi-stage server build
│   │   └── docker-compose.yaml      # Full stack: app + postgres + redis
│   ├── .env.example                 # Server env template
│   ├── drizzle.config.js            # Drizzle Kit configuration
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🗄 Database Schema

The PostgreSQL schema is managed through Drizzle ORM with versioned SQL migrations.

```mermaid
erDiagram
    users ||--o{ polls : creates
    polls ||--o{ questions : contains
    questions ||--o{ options : has
    polls ||--o{ responses : receives
    responses ||--o{ answers : includes
    users ||--o{ responses : submits
    questions ||--o{ answers : "answered by"
    options ||--o{ answers : "selected in"

    users {
        uuid id PK
        varchar username
        varchar email UK
        varchar password
        timestamp created_at
    }

    polls {
        uuid id PK
        varchar title
        text description
        uuid creator_id FK
        enum response_mode "ANONYMOUS | AUTHENTICATED"
        timestamp expires_at
        boolean is_published
        timestamp created_at
        timestamp updated_at
    }

    questions {
        uuid id PK
        uuid poll_id FK
        text question
        boolean required
        integer order
    }

    options {
        uuid id PK
        uuid question_id FK
        text text
        integer order
    }

    responses {
        uuid id PK
        uuid poll_id FK
        uuid user_id FK "nullable"
        varchar anonymous_identifier "nullable"
        timestamp submitted_at
    }

    answers {
        uuid id PK
        uuid response_id FK
        uuid question_id FK
        uuid option_id FK
    }
```

**Key constraints:**

- One response per authenticated user per poll (`responses_poll_user_unique`)
- One response per anonymous identifier per poll (`responses_poll_anonymous_unique`)
- One answer per question per response (`answers_response_question_unique`)
- All foreign keys cascade on delete

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **PostgreSQL** 17 (or use Docker)
- **Redis** 7 (or use Docker)
- **Docker & Docker Compose** (optional, for containerized setup)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Ravi0529/pulse-board.git
cd pulse-board
```

**2. Install server dependencies**

```bash
cd server
npm install
```

**3. Install client dependencies**

```bash
cd ../client
npm install
```

### Environment Variables

**Server** (`server/.env`)

```env
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/live_polls
JWT_SECRET=your-super-secret-jwt-key-change-this
REDIS_URL=redis://localhost:6379
```

**Client** (`client/.env`)

```env
VITE_API_URL=http://localhost:8000/api
VITE_ACCESS_KEY=your-access-key
VITE_USER_KEY=your-user-key
```

> Copy from `.env.example` in each directory and fill in your values.

### Database Setup

**1. Start PostgreSQL and Redis** (skip if using Docker Compose)

Make sure PostgreSQL and Redis are running locally, then create the database:

```bash
createdb live_polls
```

**2. Generate and run migrations**

```bash
cd server
npm run db:generate   # Generate SQL migration files from schema
npm run db:migrate    # Apply migrations to PostgreSQL
```

**3. (Optional) Open Drizzle Studio** — visual database browser

```bash
npm run studio
```

### Running the Application

**Terminal 1 — Start the server**

```bash
cd server
npm run dev
```

The server starts on `http://localhost:8000` with auto-reload via `tsc-watch`.

**Terminal 2 — Start the client**

```bash
cd client
npm run dev
```

The client starts on `http://localhost:3000` with Vite HMR.

---

### 🐳 Docker Setup

Spin up the entire stack (server + PostgreSQL + Redis) with a single command:

```bash
cd server/docker
docker compose up -d
```

This starts:

| Service            | Container              | Port   |
| ------------------ | ---------------------- | ------ |
| Application Server | `live-polls-server`    | `8000` |
| PostgreSQL 17      | `pulse-board-postgres` | `5432` |
| Redis 7            | `pulse-board-redis`    | `6379` |

Database migrations run automatically on container startup.

To stop everything:

```bash
docker compose down
```

To reset volumes (wipe data):

```bash
docker compose down -v
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint           | Auth | Description                      |
| ------ | ------------------ | ---- | -------------------------------- |
| `POST` | `/api/auth/signup` | ❌   | Register a new user              |
| `POST` | `/api/auth/signin` | ❌   | Login and receive JWT            |
| `POST` | `/api/auth/logout` | ✅   | Logout (client-side token clear) |
| `GET`  | `/api/auth/me`     | ✅   | Get current authenticated user   |

### Polls

| Method   | Endpoint            | Auth | Description                                     |
| -------- | ------------------- | ---- | ----------------------------------------------- |
| `POST`   | `/api/poll`         | ✅   | Create a new poll with questions & options      |
| `GET`    | `/api/poll`         | ✅   | Get all polls created by the current user       |
| `GET`    | `/api/poll/:pollId` | ❌   | Get a poll by ID (public access)                |
| `PUT`    | `/api/poll/:pollId` | ✅   | Update poll (creator only)                      |
| `DELETE` | `/api/poll/:pollId` | ✅   | Delete poll and all related data (creator only) |

### Responses

| Method | Endpoint                 | Auth    | Description                                         |
| ------ | ------------------------ | ------- | --------------------------------------------------- |
| `POST` | `/api/responses/:pollId` | Depends | Submit a response (auth required for private polls) |

### Analytics

| Method | Endpoint                 | Auth    | Description                                                       |
| ------ | ------------------------ | ------- | ----------------------------------------------------------------- |
| `GET`  | `/api/analytics/:pollId` | Depends | Get poll analytics (creator only while live, public after expiry) |

---

## 🔌 WebSocket Events

Socket.IO is used for real-time vote updates with Redis Pub/Sub adapter for horizontal scaling.

| Event                  | Direction       | Payload                                   | Description                                                   |
| ---------------------- | --------------- | ----------------------------------------- | ------------------------------------------------------------- |
| `join_poll`            | Client → Server | `pollId: string`                          | Join a poll room to receive updates                           |
| `leave_poll`           | Client → Server | `pollId: string`                          | Leave a poll room                                             |
| `poll_response_update` | Server → Client | `{ pollId, totalResponses, questions[] }` | Broadcasted to all clients in the poll room on every new vote |

**`poll_response_update` payload shape:**

```typescript
{
  pollId: string;
  totalResponses: number;
  questions: Array<{
    questionId: string;
    options: Array<{
      optionId: string;
      votes: number;
    }>;
  }>;
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please make sure your code:

- Follows the existing TypeScript conventions
- Passes linting (`npm run lint`)
- Includes proper type annotations

---

<div align="center">

**Built with ❤️ by [Ravi](https://github.com/Ravi0529)**

⭐ Star the repo if you found it useful!

</div>
