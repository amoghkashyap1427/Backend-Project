# Career Tracker - Client

React + Vite client of the Career & Portfolio Tracker application.

## Requirements

- **Node.js**: v20+ (v24.14.1 in use)
- **npm**: v10+ (v11.11.0 in use)

## Setup Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The application runs locally on [http://localhost:5173](http://localhost:5173).

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | The server API base URL | `http://localhost:5000/api` |
| `VITE_USE_MOCK` | Set to `"true"` to run the app on built-in mock data with no server (changes reset on refresh). Set to `"false"` to talk to the real server. | `false` |

> **Important**: `VITE_USE_MOCK` must be `false` or unset in production.

## Scripts

- `npm run dev`: Starts the Vite local development server.
- `npm run build`: Builds the production bundle in `dist/`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to check for code quality and style issues.

## Routes

| Path | Page | Access |
| :--- | :--- | :--- |
| `/` | `Landing` | Public |
| `/login` | `Login` | Guest only |
| `/register` | `Register` | Guest only |
| `/u/:username` | `PublicPortfolio` | Public |
| `/dashboard` | `Overview` | Protected |
| `/dashboard/projects` | `Projects` | Protected |
| `/dashboard/experience` | `Experience` | Protected |
| `/dashboard/open-source` | `OpenSource` | Protected |
| `/dashboard/certifications` | `Certifications` | Protected |
| `/dashboard/skills` | `Skills` | Protected |
| `*` | `NotFound` | 404 fallback |

## Auth Notes

- **HTTP-Only Cookie**: The JWT lives in an HTTP-only cookie set by the backend server for secure session management.
- **withCredentials**: Axios is configured with `withCredentials: true` so cookies are sent with all API requests.
- **CORS Configuration**: The server CORS must allow the client origin (`http://localhost:5173` in development).
- **Cross-Domain Production**: In production across different domains, the cookie needs `SameSite=None` and `Secure`.

## Deployment on Vercel

- Set `VITE_API_URL` to your production server API base URL.
- Set `VITE_USE_MOCK` to `false`.
- `vercel.json` provides SPA rewrite rules so refreshing deep links like `/u/:username` or `/dashboard` loads `index.html` instead of returning 404 errors:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

## Project Structure Overview

- **`pages/`**: Page-level components (`Landing`, `Login`, `Register`, `PublicPortfolio`, `NotFound`, and `dashboard/` subpages).
- **`components/`**: Reusable components (`ui/` design system primitives, `forms/` entity modal forms, `dashboard/` workspace widgets, `portfolio/` public profile sections, and route guards `ProtectedRoute` / `GuestRoute`).
- **`context/`**: React context providers (`AuthContext`).
- **`hooks/`**: Custom React hooks (`useAuth`, `useItems`).
- **`lib/`**: External library configurations (`api.js` for Axios client, `mockData.js` for local mock fixtures).
- **`utils/`**: Helper utility functions (`filterItems.js`, `format.js`).
