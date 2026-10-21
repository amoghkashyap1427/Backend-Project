# Portfolio Backend API

Backend REST API service powering developer portfolios with authentication, resource CRUD management (Projects, Experience, Certifications, Skills), and a public profile aggregator.

For complete endpoint request/response specifications, status codes, and schemas, see the [API Contract](../docs/api-contract.md).

---

## Folder Structure

`src/` is structured into `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, and `utils/`, separating schema definitions, business logic, route declarations, request middleware, and utility helpers.

---

## Setup & Local Development

### 1. Installation

Install project dependencies from the `server` directory:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Configure each variable in `.env`:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port number on which the Express server listens. | `5000` |
| `MONGO_URI` | MongoDB connection string including credentials and database name. | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority` |
| `CLIENT_URL` | Frontend client origin permitted by CORS policy. | `http://localhost:5173` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens. | Strong random string (e.g., `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | JWT token validity duration. | `7d` |
| `NODE_ENV` | Application environment mode (`development` or `production`). | `development` |

### 3. MongoDB Atlas Configuration

1. **Create Database User:** In the MongoDB Atlas Console under **Database Access**, create a database user with password authentication and `readWriteAnyDatabase` privileges.
2. **Configure IP Allowlist:** Under **Network Access**, add an IP allowlist entry. Use your current public IP for local development or `0.0.0.0/0` (allow access from anywhere) for cloud hosting providers.
3. **Obtain Connection String:** Under **Databases**, select **Connect** -> **Drivers** -> Node.js. Copy the connection string, replace `<password>` with the user password, and append the target database name (e.g., `/portfolio`) before query parameters:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

### 4. Running the Server

- **Development Mode** (auto-reloads on file changes using nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## Deployment (Render)

When deploying the backend web service to Render:

1. **Service Configuration:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Runtime:** Node (Node `>=18` defined in `package.json` engines)

2. **Environment Variables:** Set the following variables in the Render dashboard (names only, values configured per environment):
   - `PORT`
   - `MONGO_URI`
   - `CLIENT_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NODE_ENV` (set to `production`)

3. **MongoDB Atlas Network Access:**
   - In MongoDB Atlas under **Network Access**, ensure `0.0.0.0/0` (allow access from anywhere) is added to the IP Access List so dynamic Render IPs can connect to the database.

4. **CLIENT_URL Configuration Rule:**
   - `CLIENT_URL` must match your deployed Vercel frontend origin exactly: must begin with `https://` and have **no trailing slash** (e.g., `https://your-portfolio.vercel.app`).
   - The server strips trailing slashes on startup as a safeguard, but matching the exact origin ensures CORS preflight and cookie credentials succeed.

5. **Cookies & Reverse Proxy:**
   - The application configures `app.set("trust proxy", 1)` so Render's reverse proxy correctly forwards `X-Forwarded-*` headers.
   - In production (`NODE_ENV=production`), authentication cookies are issued with `httpOnly: true`, `secure: true`, and `sameSite: "none"` to allow cross-origin credentials between the Vercel frontend and Render backend.
   - Error messages are sanitized and internal stack traces are hidden in production.

