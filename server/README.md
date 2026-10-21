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

## Deployment (Render / Railway)

When deploying to cloud platforms like Render or Railway:

1. **Environment Variables:** Set all variables defined in `.env.example` in the hosting platform's dashboard:
   - Set `NODE_ENV=production`. This disables development DNS workarounds, hides 500 error stack traces/details, and enables production cookie security.
   - Set `CLIENT_URL` to your live frontend URL (e.g., `https://my-portfolio.vercel.app`) without trailing slashes.
   - Set `MONGO_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN`.
2. **Reverse Proxy & Cookies:**
   - The application configures `app.set("trust proxy", 1)` so reverse proxies (like Render/Railway routing layers) correctly pass `X-Forwarded-*` headers.
   - In production (`NODE_ENV === "production"`), authentication cookies are automatically issued with `secure: true` and `sameSite: "none"` to allow credentials to be sent cross-domain from the frontend to the backend.
3. **Security & Rate Limiting:**
   - Security headers are enabled via `helmet`.
   - CORS is restricted to `CLIENT_URL` allowing only `GET`, `POST`, `PATCH`, `DELETE` methods and the `Content-Type` header.
   - Auth endpoints (`/api/auth/register` and `/api/auth/login`) are protected with rate limiting (10 requests per 15 minutes per IP).
