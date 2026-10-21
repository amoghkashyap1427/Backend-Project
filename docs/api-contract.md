# API Contract & Specification

This document defines the REST API contract for the portfolio backend service, serving as the interface specification for frontend integration.

---

## 1. Overview

- **Base URL:** `/api`
- **Data Format:** JSON for all request bodies and response payloads (`Content-Type: application/json`). Request body size limit is `1mb`.
- **Authentication:**
  - Token-based via JSON Web Tokens (JWT) stored in an **HTTP-only cookie** named `token`.
  - Token lifetime: **7 days** (`JWT_EXPIRES_IN=7d`).
  - Cookie configuration: `httpOnly: true`, `secure: true` in production, `sameSite: "none"` in production (`"lax"` in development), `maxAge: 7 days`.
- **Client Configuration:** Because authentication relies on cookies, all frontend requests must include credentials:
  - **`fetch`:** `{ credentials: "include" }`
  - **`axios`:** `{ withCredentials: true }`
- **CORS:** Restricts cross-origin requests exclusively to the origin specified by the `CLIENT_URL` environment variable (`credentials: true`), allowed methods: `GET`, `POST`, `PATCH`, `DELETE`, allowed header: `Content-Type`.
- **Security:** HTTP response headers secured via `helmet`; reverse proxy forwarding enabled (`trust proxy: 1`).
- **Rate Limiting:** Sensitive endpoints (`POST /api/auth/register` and `POST /api/auth/login`) are limited to **10 requests per 15 minutes per IP**. Exceeding this threshold responds with HTTP `429 Too Many Requests` and body `{ "message": "Too many attempts, please try again later" }`.

---

## 2. Errors

All error responses return a standardized JSON object containing a `message` string:

```json
{
  "message": "Error description here"
}
```

> In development mode (`NODE_ENV !== "production"`), status `>= 500` error payloads also include a `stack` property. In production, 500 error messages are sanitized and hidden behind `"Internal server error"`.

### HTTP Status Codes

| Status Code | Reason | Typical Scenarios |
| :--- | :--- | :--- |
| **`400 Bad Request`** | Validation / Client Syntax | Missing required fields, invalid data types, malformed JSON body (`entity.parse.failed`), schema validation failures (joined with `", "`), malformed MongoDB ID (`CastError` or `"Invalid id"`), reserved username used, or empty update payload on `PATCH` (`"No valid fields to update"`). |
| **`401 Unauthorized`** | Authentication Failure | Missing `token` cookie (`"Not authenticated"`), invalid or expired JWT (`"Invalid or expired token"`), user account deleted (`"User no longer exists"`), or invalid credentials on login (`"Invalid email or password"`). |
| **`404 Not Found`** | Missing Resource | Requested resource ID does not exist or does not belong to the authenticated user (`"Project not found"`), or unrecognized route under `/api` (`"Route not found: <METHOD> <URL>"`). |
| **`409 Conflict`** | Duplicate Resource | Registering with an existing email or username (`"Email is already taken"` / `"Username is already taken"`), or MongoDB duplicate key conflict (code `11000`). |
| **`429 Too Many Requests`** | Rate Limiting | Exceeded 10 requests per 15-minute window per IP on `/api/auth/register` or `/api/auth/login`. Returns `{ "message": "Too many attempts, please try again later" }`. |
| **`500 Internal Server Error`** | Server Failure | Unhandled server or database exceptions. Masked as `"Internal server error"` in production. |

---

## 3. Endpoints

### 3.1 Health Check

#### `GET /api/health`
Check backend server availability.

- **Auth Required:** No
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "status": "ok"
  }
  ```
- **Error Cases:**
  - `500 Internal Server Error`: Unexpected server issue.

---

### 3.2 Authentication

#### `POST /api/auth/register`
Create a new user account and set the session cookie.

- **Auth Required:** No
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | string | **Yes** | Full name (trimmed) |
  | `username` | string | **Yes** | 3–30 characters; lowercase alphanumeric, hyphens, and underscores only (`/^[a-z0-9_-]+$/`). Trimmed and lowercased automatically. |
  | `email` | string | **Yes** | Valid email address (`/^\S+@\S+\.\S+$/`). Trimmed and lowercased automatically. |
  | `password` | string | **Yes** | Minimum 8 characters. Hashed server-side with bcrypt (never returned). |
  | `bio` | string | No | Optional bio, maximum 300 characters (trimmed). |

  *Reserved Usernames:* The following usernames are disallowed and will be rejected: `api`, `login`, `register`, `dashboard`, `admin`.

- **Success Status:** `201 Created` (sets `token` cookie)
- **Example Response:**
  ```json
  {
    "id": "651a1b2c3d4e5f6a7b8c9d0e",
    "name": "Jane Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "bio": "Full-stack developer building modern web applications."
  }
  ```
- **Error Cases:**
  - `400 Bad Request`:
    - Missing required fields: `"Name, username, email and password are required"`
    - Non-string field types: `"Invalid input"`
    - Reserved username: `"This username is not available"`
    - Validation failures (e.g., `"Username must be at least 3 characters"`, `"Password must be at least 8 characters"`, `"Please enter a valid email"`, `"Bio must be at most 300 characters"`)
  - `409 Conflict`: `"Email is already taken"` or `"Username is already taken"`
  - `429 Too Many Requests`: Exceeded 10 attempts per 15 minutes per IP (`"Too many attempts, please try again later"`)
  - `500 Internal Server Error`: Internal failure

---

#### `POST /api/auth/login`
Authenticate existing user and set session cookie.

- **Auth Required:** No
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | string | **Yes** | User's registered email |
  | `password` | string | **Yes** | User's password |

- **Success Status:** `200 OK` (sets `token` cookie)
- **Example Response:**
  ```json
  {
    "id": "651a1b2c3d4e5f6a7b8c9d0e",
    "name": "Jane Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "bio": "Full-stack developer building modern web applications."
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Missing or non-string inputs (`"Email and password are required"`)
  - `401 Unauthorized`: Returns identical generic error message whether email is missing or password is wrong: `"Invalid email or password"`
  - `429 Too Many Requests`: Exceeded 10 attempts per 15 minutes per IP (`"Too many attempts, please try again later"`)
  - `500 Internal Server Error`: Internal failure

---

#### `POST /api/auth/logout`
Clear the user's authentication cookie.

- **Auth Required:** Yes
- **Request Body:** None
- **Success Status:** `200 OK` (clears `token` cookie)
- **Example Response:**
  ```json
  {
    "message": "Logged out"
  }
  ```
- **Error Cases:**
  - `401 Unauthorized`: Missing or expired cookie token (`"Not authenticated"`, `"Invalid or expired token"`)
  - `500 Internal Server Error`: Internal failure

---

#### `GET /api/auth/me`
Retrieve profile of currently authenticated user.

- **Auth Required:** Yes
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "id": "651a1b2c3d4e5f6a7b8c9d0e",
    "name": "Jane Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "bio": "Full-stack developer building modern web applications."
  }
  ```
- **Error Cases:**
  - `401 Unauthorized`: Missing or invalid token (`"Not authenticated"`, `"Invalid or expired token"`, or `"User no longer exists"`)
  - `500 Internal Server Error`: Internal failure

---

### 3.3 Projects

All project endpoints require authentication. Requests are automatically scoped to the logged-in user.

#### `GET /api/projects`
List projects belonging to the authenticated user, sorted newest first (`createdAt: -1`). Supports optional filtering via query parameters.

- **Auth Required:** Yes
- **Query Parameters:**
  - `tag` (string, optional): Comma-separated list of tags (e.g., `?tag=react,node`). Case-insensitive; items must contain **ALL** specified tags.
  - `search` (string, optional): Substring search (e.g., `?search=platform`). Case-insensitive regex match against `title` or `description`.
  - Both parameters can be combined: `?tag=react,typescript&search=dashboard`
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  [
    {
      "_id": "651a2b3c4d5e6f7a8b9c0d1e",
      "user": "651a1b2c3d4e5f6a7b8c9d0e",
      "title": "Developer Portfolio",
      "description": "Full-stack portfolio platform built with Express and React.",
      "repoUrl": "https://github.com/example/portfolio",
      "liveUrl": "https://portfolio.example.com",
      "architecture": "Client-server architecture with RESTful API and MongoDB persistence.",
      "techStack": ["Node.js", "Express", "MongoDB", "React"],
      "media": ["https://images.example.com/project-screenshot.png"],
      "isPublic": true,
      "tags": ["react", "express", "fullstack"],
      "createdAt": "2026-10-15T10:00:00.000Z",
      "updatedAt": "2026-10-15T12:00:00.000Z",
      "__v": 0
    }
  ]
  ```
- **Error Cases:**
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `POST /api/projects`
Create a new project for the authenticated user.

- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :--- | :--- |
  | `title` | string | **Yes** | Max 120 characters, trimmed |
  | `description` | string | **Yes** | Max 2000 characters, trimmed |
  | `repoUrl` | string | No | Trimmed URL string |
  | `liveUrl` | string | No | Trimmed URL string |
  | `architecture` | string | No | Trimmed string |
  | `techStack` | string[] | No | Array of strings |
  | `media` | string[] | No | Array of URL strings |
  | `isPublic` | boolean | No | Default: `false` |
  | `tags` | string[] | No | Array of strings (stored trimmed and lowercase) |

  *(Only whitelisted fields are accepted; any other properties sent by the client are stripped out.)*

- **Success Status:** `201 Created`
- **Example Response:**
  ```json
  {
    "_id": "651a2b3c4d5e6f7a8b9c0d1e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "title": "Developer Portfolio",
    "description": "Full-stack portfolio platform built with Express and React.",
    "repoUrl": "https://github.com/example/portfolio",
    "liveUrl": "https://portfolio.example.com",
    "architecture": "Client-server architecture with RESTful API and MongoDB persistence.",
    "techStack": ["Node.js", "Express", "MongoDB", "React"],
    "media": ["https://images.example.com/project-screenshot.png"],
    "isPublic": false,
    "tags": ["react", "express", "fullstack"],
    "createdAt": "2026-10-15T10:00:00.000Z",
    "updatedAt": "2026-10-15T10:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Schema validation failure (missing `title` or `description`, `title` exceeds 120 chars, `description` exceeds 2000 chars, or invalid types)
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `GET /api/projects/:id`
Fetch a single project by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a2b3c4d5e6f7a8b9c0d1e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "title": "Developer Portfolio",
    "description": "Full-stack portfolio platform built with Express and React.",
    "repoUrl": "https://github.com/example/portfolio",
    "liveUrl": "https://portfolio.example.com",
    "architecture": "Client-server architecture with RESTful API and MongoDB persistence.",
    "techStack": ["Node.js", "Express", "MongoDB", "React"],
    "media": ["https://images.example.com/project-screenshot.png"],
    "isPublic": true,
    "tags": ["react", "express", "fullstack"],
    "createdAt": "2026-10-15T10:00:00.000Z",
    "updatedAt": "2026-10-15T12:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Project does not exist or belongs to another user (`"Project not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `PATCH /api/projects/:id`
Update one or more fields of an existing project. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** Partial JSON containing any subset of whitelisted fields (`title`, `description`, `repoUrl`, `liveUrl`, `architecture`, `techStack`, `media`, `isPublic`, `tags`).
  
  **Toggling Visibility (`isPublic`):**
  To make a project public or private, send `{ "isPublic": true }` or `{ "isPublic": false }` in the request body.

- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a2b3c4d5e6f7a8b9c0d1e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "title": "Developer Portfolio v2",
    "description": "Full-stack portfolio platform built with Express and React.",
    "repoUrl": "https://github.com/example/portfolio",
    "liveUrl": "https://portfolio.example.com",
    "architecture": "Client-server architecture with RESTful API and MongoDB persistence.",
    "techStack": ["Node.js", "Express", "MongoDB", "React"],
    "media": ["https://images.example.com/project-screenshot.png"],
    "isPublic": true,
    "tags": ["react", "express", "fullstack"],
    "createdAt": "2026-10-15T10:00:00.000Z",
    "updatedAt": "2026-10-15T14:30:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`:
    - Invalid ObjectId format (`"Invalid id"`)
    - Empty body or no whitelisted fields present (`"No valid fields to update"`)
    - Schema validation failure on updated fields (`runValidators: true` is enforced)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Project not found or belongs to another user (`"Project not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `DELETE /api/projects/:id`
Delete a project by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "message": "Project deleted"
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Project not found or belongs to another user (`"Project not found"`)
  - `500 Internal Server Error`: Internal failure

---

### 3.4 Experience

All experience endpoints require authentication. Requests are automatically scoped to the logged-in user.

#### `GET /api/experience`
List experiences belonging to the authenticated user, sorted by start date descending (`startDate: -1`). Supports optional filtering via query parameters.

- **Auth Required:** Yes
- **Query Parameters:**
  - `tag` (string, optional): Comma-separated list of tags (e.g., `?tag=backend,lead`). Case-insensitive; items must contain **ALL** specified tags.
  - `search` (string, optional): Substring search (e.g., `?search=engineer`). Case-insensitive regex match against `company` or `role`.
  - Both parameters can be combined: `?tag=backend&search=engineer`
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  [
    {
      "_id": "651a3b4c5d6e7f8a9b0c1d2e",
      "user": "651a1b2c3d4e5f6a7b8c9d0e",
      "company": "Acme Corp",
      "role": "Senior Full-Stack Engineer",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": null,
      "isCurrent": true,
      "location": "San Francisco, CA (Remote)",
      "techStack": ["Node.js", "React", "TypeScript", "MongoDB"],
      "bullets": [
        "Led migration of microservices architecture reducing latency by 35%.",
        "Mentored junior engineers and conducted weekly design reviews."
      ],
      "isPublic": true,
      "tags": ["fullstack", "backend", "lead"],
      "createdAt": "2026-10-16T09:00:00.000Z",
      "updatedAt": "2026-10-16T11:00:00.000Z",
      "__v": 0
    }
  ]
  ```
- **Error Cases:**
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `POST /api/experience`
Create a new experience entry for the authenticated user.

- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :--- | :--- |
  | `company` | string | **Yes** | Max 120 characters, trimmed |
  | `role` | string | **Yes** | Max 120 characters, trimmed |
  | `startDate` | string / Date | **Yes** | Valid date format |
  | `endDate` | string / Date | No | Valid date format |
  | `isCurrent` | boolean | No | Default: `false` |
  | `location` | string | No | Trimmed string |
  | `techStack` | string[] | No | Array of strings, each trimmed |
  | `bullets` | string[] | No | Array of strings, each trimmed |
  | `isPublic` | boolean | No | Default: `false` |
  | `tags` | string[] | No | Array of strings (stored trimmed and lowercase) |

  *(Only whitelisted fields are accepted; any other properties sent by the client are stripped out.)*

- **Success Status:** `201 Created`
- **Example Response:**
  ```json
  {
    "_id": "651a3b4c5d6e7f8a9b0c1d2e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "company": "Acme Corp",
    "role": "Senior Full-Stack Engineer",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": null,
    "isCurrent": true,
    "location": "San Francisco, CA (Remote)",
    "techStack": ["Node.js", "React", "TypeScript", "MongoDB"],
    "bullets": [
      "Led migration of microservices architecture reducing latency by 35%.",
      "Mentored junior engineers and conducted weekly design reviews."
    ],
    "isPublic": false,
    "tags": ["fullstack", "backend", "lead"],
    "createdAt": "2026-10-16T09:00:00.000Z",
    "updatedAt": "2026-10-16T09:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Schema validation failure (missing `company`, `role`, or `startDate`, length constraints violated, or invalid date types)
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `GET /api/experience/:id`
Fetch a single experience entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a3b4c5d6e7f8a9b0c1d2e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "company": "Acme Corp",
    "role": "Senior Full-Stack Engineer",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": null,
    "isCurrent": true,
    "location": "San Francisco, CA (Remote)",
    "techStack": ["Node.js", "React", "TypeScript", "MongoDB"],
    "bullets": [
      "Led migration of microservices architecture reducing latency by 35%.",
      "Mentored junior engineers and conducted weekly design reviews."
    ],
    "isPublic": true,
    "tags": ["fullstack", "backend", "lead"],
    "createdAt": "2026-10-16T09:00:00.000Z",
    "updatedAt": "2026-10-16T11:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Experience does not exist or belongs to another user (`"Experience not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `PATCH /api/experience/:id`
Update one or more fields of an existing experience entry. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** Partial JSON containing any subset of whitelisted fields (`company`, `role`, `startDate`, `endDate`, `isCurrent`, `location`, `techStack`, `bullets`, `isPublic`, `tags`).

  **Toggling Visibility (`isPublic`):**
  To make an experience entry public or private, send `{ "isPublic": true }` or `{ "isPublic": false }` in the request body.

- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a3b4c5d6e7f8a9b0c1d2e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "company": "Acme Corp",
    "role": "Staff Engineer",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": null,
    "isCurrent": true,
    "location": "San Francisco, CA (Remote)",
    "techStack": ["Node.js", "React", "TypeScript", "MongoDB"],
    "bullets": [
      "Led migration of microservices architecture reducing latency by 35%.",
      "Promoted to Staff Engineer."
    ],
    "isPublic": true,
    "tags": ["fullstack", "backend", "staff"],
    "createdAt": "2026-10-16T09:00:00.000Z",
    "updatedAt": "2026-10-16T14:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`:
    - Invalid ObjectId format (`"Invalid id"`)
    - Empty body or no whitelisted fields present (`"No valid fields to update"`)
    - Schema validation failure on updated fields (`runValidators: true` is enforced)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Experience not found or belongs to another user (`"Experience not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `DELETE /api/experience/:id`
Delete an experience entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "message": "Experience deleted"
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Experience not found or belongs to another user (`"Experience not found"`)
  - `500 Internal Server Error`: Internal failure

---

### 3.5 Certifications

All certification endpoints require authentication. Requests are automatically scoped to the logged-in user.

#### `GET /api/certifications`
List certifications belonging to the authenticated user, sorted by completion date descending, then creation date descending (`completedOn: -1, createdAt: -1`). Supports optional filtering via query parameters.

- **Auth Required:** Yes
- **Query Parameters:**
  - `tag` (string, optional): Comma-separated list of tags (e.g., `?tag=aws,cloud`). Case-insensitive; items must contain **ALL** specified tags.
  - `search` (string, optional): Substring search (e.g., `?search=architect`). Case-insensitive regex match against `title`, `issuer`, or `credentialId`.
  - Both parameters can be combined: `?tag=aws,cloud&search=architect`
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  [
    {
      "_id": "651a4b5c6d7e8f9a0b1c2d3e",
      "user": "651a1b2c3d4e5f6a7b8c9d0e",
      "title": "AWS Certified Solutions Architect – Associate",
      "issuer": "Amazon Web Services",
      "credentialId": "AWS-PSA-12345",
      "verifyUrl": "https://aws.amazon.com/verification/AWS-PSA-12345",
      "completedOn": "2025-06-15T00:00:00.000Z",
      "fileUrl": "https://files.example.com/certificates/aws-csa.pdf",
      "isPublic": true,
      "tags": ["aws", "cloud", "architecture"],
      "createdAt": "2026-10-17T08:00:00.000Z",
      "updatedAt": "2026-10-17T08:00:00.000Z",
      "__v": 0
    }
  ]
  ```
- **Error Cases:**
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `POST /api/certifications`
Create a new certification entry for the authenticated user.

- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :--- | :--- |
  | `title` | string | **Yes** | Max 200 characters, trimmed |
  | `issuer` | string | **Yes** | Max 200 characters, trimmed |
  | `credentialId` | string | No | Trimmed string |
  | `verifyUrl` | string | No | Trimmed URL string |
  | `completedOn` | string / Date | No | Valid date format |
  | `fileUrl` | string | No | Trimmed URL string |
  | `isPublic` | boolean | No | Default: `false` |
  | `tags` | string[] | No | Array of strings (stored trimmed and lowercase) |

  *(Only whitelisted fields are accepted; any other properties sent by the client are stripped out.)*

- **Success Status:** `201 Created`
- **Example Response:**
  ```json
  {
    "_id": "651a4b5c6d7e8f9a0b1c2d3e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "title": "AWS Certified Solutions Architect – Associate",
    "issuer": "Amazon Web Services",
    "credentialId": "AWS-PSA-12345",
    "verifyUrl": "https://aws.amazon.com/verification/AWS-PSA-12345",
    "completedOn": "2025-06-15T00:00:00.000Z",
    "fileUrl": "https://files.example.com/certificates/aws-csa.pdf",
    "isPublic": false,
    "tags": ["aws", "cloud", "architecture"],
    "createdAt": "2026-10-17T08:00:00.000Z",
    "updatedAt": "2026-10-17T08:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Schema validation failure (missing `title` or `issuer`, max length constraints exceeded, or invalid date types)
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `GET /api/certifications/:id`
Fetch a single certification entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a4b5c6d7e8f9a0b1c2d3e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "title": "AWS Certified Solutions Architect – Associate",
    "issuer": "Amazon Web Services",
    "credentialId": "AWS-PSA-12345",
    "verifyUrl": "https://aws.amazon.com/verification/AWS-PSA-12345",
    "completedOn": "2025-06-15T00:00:00.000Z",
    "fileUrl": "https://files.example.com/certificates/aws-csa.pdf",
    "isPublic": true,
    "tags": ["aws", "cloud", "architecture"],
    "createdAt": "2026-10-17T08:00:00.000Z",
    "updatedAt": "2026-10-17T08:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Certification not found or belongs to another user (`"Certification not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `PATCH /api/certifications/:id`
Update one or more fields of an existing certification entry. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** Partial JSON containing any subset of whitelisted fields (`title`, `issuer`, `credentialId`, `verifyUrl`, `completedOn`, `fileUrl`, `isPublic`, `tags`).

  **Toggling Visibility (`isPublic`):**
  To make a certification entry public or private, send `{ "isPublic": true }` or `{ "isPublic": false }` in the request body.

- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a4b5c6d7e8f9a0b1c2d3e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "title": "AWS Certified Solutions Architect – Professional",
    "issuer": "Amazon Web Services",
    "credentialId": "AWS-PSP-67890",
    "verifyUrl": "https://aws.amazon.com/verification/AWS-PSP-67890",
    "completedOn": "2026-01-20T00:00:00.000Z",
    "fileUrl": "https://files.example.com/certificates/aws-csp.pdf",
    "isPublic": true,
    "tags": ["aws", "cloud", "professional"],
    "createdAt": "2026-10-17T08:00:00.000Z",
    "updatedAt": "2026-10-17T12:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`:
    - Invalid ObjectId format (`"Invalid id"`)
    - Empty body or no whitelisted fields present (`"No valid fields to update"`)
    - Schema validation failure on updated fields (`runValidators: true` is enforced)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Certification not found or belongs to another user (`"Certification not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `DELETE /api/certifications/:id`
Delete a certification entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "message": "Certification deleted"
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Certification not found or belongs to another user (`"Certification not found"`)
  - `500 Internal Server Error`: Internal failure

---

### 3.6 Skills

All skill endpoints require authentication. Requests are automatically scoped to the logged-in user.

#### `GET /api/skills`
List skills belonging to the authenticated user, sorted by category ascending, then name ascending (`category: 1, name: 1`). Supports optional filtering via query parameters.

- **Auth Required:** Yes
- **Query Parameters:**
  - `tag` (string, optional): Comma-separated list of tags (e.g., `?tag=backend,cloud`). Case-insensitive; items must contain **ALL** specified tags.
  - `search` (string, optional): Substring search (e.g., `?search=type`). Case-insensitive regex match against `name`.
  - `category` (string, optional): Filter by exact category. Accepts only `"Languages"`, `"Frameworks"`, `"Hardware-Robotics"`, or `"Cloud-DevOps"`. Any invalid value is ignored.
  - `proficiency` (string, optional): Filter by exact proficiency. Accepts only `"beginner"`, `"intermediate"`, or `"advanced"`. Any invalid value is ignored.
  - Parameters can be combined: `?category=Languages&proficiency=advanced&search=script`
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  [
    {
      "_id": "651a5b6c7d8e9f0a1b2c3d4e",
      "user": "651a1b2c3d4e5f6a7b8c9d0e",
      "name": "TypeScript",
      "category": "Languages",
      "proficiency": "advanced",
      "isPublic": true,
      "tags": ["frontend", "backend", "web"],
      "createdAt": "2026-10-18T09:00:00.000Z",
      "updatedAt": "2026-10-18T09:00:00.000Z",
      "__v": 0
    }
  ]
  ```
- **Error Cases:**
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `POST /api/skills`
Create a new skill entry for the authenticated user.

- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :--- | :--- |
  | `name` | string | **Yes** | Max 100 characters, trimmed |
  | `category` | string | **Yes** | Must be one of: `"Languages"`, `"Frameworks"`, `"Hardware-Robotics"`, `"Cloud-DevOps"` |
  | `proficiency` | string | No | Must be one of: `"beginner"`, `"intermediate"`, `"advanced"` (no default) |
  | `isPublic` | boolean | No | Default: `false` |
  | `tags` | string[] | No | Array of strings (stored trimmed and lowercase) |

  *(Only whitelisted fields are accepted; any other properties sent by the client are stripped out.)*

- **Success Status:** `201 Created`
- **Example Response:**
  ```json
  {
    "_id": "651a5b6c7d8e9f0a1b2c3d4e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "name": "TypeScript",
    "category": "Languages",
    "proficiency": "advanced",
    "isPublic": false,
    "tags": ["frontend", "backend", "web"],
    "createdAt": "2026-10-18T09:00:00.000Z",
    "updatedAt": "2026-10-18T09:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Schema validation failure (missing `name` or `category`, invalid `category` enum value, invalid `proficiency` enum value, or max length exceeded)
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `GET /api/skills/:id`
Fetch a single skill entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a5b6c7d8e9f0a1b2c3d4e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "name": "TypeScript",
    "category": "Languages",
    "proficiency": "advanced",
    "isPublic": true,
    "tags": ["frontend", "backend", "web"],
    "createdAt": "2026-10-18T09:00:00.000Z",
    "updatedAt": "2026-10-18T09:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Skill not found or belongs to another user (`"Skill not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `PATCH /api/skills/:id`
Update one or more fields of an existing skill entry. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** Partial JSON containing any subset of whitelisted fields (`name`, `category`, `proficiency`, `isPublic`, `tags`).

  **Toggling Visibility (`isPublic`):**
  To make a skill entry public or private, send `{ "isPublic": true }` or `{ "isPublic": false }` in the request body.

- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a5b6c7d8e9f0a1b2c3d4e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "name": "TypeScript",
    "category": "Languages",
    "proficiency": "advanced",
    "isPublic": true,
    "tags": ["frontend", "backend", "web", "expert"],
    "createdAt": "2026-10-18T09:00:00.000Z",
    "updatedAt": "2026-10-18T11:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`:
    - Invalid ObjectId format (`"Invalid id"`)
    - Empty body or no whitelisted fields present (`"No valid fields to update"`)
    - Schema validation failure on updated fields (invalid category/proficiency enum value, length exceeded; `runValidators: true` is enforced)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Skill not found or belongs to another user (`"Skill not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `DELETE /api/skills/:id`
Delete a skill entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "message": "Skill deleted"
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Skill not found or belongs to another user (`"Skill not found"`)
  - `500 Internal Server Error`: Internal failure

---

### 3.7 Open Source

All open source endpoints require authentication. Requests are automatically scoped to the logged-in user.

#### `GET /api/open-source`
List open source contributions belonging to the authenticated user, sorted newest first (`createdAt: -1`). Supports optional filtering via query parameters.

- **Auth Required:** Yes
- **Query Parameters:**
  - `tag` (string, optional): Comma-separated list of tags (e.g., `?tag=react,bugfix`). Case-insensitive; items must contain **ALL** specified tags.
  - `search` (string, optional): Substring search (e.g., `?search=cleanup`). Case-insensitive regex match against `repository`, `prTitle`, or `description`.
  - `status` (string, optional): Filter by exact status. Accepts only `"open"`, `"merged"`, or `"closed"`. Any invalid value is ignored.
  - Parameters can be combined: `?tag=react&search=cleanup&status=merged`
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  [
    {
      "_id": "651a6b7c8d9e0f1a2b3c4d5e",
      "user": "651a1b2c3d4e5f6a7b8c9d0e",
      "repository": "facebook/react",
      "prTitle": "Fix event listener cleanup in useEffect hook",
      "prUrl": "https://github.com/facebook/react/pull/12345",
      "status": "merged",
      "description": "Resolved a memory leak scenario when unmounting components with active listeners.",
      "isPublic": true,
      "tags": ["react", "javascript", "bugfix"],
      "createdAt": "2026-10-19T10:00:00.000Z",
      "updatedAt": "2026-10-19T10:00:00.000Z",
      "__v": 0
    }
  ]
  ```
- **Error Cases:**
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `POST /api/open-source`
Create a new open source contribution entry for the authenticated user.

- **Auth Required:** Yes
- **Request Body:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :--- | :--- |
  | `repository` | string | **Yes** | Max 200 characters, trimmed |
  | `prTitle` | string | **Yes** | Max 200 characters, trimmed |
  | `prUrl` | string | No | Trimmed URL string |
  | `status` | string | No | Enum: `"open"`, `"merged"`, `"closed"`. Default: `"open"`. |
  | `description` | string | No | Max 2000 characters, trimmed |
  | `isPublic` | boolean | No | Default: `false` |
  | `tags` | string[] | No | Array of strings (stored trimmed and lowercase) |

  *(Only whitelisted fields are accepted; any other properties sent by the client are stripped out.)*

- **Success Status:** `201 Created`
- **Example Response:**
  ```json
  {
    "_id": "651a6b7c8d9e0f1a2b3c4d5e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "repository": "facebook/react",
    "prTitle": "Fix event listener cleanup in useEffect hook",
    "prUrl": "https://github.com/facebook/react/pull/12345",
    "status": "open",
    "description": "Resolved a memory leak scenario when unmounting components with active listeners.",
    "isPublic": false,
    "tags": ["react", "javascript", "bugfix"],
    "createdAt": "2026-10-19T10:00:00.000Z",
    "updatedAt": "2026-10-19T10:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Schema validation failure (missing `repository` or `prTitle`, invalid `status` enum value, or max length exceeded)
  - `401 Unauthorized`: Not authenticated
  - `500 Internal Server Error`: Internal failure

---

#### `GET /api/open-source/:id`
Fetch a single open source contribution entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a6b7c8d9e0f1a2b3c4d5e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "repository": "facebook/react",
    "prTitle": "Fix event listener cleanup in useEffect hook",
    "prUrl": "https://github.com/facebook/react/pull/12345",
    "status": "merged",
    "description": "Resolved a memory leak scenario when unmounting components with active listeners.",
    "isPublic": true,
    "tags": ["react", "javascript", "bugfix"],
    "createdAt": "2026-10-19T10:00:00.000Z",
    "updatedAt": "2026-10-19T10:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Open source contribution not found or belongs to another user (`"Open source contribution not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `PATCH /api/open-source/:id`
Update one or more fields of an existing open source contribution entry. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** Partial JSON containing any subset of whitelisted fields (`repository`, `prTitle`, `prUrl`, `status`, `description`, `isPublic`, `tags`).

  **Toggling Visibility (`isPublic`):**
  To make an open source entry public or private, send `{ "isPublic": true }` or `{ "isPublic": false }` in the request body.

- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "_id": "651a6b7c8d9e0f1a2b3c4d5e",
    "user": "651a1b2c3d4e5f6a7b8c9d0e",
    "repository": "facebook/react",
    "prTitle": "Fix event listener cleanup in useEffect hook",
    "prUrl": "https://github.com/facebook/react/pull/12345",
    "status": "merged",
    "description": "Resolved a memory leak scenario when unmounting components with active listeners.",
    "isPublic": true,
    "tags": ["react", "javascript", "bugfix"],
    "createdAt": "2026-10-19T10:00:00.000Z",
    "updatedAt": "2026-10-19T11:00:00.000Z",
    "__v": 0
  }
  ```
- **Error Cases:**
  - `400 Bad Request`:
    - Invalid ObjectId format (`"Invalid id"`)
    - Empty body or no whitelisted fields present (`"No valid fields to update"`)
    - Schema validation failure on updated fields (invalid `status` enum value, length exceeded; `runValidators: true` is enforced)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Open source contribution not found or belongs to another user (`"Open source contribution not found"`)
  - `500 Internal Server Error`: Internal failure

---

#### `DELETE /api/open-source/:id`
Delete an open source contribution entry by ID. Must belong to the authenticated user.

- **Auth Required:** Yes
- **URL Parameters:**
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId
- **Request Body:** None
- **Success Status:** `200 OK`
- **Example Response:**
  ```json
  {
    "message": "Open source contribution deleted"
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Invalid ObjectId format (`"Invalid id"`)
  - `401 Unauthorized`: Not authenticated
  - `404 Not Found`: Open source contribution not found or belongs to another user (`"Open source contribution not found"`)
  - `500 Internal Server Error`: Internal failure

---

### 3.8 Public Profile

Publicly accessible profile endpoint aggregating all visible portfolio sections for a given user. No authentication required.

#### `GET /api/public/:username`
Fetch the public portfolio for a specified username.

- **Auth Required:** No
- **URL Parameters:**
  - `username` (string, required): Username of the profile owner (normalized with trim and lowercase).
- **Request Body:** None
- **Success Status:** `200 OK`
- **Exposed Fields & Privacy Rules:**
  - Returns only items where `isPublic: true` across all resource categories.
  - The `profile` object exposes **ONLY** `name`, `username`, and `bio`.
  - Sensitive user data (**email**, **password**, `_id`, and user timestamps) are **never returned**.
  - All resource items have owner ID (`user`) and version key (`__v`) stripped via `.select("-user -__v")`.
  - Resource sort orders:
    - `experience`: Sorted by `startDate` descending (`startDate: -1`)
    - `projects`: Sorted by `createdAt` descending (`createdAt: -1`)
    - `openSource`: Sorted by `createdAt` descending (`createdAt: -1`)
    - `certifications`: Sorted by `completedOn` descending, then `createdAt` descending (`completedOn: -1, createdAt: -1`)
    - `skills`: Sorted by `category` ascending, then `name` ascending (`category: 1, name: 1`)
- **Example Response:**
  ```json
  {
    "profile": {
      "name": "Jane Doe",
      "username": "janedoe",
      "bio": "Full-stack developer building modern web applications."
    },
    "experience": [
      {
        "_id": "651a3b4c5d6e7f8a9b0c1d2e",
        "company": "Acme Corp",
        "role": "Senior Full-Stack Engineer",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": null,
        "isCurrent": true,
        "location": "San Francisco, CA (Remote)",
        "techStack": ["Node.js", "React", "TypeScript", "MongoDB"],
        "bullets": [
          "Led migration of microservices architecture reducing latency by 35%."
        ],
        "isPublic": true,
        "tags": ["fullstack", "backend", "lead"],
        "createdAt": "2026-10-16T09:00:00.000Z",
        "updatedAt": "2026-10-16T11:00:00.000Z"
      }
    ],
    "projects": [
      {
        "_id": "651a2b3c4d5e6f7a8b9c0d1e",
        "title": "Developer Portfolio",
        "description": "Full-stack portfolio platform built with Express and React.",
        "repoUrl": "https://github.com/example/portfolio",
        "liveUrl": "https://portfolio.example.com",
        "architecture": "Client-server architecture with RESTful API and MongoDB persistence.",
        "techStack": ["Node.js", "Express", "MongoDB", "React"],
        "media": ["https://images.example.com/project-screenshot.png"],
        "isPublic": true,
        "tags": ["react", "express", "fullstack"],
        "createdAt": "2026-10-15T10:00:00.000Z",
        "updatedAt": "2026-10-15T12:00:00.000Z"
      }
    ],
    "openSource": [
      {
        "_id": "651a6b7c8d9e0f1a2b3c4d5e",
        "repository": "facebook/react",
        "prTitle": "Fix event listener cleanup in useEffect hook",
        "prUrl": "https://github.com/facebook/react/pull/12345",
        "status": "merged",
        "description": "Resolved a memory leak scenario when unmounting components with active listeners.",
        "isPublic": true,
        "tags": ["react", "javascript", "bugfix"],
        "createdAt": "2026-10-19T10:00:00.000Z",
        "updatedAt": "2026-10-19T10:00:00.000Z"
      }
    ],
    "certifications": [
      {
        "_id": "651a4b5c6d7e8f9a0b1c2d3e",
        "title": "AWS Certified Solutions Architect – Associate",
        "issuer": "Amazon Web Services",
        "credentialId": "AWS-PSA-12345",
        "verifyUrl": "https://aws.amazon.com/verification/AWS-PSA-12345",
        "completedOn": "2025-06-15T00:00:00.000Z",
        "fileUrl": "https://files.example.com/certificates/aws-csa.pdf",
        "isPublic": true,
        "tags": ["aws", "cloud", "architecture"],
        "createdAt": "2026-10-17T08:00:00.000Z",
        "updatedAt": "2026-10-17T08:00:00.000Z"
      }
    ],
    "skills": [
      {
        "_id": "651a5b6c7d8e9f0a1b2c3d4e",
        "name": "TypeScript",
        "category": "Languages",
        "proficiency": "advanced",
        "isPublic": true,
        "tags": ["frontend", "backend", "web"],
        "createdAt": "2026-10-18T09:00:00.000Z",
        "updatedAt": "2026-10-18T09:00:00.000Z"
      }
    ]
  }
  ```
- **Error Cases:**
  - `400 Bad Request`: Missing or non-string username (`"Invalid username"`)
  - `404 Not Found`: User does not exist (`"User not found"`)
  - `500 Internal Server Error`: Internal failure

---

## 4. Resource Object Schemas

The server enforces an explicit field whitelist on `POST` and `PATCH`. Any fields not on the client-writable whitelist (including server-managed fields like `_id`, `user`, timestamps, or arbitrary properties) are discarded by the controller.

### 4.1 Project Object Schema

| Field | Type | Origin / Access | Description / Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` (string) | **Server-set** | Unique MongoDB document identifier. |
| `user` | `ObjectId` (string) | **Server-set** | Reference to the owner's `User._id`. Indexed for query scoping. |
| `title` | `string` | **Client-writable** | **Required**. Max 120 characters, trimmed. |
| `description` | `string` | **Client-writable** | **Required**. Max 2000 characters, trimmed. |
| `repoUrl` | `string` | **Client-writable** | Optional. Repository URL, trimmed. |
| `liveUrl` | `string` | **Client-writable** | Optional. Live deployment URL, trimmed. |
| `architecture` | `string` | **Client-writable** | Optional. Architecture notes/diagram description, trimmed. |
| `techStack` | `string[]` | **Client-writable** | Optional. Array of technology names, each trimmed. |
| `media` | `string[]` | **Client-writable** | Optional. Array of media/image URLs, each trimmed. |
| `isPublic` | `boolean` | **Client-writable** | Optional. Default `false`. Controls public profile visibility. |
| `tags` | `string[]` | **Client-writable** | Optional. Array of tags, automatically trimmed and lowercased. |
| `createdAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was created. |
| `updatedAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was last modified. |
| `__v` | `number` | **Server-set** | Mongoose internal document version key. |

---

### 4.2 Experience Object Schema

| Field | Type | Origin / Access | Description / Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` (string) | **Server-set** | Unique MongoDB document identifier. |
| `user` | `ObjectId` (string) | **Server-set** | Reference to the owner's `User._id`. Indexed for query scoping. |
| `company` | `string` | **Client-writable** | **Required**. Max 120 characters, trimmed. |
| `role` | `string` | **Client-writable** | **Required**. Max 120 characters, trimmed. |
| `startDate` | `string` (ISO 8601 Date) | **Client-writable** | **Required**. Start date of the position. |
| `endDate` | `string` (ISO 8601 Date) | **Client-writable** | Optional. End date (omitted or null for current roles). |
| `isCurrent` | `boolean` | **Client-writable** | Optional. Default `false`. Indicates if currently working here. |
| `location` | `string` | **Client-writable** | Optional. Job location or arrangement, trimmed. |
| `techStack` | `string[]` | **Client-writable** | Optional. Array of technologies used, each trimmed. |
| `bullets` | `string[]` | **Client-writable** | Optional. Array of achievements or responsibilities, each trimmed. |
| `isPublic` | `boolean` | **Client-writable** | Optional. Default `false`. Controls public profile visibility. |
| `tags` | `string[]` | **Client-writable** | Optional. Array of tags, automatically trimmed and lowercased. |
| `createdAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was created. |
| `updatedAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was last modified. |
| `__v` | `number` | **Server-set** | Mongoose internal document version key. |

---

### 4.3 Certification Object Schema

| Field | Type | Origin / Access | Description / Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` (string) | **Server-set** | Unique MongoDB document identifier. |
| `user` | `ObjectId` (string) | **Server-set** | Reference to the owner's `User._id`. Indexed for query scoping. |
| `title` | `string` | **Client-writable** | **Required**. Max 200 characters, trimmed. |
| `issuer` | `string` | **Client-writable** | **Required**. Max 200 characters, trimmed. |
| `credentialId` | `string` | **Client-writable** | Optional. Credential or badge ID, trimmed. |
| `verifyUrl` | `string` | **Client-writable** | Optional. Verification URL, trimmed. |
| `completedOn` | `string` (ISO 8601 Date) | **Client-writable** | Optional. Completion or issue date. |
| `fileUrl` | `string` | **Client-writable** | Optional. URL to certificate document or badge file, trimmed. |
| `isPublic` | `boolean` | **Client-writable** | Optional. Default `false`. Controls public profile visibility. |
| `tags` | `string[]` | **Client-writable** | Optional. Array of tags, automatically trimmed and lowercased. |
| `createdAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was created. |
| `updatedAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was last modified. |
| `__v` | `number` | **Server-set** | Mongoose internal document version key. |

---

### 4.4 Skill Object Schema

| Field | Type | Origin / Access | Description / Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` (string) | **Server-set** | Unique MongoDB document identifier. |
| `user` | `ObjectId` (string) | **Server-set** | Reference to the owner's `User._id`. Indexed for query scoping. |
| `name` | `string` | **Client-writable** | **Required**. Max 100 characters, trimmed. |
| `category` | `string` | **Client-writable** | **Required**. Enum: `"Languages"`, `"Frameworks"`, `"Hardware-Robotics"`, `"Cloud-DevOps"`. |
| `proficiency` | `string` | **Client-writable** | Optional (no default). Enum: `"beginner"`, `"intermediate"`, `"advanced"`. |
| `isPublic` | `boolean` | **Client-writable** | Optional. Default `false`. Controls public profile visibility. |
| `tags` | `string[]` | **Client-writable** | Optional. Array of tags, automatically trimmed and lowercased. |
| `createdAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was created. |
| `updatedAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was last modified. |
| `__v` | `number` | **Server-set** | Mongoose internal document version key. |

---

### 4.5 Open Source Object Schema

| Field | Type | Origin / Access | Description / Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` (string) | **Server-set** | Unique MongoDB document identifier. |
| `user` | `ObjectId` (string) | **Server-set** | Reference to the owner's `User._id`. Indexed for query scoping. |
| `repository` | `string` | **Client-writable** | **Required**. Max 200 characters, trimmed. |
| `prTitle` | `string` | **Client-writable** | **Required**. Max 200 characters, trimmed. |
| `prUrl` | `string` | **Client-writable** | Optional. Pull request or issue URL, trimmed. |
| `status` | `string` | **Client-writable** | Optional. Enum: `"open"`, `"merged"`, `"closed"`. Default: `"open"`. |
| `description` | `string` | **Client-writable** | Optional. Max 2000 characters, trimmed. |
| `isPublic` | `boolean` | **Client-writable** | Optional. Default `false`. Controls public profile visibility. |
| `tags` | `string[]` | **Client-writable** | Optional. Array of tags, automatically trimmed and lowercased. |
| `createdAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was created. |
| `updatedAt` | `string` (ISO 8601) | **Server-set** | Timestamp when document was last modified. |
| `__v` | `number` | **Server-set** | Mongoose internal document version key. |

---

## 5. Query Parameters & Filtering

### 5.1 Query Parameters for `GET /api/projects`

| Parameter | Type | Behavior | Example |
| :--- | :--- | :--- | :--- |
| `tag` | string | Comma-separated list of tags. Filter is case-insensitive. An item must have **ALL** listed tags to match (`{ tags: { $all: [...] } }`). | `?tag=react,node` |
| `search` | string | Substring query. Filter performs a case-insensitive regex match against either `title` or `description` (`$or`). Special regex characters are escaped. | `?search=platform` |

- **Scope:** Always scoped to authenticated user (`user: req.user.id`).
- **Sorting:** Sorted newest first by creation date (`sort({ createdAt: -1 })`).

---

### 5.2 Query Parameters for `GET /api/experience`

| Parameter | Type | Behavior | Example |
| :--- | :--- | :--- | :--- |
| `tag` | string | Comma-separated list of tags. Filter is case-insensitive. An item must have **ALL** listed tags to match (`{ tags: { $all: [...] } }`). | `?tag=backend,lead` |
| `search` | string | Substring query. Filter performs a case-insensitive regex match against either `company` or `role` (`$or`). Special regex characters are escaped. | `?search=engineer` |

- **Scope:** Always scoped to authenticated user (`user: req.user.id`).
- **Sorting:** Sorted by **`startDate` descending** (`sort({ startDate: -1 })`).

---

### 5.3 Query Parameters for `GET /api/certifications`

| Parameter | Type | Behavior | Example |
| :--- | :--- | :--- | :--- |
| `tag` | string | Comma-separated list of tags. Filter is case-insensitive. An item must have **ALL** listed tags to match (`{ tags: { $all: [...] } }`). | `?tag=aws,cloud` |
| `search` | string | Substring query. Filter performs a case-insensitive regex match against `title`, `issuer`, or `credentialId` (`$or`). Special regex characters are escaped. | `?search=architect` |

- **Scope:** Always scoped to authenticated user (`user: req.user.id`).
- **Sorting:** Sorted by **`completedOn` descending, then `createdAt` descending** (`sort({ completedOn: -1, createdAt: -1 })`).

---

### 5.4 Query Parameters for `GET /api/skills`

| Parameter | Type | Behavior | Example |
| :--- | :--- | :--- | :--- |
| `tag` | string | Comma-separated list of tags. Filter is case-insensitive. An item must have **ALL** listed tags to match (`{ tags: { $all: [...] } }`). | `?tag=backend,web` |
| `search` | string | Substring query. Filter performs a case-insensitive regex match against `name`. Special regex characters are escaped. | `?search=type` |
| `category` | string | Exact filter on category. Only accepts one of the four exact enum values (`"Languages"`, `"Frameworks"`, `"Hardware-Robotics"`, `"Cloud-DevOps"`); ignores any other value. | `?category=Languages` |
| `proficiency` | string | Exact filter on proficiency. Only accepts `"beginner"`, `"intermediate"`, or `"advanced"`; ignores any other value. | `?proficiency=advanced` |

- **Scope:** Always scoped to authenticated user (`user: req.user.id`).
- **Sorting:** Sorted by **`category` ascending, then `name` ascending** (`sort({ category: 1, name: 1 })`).

---

### 5.5 Query Parameters for `GET /api/open-source`

| Parameter | Type | Behavior | Example |
| :--- | :--- | :--- | :--- |
| `tag` | string | Comma-separated list of tags. Filter is case-insensitive. An item must have **ALL** listed tags to match (`{ tags: { $all: [...] } }`). | `?tag=react,bugfix` |
| `search` | string | Substring query. Filter performs a case-insensitive regex match against `repository`, `prTitle`, or `description` (`$or`). Special regex characters are escaped. | `?search=cleanup` |
| `status` | string | Exact filter on status. Only accepts `"open"`, `"merged"`, or `"closed"`; ignores any other value. | `?status=merged` |

- **Scope:** Always scoped to authenticated user (`user: req.user.id`).
- **Sorting:** Sorted newest first by creation date (`sort({ createdAt: -1 })`).


