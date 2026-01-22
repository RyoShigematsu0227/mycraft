# MyCraft

MinecraftワールドのSNSアプリ。ユーザーはワールドの住人になりきって投稿し、スクリーンショットや建築を共有する。

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **State**: Zustand (グローバル), Tanstack Query (サーバー)
- **Backend**: Supabase (Auth, Database, Storage, Realtime)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase CLI

### Setup

1. Clone the repository

```bash
git clone <repository-url>
cd mycraft
```

2. Install dependencies

```bash
cd web
npm install
```

3. Set up environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Start Supabase local development

```bash
supabase start
```

5. Start the development server

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
mycraft/
├── docs/           # Documentation
├── web/            # Next.js frontend
├── mobile/         # Expo app (coming soon)
└── supabase/       # Database migrations & config
```

## Scripts

### Web

```bash
cd web
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

### Supabase

```bash
supabase start       # Start local Supabase
supabase db reset    # Reset DB + run migrations
supabase gen types typescript --local > web/types/database.ts
```

## Documentation

- [Requirements](docs/requirements.md)
- [Design](docs/design.md)
- [Tasks](docs/tasks.md)
- [Decisions](docs/decisions.md)
