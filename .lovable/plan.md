## What's in the uploaded zip

The Replit export is a pnpm monorepo with two big pieces:

- **API server** (Express + Drizzle + Postgres) — 14 route files: referrers, referrals, properties, teams, challenges, gamification (streaks, lucky-draw, squad-battles, visits, waitlist, flash-deals, chain, activity), leaderboard, manager, notifications, personas, admin, extras, health.
- **Frontend** (React + Vite + Wouter + Zustand) — ~37 pages including 7 persona dashboards, PG browse/detail, areas, calculator, chain network tree, challenges, teams + team detail, leaderboard, lucky-draw, streak check-in, squad-battles, flash deals, earnings, payout-setup, notifications, activity feed, visits, admin panel (login/dashboard/leads/lead-detail/payouts/properties), manager (dashboard/properties/add-property), broker, influencer, corporate dashboards.

The current Lovable project already has: auth + profiles, referrals + admin panel + payout flow, basic gamification (xp/level/streak/lucky tickets/spin), tier system. About **20% of the source app** is in place.

## What I'll add to reach parity

Porting all 37 pages + 14 backend routes 1:1 in one shot is unrealistic — but I can deliver **all the user-facing features end-to-end** in 4 focused phases. I recommend shipping phases 1 + 2 in this turn and asking for go-ahead on 3 + 4.

### Phase 1 — Data model + core gamification pages (this turn)

Database migration adds:
- `personas` enum (GUARD/STUDENT/EARNER/PG_MANAGER/BROKER/INFLUENCER/CORPORATE_HR) + `persona`, `xp`, `level_name`, `total_clicks`, `avatar_url` on `profiles`
- `properties` (PG listings: name, area, type, rent, gender, amenities[], images[], rating, manager_id, is_flash, flash_multiplier, flash_ends_at, spots_left)
- `pg_visits` (visit scheduler: property_id, referrer_id, scheduled_at, status)
- `waitlists` (property_id, user_id)
- `teams` + `team_members` (name, slug, captain_id, total_xp)
- `challenges` + `challenge_progress` (DAILY/WEEKLY/MILESTONE, target, reward_xp, reward_cash)
- `notifications` (user_id, type, title, body, read_at, link)
- `payout_methods` (user_id, kind: upi/bank, upi_id, account_no, ifsc, name)
- `checkin_logs` (user_id, date) + reuse existing `streak_days`
- `squad_battles` + `battle_teams` (team_a, team_b, metric, ends_at, winner)
- `badges_earned` (user_id, badge_key, earned_at)
- `activity` log (user_id, type, meta jsonb)
- `referral_clicks` (code, ip, ua, ts) for click tracking
- Triggers to award badges + push notifications + activity rows on key events
- RPC `daily_checkin()` (returns reward + updated streak), `join_team()`, `leave_team()`, `book_visit()`

### Phase 2 — Frontend pages (this turn)

New routes wired to the schema above:
- `/persona` — persona selector (replaces current generic landing for logged-in users with no persona)
- `/pg` + `/pg/$id` — browse & detail with filters (area, gender, price)
- `/areas` — Bangalore area heatmap
- `/calculator` — earnings calculator
- `/leaderboard` — weekly/monthly/all-time with persona filter
- `/streak` — daily check-in with flame animation + 7-day calendar
- `/lucky-draw` — proper spin wheel with framer-motion
- `/challenges` — active challenges with progress bars
- `/teams` + `/teams/$slug` — team browser + detail (join/leave)
- `/squad-battles` — team vs team live battles
- `/flash` — flash deals with countdown
- `/chain` — referral chain network tree (recursive)
- `/activity` — activity feed
- `/visits` — visit scheduler
- `/notifications` — notification center
- `/earnings` — full earnings + monthly chart (recharts)
- `/payout-setup` — UPI/bank form
- `/profile/$code` — public referrer profile

Bottom-tab mobile nav + side nav on desktop. All pages mobile-first, themed via existing tokens.

### Phase 3 — Persona dashboards + manager (next turn)

- `/broker` — pipeline CRM, area performance, commission tracker
- `/influencer` — content stats, ready-to-post captions, click analytics
- `/corporate` — HR housing dashboard with department tracking
- `/manager` + `/manager/properties` + `/manager/properties/new` — PG owner listing management
- Persona-aware `/dashboard` that swaps layout based on `profile.persona`

### Phase 4 — Admin polish + production hardening (next turn)

- Admin: lead-detail timeline view, payouts page (separate from current admin), properties verification, analytics charts
- Click tracking server route (`/api/public/r/$code` → log click + redirect to signup)
- Notification triggers (status change → push notification row)
- Email via Lovable Cloud on key events
- SEO meta on every public route, OG image, sitemap
- Realtime on referrals + notifications
- Empty states, skeletons, error boundaries, 404 page

## Technical notes

- Backend stays on Supabase/Postgres + RLS — no Express port. Express endpoints become server functions or direct queries from components.
- Wouter routing is replaced with TanStack Router file routes (already set up).
- Zustand store kept (already a dep), but auth lives in `useAuth()` not the store.
- API client codegen (`@workspace/api-client-react`) is replaced with direct supabase calls + small typed wrappers in `src/lib/api/`.
- Charts use `recharts` (already in shadcn).

## Confirm before I start

I'll start Phase 1 + 2 immediately unless you say otherwise. If you'd rather I do all 4 phases sequentially without stopping, reply **"do all 4"** and I'll keep going across multiple turns until done.