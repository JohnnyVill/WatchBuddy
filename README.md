# WatchBuddy

A movie discovery and personal watch-history app built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

Browse popular, top-rated, now-playing, and upcoming movies; view movie details and trailers; see subscription, rental, and purchase options in the United States; and mark movies as watched. Browsing is public. Accounts save a private history, with the most recently watched movies first.

## Local setup

Use Node.js 24 LTS or newer and npm.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and fill in the variables.
3. Run `npm run db:migrate` against your development database.
4. Run `npm run dev` and open http://localhost:3000.

Environment variables:

| Variable | Purpose |
| --- | --- |
| `TMDB_API_KEY` | TMDB API **read-access bearer token**, not the v3 query-string API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_SSL` | Defaults to TLS; set `false` only for a local database without TLS |
| `SESSION_SECRET` | JWT signing secret containing at least 32 bytes |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | API rate limiting; required in production, optional locally |
| `TMDB_BASE_URL` | Optional isolated-test metadata endpoint; normally leave unset |

Generate a session secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`.

Authentication uses custom JWT sessions signed with `jose`, HTTP-only cookies, and `bcrypt` password hashes. NextAuth is an existing unused dependency, not the authentication implementation. Cookies are secure in production and support local HTTP during development. Passwords retain spaces and are limited to 72 UTF-8 bytes to prevent bcrypt truncation; usernames are trimmed and limited to 100 characters.

## Database migrations

`npm run db:migrate` reads `.env.local` if present, applies pending SQL files from `migrations/` in order, and records them in `schema_migrations`. The runner uses a transaction and advisory lock; running it again is safe.

The initial migration creates `users` and `watch_history`, ensures the unique indexes used by signup and watched updates, and adds the watch timestamp if missing. Existing rows are preserved. Duplicate usernames or duplicate user/movie pairs must be resolved before applying unique indexes; the migration will fail rather than delete data. Back up an existing production database and review the migration before applying it there.

## Verification

- `npm run lint`: application, scripts, and tests; local skill bundles and generated artifacts are excluded.
- `npm run typecheck`: TypeScript without emitting files.
- `npm test`: catalog filtering, deduplication, and input validation.
- `npm run build`: optimized production build.
- `npm run test:browser`: isolated browser and HTTP regression checks.

Browser tests use an installed Chrome, Chromium, or Edge executable via its DevTools protocol. No browser automation package is needed. Set `BROWSER_EXECUTABLE` if automatic detection does not find your browser. The runner starts a local TMDB fixture and a separate Next.js development server on port 3201; override this with `TEST_APP_PORT`. It overrides all service credentials and never connects to your normal database. Screenshots are written to `test-results/`; temporary browser profiles are stored in `.cache/browser/`.

To include real PostgreSQL integration checks, provide `TEST_DATABASE_URL` pointing to a **dedicated test database**, migrate that database, then run browser tests. Otherwise only those database checks are skipped; client interactions use controlled API responses. CI creates a disposable PostgreSQL database and runs migrations twice, lint, unit tests, build, typecheck, and browser tests.

## Data and API behavior

Public TMDB metadata is cached for 15 minutes. User history and watched status use private, uncached responses. Catalog errors remain distinct from empty categories; rows retain their loaded movies and retry the failed page.

Existing endpoint URLs are preserved:

- `GET /api/movies?category=popular|top_rated|now_playing|upcoming&page=1` returns `{ results, page, total_pages }`. Pages are limited to 1–500. Upcoming filtering is applied to every page without losing pagination metadata.
- `GET /api/movies/watched` returns `{ results }` for authenticated users, or 401 for guests.
- `GET /api/movies/watched?movieId=123` returns `{ watched: boolean }` without fetching the entire TMDB history.
- `POST /api/users` accepts `{ movieId: number | string, completed: boolean }` and saves the authenticated user's watched state.
- `POST /api/auth/signup` and `POST /api/auth/login` accept `{ username, password }`; `POST /api/auth/logout` clears the session.
- Errors return a non-success status and a `message` rather than a successful empty list.

The UI is movie-only and US-only. Provider availability comes from TMDB's JustWatch data and links to the supplied TMDB watch page; provider logos are not direct streaming links. JustWatch attribution is shown beside provider information.

## Accessibility and future work

The interface supports keyboard movie links, visible focus, native modal dialogs with contained focus, password visibility, descriptive empty/error states, reduced motion, touch scrolling, and desktop row controls. System fonts remove a build-time dependency on Google Fonts.

Next priorities are title search and a separate watchlist/library. TV tracking, recommendations, shared lists, and social features are outside this release.
