# Trekr

**Every application. Organised.**

Trekr is an open source job application tracker built for job seekers who want clarity and control over their search. Track applications, interview rounds, contacts, documents, and follow-up reminders — all in one clean dashboard.

![License](https://img.shields.io/badge/license-GPL--3.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Neon](https://img.shields.io/badge/Database-Neon_PostgreSQL-green)
![Clerk](https://img.shields.io/badge/Auth-Clerk-purple)

---

## Features

- **Full application lifecycle** — Watching → Applied → Interview → Offer, plus Rejected, Ghosted, Closed, and Custom statuses
- **Interview rounds** — log every round with type, date, and outcome
- **Contacts** — track recruiters and hiring managers per application
- **Documents** — record which resume and cover letter version you sent
- **Reminders** — set follow-up deadlines so nothing slips
- **Salary tracking** — record compensation ranges in any currency
- **Google SSO** — sign in with one click, no passwords

---

## Tech Stack

| Layer    | Technology                            |
| -------- | ------------------------------------- |
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend  | Next.js API Routes                    |
| Database | Neon (serverless PostgreSQL)          |
| Auth     | Clerk (Google SSO)                    |
| Hosting  | Vercel                                |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free)
- A [Clerk](https://clerk.com) account (free)
- A [Vercel](https://vercel.com) account (free)

### 1. Clone the repo

```bash
git clone https://github.com/saintdannyyy/trekr.git
cd trekr
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your values — see `.env.example` for all required variables.

### 3. Set up the database

In your Neon dashboard, create a new project, open the SQL editor, and run:

```bash
# Paste and run the contents of sql/schema.sql
```

Or copy the contents of `sql/schema.sql` directly into Neon's SQL editor.

### 4. Configure Clerk

1. Create a new application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Under **Social connections**, enable **Google**
3. Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into `.env.local`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

```bash
# Push to GitHub, then connect your repo in Vercel dashboard
# Add all .env.local variables as Vercel environment variables
# Deploy — done
```

---

## Project Structure

```
trekr/
├── app/
│   ├── (auth)/                  # Clerk sign-in / sign-up pages
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/page.tsx   # Main tracker view (server component)
│   │   └── layout.tsx           # Sidebar + auth check
│   ├── api/
│   │   └── applications/        # CRUD API routes
│   ├── layout.tsx               # Root layout + Clerk provider
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Design tokens + component classes
├── components/
│   ├── ui/
│   │   ├── StatusBadge.tsx      # Status display component
│   │   └── StatsBar.tsx         # Summary stats tiles
│   ├── ApplicationModal.tsx     # Add / edit application form
│   ├── DashboardClient.tsx      # Main interactive dashboard
│   └── DetailPanel.tsx          # Full application detail view
├── lib/
│   ├── db.ts                    # Neon database client
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Shared utilities
├── sql/
│   └── schema.sql               # Full database schema
├── .env.example                 # Environment variables template
├── middleware.ts                # Clerk auth middleware
└── README.md
```

---

## Contributing

Contributions are very welcome. Trekr is built in the open — issues, PRs, and ideas all appreciated.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

Please keep PRs focused — one feature or fix per PR.

---

## Roadmap

### Notifications

- [ ] Welcome email on sign-up (Resend / SendGrid)
- [ ] Reminder email notifications — fire when `remind_at` passes
- [ ] Web push notifications — service worker + VAPID + Vercel Cron polling `WHERE done = FALSE AND remind_at <= NOW()`

### Sub-resource editing

- [ ] Edit contacts (PATCH `/api/contacts/:id` + inline edit UI)
- [ ] Edit documents (PATCH `/api/documents/:id` + inline edit UI)
- [ ] Edit interview rounds — type, date, notes (PATCH endpoint already accepts all fields; UI only exposes outcome)
- [ ] Edit reminders — message and datetime (PATCH endpoint already accepts all fields; UI only exposes toggle)

### Dashboard UX

- [ ] Overdue reminder highlighting — visual warning badge when `remind_at` has passed
- [ ] Pagination / cursor-based loading — dashboard currently fetches all rows in one query
- [ ] Bulk actions — multi-select rows to delete or move status at once
- [ ] Salary display — surface `salary_min`, `salary_max`, `salary_currency` in the Overview tab stats

### Data & insights

- [ ] Application notes / activity log — timestamped status-change history per application
- [ ] Analytics dashboard — application trends, response rates, time-to-offer over time
- [ ] CSV export

### Growth

- [ ] Mobile app (React Native)
- [ ] Team / shared boards

---

## License

GPL-3.0 — see [LICENSE](./LICENSE) for details.

---

Built by [Daniel Ntiri Addo](https://saintdannyyy.vercel.app) · Contributions welcome
