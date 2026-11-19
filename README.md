# 🎁 GiftLink - Full-Stack MERN Community Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.5+-emerald.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-25%20Passed-brightgreen.svg)](#-automated-integration-testing)

**GiftLink** is an enterprise-grade, full-stack community sharing platform designed to connect people who want to give away pre-loved household items with individuals seeking free items to reuse or recycle. It fosters sustainability, reduces landfill waste, and builds meaningful community support networks.

---

## 🌟 Key Features & Architecture Highlights

### 1. 🛡️ Enterprise Security & Robust Authentication
- **JWT & bcrypt Authentication:** Secure user registration, password hashing (10 salt rounds), and stateless token validation.
- **IDOR Protection:** Profile update endpoint (`PUT /api/auth/update`) derives user identity strictly from the verified JWT payload rather than untrusted request bodies.
- **Helmet Security Headers:** Comprehensive HTTP header hardening (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`).
- **Tiered Rate Limiting:** Global API rate limiter alongside strict brute-force protection on authentication routes (`/api/auth/*`).
- **ReDoS / Regex Injection Defense:** Automated input sanitization and regex escaping to prevent Regular Expression Denial of Service attacks on search endpoints.

### 2. 📦 Donor Ownership & Lifecycle Management (CRUD)
- **Donor Ownership:** Every gift listing is linked to the authenticated donor's profile.
- **My Listed Gifts Dashboard:** A dedicated dashboard in the Profile page allowing donors to view, manage, and monitor all items they have posted.
- **Owner-Only Edit & Delete:** Donors have exclusive permissions to update details (condition, category, image, description) or remove their listings.

### 3. 🤝 Persistent Claim & Request Workflow
- **Interactive Claim Modal:** Beneficiaries can request an item directly from the item details page with personalized messages and contact details.
- **Donor Request Inbox:** Donors can review incoming requests on their profile dashboard with one-click **Accept** or **Reject** actions.
- **Automatic Status Synchronization:** Accepting a request automatically transitions the gift item status from `Available` to `Claimed` and resolves pending requests.
- **Self-Claim Prevention:** Strict validation prevents donors from requesting their own gift items.

### 4. 📸 Device Image Upload Engine (Multer)
- **Device Uploads:** Upload photos directly from phone or desktop via the drag-and-drop file uploader.
- **Static Asset Serving:** Uploaded images are validated (MIME-type check, 5MB limit, sanitized filenames) and served securely via `/uploads/*`.
- **Flexible Imagery:** Supports both direct file uploads and web image URLs.

### 5. ⚡ Server-Side Pagination, Filtering & Sorting
- **Scalable Pagination:** `GET /api/gifts?page=1&limit=6` with complete metadata (`totalPages`, `hasNextPage`, `hasPrevPage`, `total`).
- **Dynamic Filtering & Sorting:** Filter items by category and condition, search by keyword, and sort by newest, oldest, or name.
- **Animated Shimmer Skeleton Loaders:** Modern shimmering skeleton cards provide smooth perceived performance while fetching catalog listings.

### 6. 🧠 AI Sentiment Analysis
- **NLP Sentiment Engine:** Powered by the `natural` library (`SentimentAnalyzer` with Porter stemmer and AFINN lexicon) to score community feedback and comment sentiment.

### 7. 💾 Resilient Fallback Datastore
- **Zero-Downtime Fallback:** Built-in in-memory fallback datastore in `models/db.js` that mimics MongoDB when a local database service is unavailable, ensuring development and test suites run seamlessly.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Bootstrap Icons, CSS3 Variables, Context API |
| **Backend** | Node.js (v20+), Express.js, Helmet, Express Rate Limit, Multer, Pino Logger |
| **Database** | MongoDB NoSQL (with in-memory fallback emulation) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Input Sanitization |
| **AI / NLP** | `natural` (Porter Stemmer & Sentiment Analyzer) |
| **DevOps & Testing** | Docker, Docker Compose, Nginx, Node.js Test Runner, Supertest |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x+)
- [MongoDB](https://www.mongodb.com/) (Optional: in-memory fallback datastore runs automatically if MongoDB is not present)
- [Docker](https://www.docker.com/) & Docker Compose (Optional for containerized execution)

---

### Method A: Local Development Setup

#### 1. Backend Service
```bash
# Navigate to backend directory
cd giftlink-backend

# Install dependencies
npm install

# Seed initial catalog items (Optional)
npm run import-data

# Start backend development server (Runs on http://localhost:3060)
npm start
```

#### 2. Frontend Service
```bash
# In a new terminal window, navigate to frontend directory
cd giftlink-frontend

# Install dependencies
npm install

# Start React app (Runs on http://localhost:3000)
npm start
```

Visit **`http://localhost:3000`** in your browser.

---

### Method B: Docker Containerized Deployment

Run the entire application (MongoDB + Express Backend + Nginx-backed React Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:3060`
- **MongoDB Database:** `localhost:27017`

To stop the containers:
```bash
docker compose down
```

---

## 🧪 Automated Integration Testing

GiftLink includes a comprehensive automated integration test suite with **25 end-to-end tests** covering all critical security and business logic workflows.

```bash
cd giftlink-backend
npm test
```

### Test Coverage Highlights:
- ✅ **Health Check & Security:** Verifies `/api/health` status and Helmet `nosniff` security headers.
- ✅ **Auth & IDOR Defense:** Validates user registration, duplicate email rejection, JWT login, invalid credential rejection, and prevents unauthorized profile updates.
- ✅ **Gifts CRUD & Ownership:** Verifies paginated responses, field validation, authenticated gift creation, donor listings, and unauthorized modification defense (403 Forbidden).
- ✅ **Search & ReDoS Safety:** Tests multi-criteria searches and verifies complex regex escaping under potential ReDoS payload strings.
- ✅ **Request Workflow:** Verifies self-request prevention, claim submission, donor inbox retrieval, and donor accept/reject transitions.

---

## 📋 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `PUT` | `/api/auth/update` | Private (JWT) | Securely update profile details |

### Gifts (`/api/gifts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/gifts` | Public | List all gifts (supports `?page=`, `?limit=`, `?category=`, `?sort=`) |
| `GET` | `/api/gifts/:id` | Public | Retrieve detailed information for a specific gift |
| `POST` | `/api/gifts` | Public / Private | List a new gift (donor info linked when authenticated) |
| `PUT` | `/api/gifts/:id` | Private (Owner) | Update an existing gift listing |
| `DELETE` | `/api/gifts/:id` | Private (Owner) | Delete a gift listing |
| `GET` | `/api/gifts/my-gifts` | Private (JWT) | Retrieve all gift listings created by the logged-in donor |
| `POST` | `/api/gifts/:id/comments` | Public / Private | Post a comment with sentiment analysis |

### Search & Uploads
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/search` | Public | Multi-criteria search (`name`, `category`, `condition`, `age_years`) |
| `POST` | `/api/upload` | Public / Private | Upload image file (Multer multipart/form-data) |
| `GET` | `/uploads/:filename` | Public | Serve uploaded image files statically |

### Requests & Claims (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Public / Private | Submit a claim request for an available gift |
| `GET` | `/api/requests/received` | Private (JWT) | Get incoming claim requests for the donor's items |
| `GET` | `/api/requests/sent` | Private (JWT) | Get outgoing requests submitted by the logged-in user |
| `PUT` | `/api/requests/:id/status` | Private (Owner) | Accept or Reject an incoming claim request |

---

## 🔐 Environment Variables

### Backend (`giftlink-backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port for Express API server | `3060` |
| `MONGO_URL` | MongoDB connection string | `mongodb://127.0.0.1:27017/giftlinkdb` |
| `JWT_SECRET` | Secret key for signing and verifying tokens | `giftlink_jwt_super_secret_key_2026` |
| `NODE_ENV` | Application environment (`development`/`production`/`test`) | `development` |

### Frontend (`giftlink-frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `REACT_APP_BACKEND_URL` | Base URL of backend API server | `http://localhost:3060` (or empty for proxy) |
| `PORT` | Local React development server port | `3000` |

---

## 📂 Project Structure

```
GiftLink Capstone/
├── docker-compose.yml              # Root Docker Compose orchestrator
├── README.md                       # Comprehensive project documentation
├── giftlink-backend/
│   ├── Dockerfile                  # Container definition for Express backend
│   ├── .dockerignore
│   ├── .env.example                # Backend environment template
│   ├── app.js                      # Express application entrypoint
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT authentication & extraction middleware
│   │   └── rateLimiters.js         # Helmet & Express rate limiting configurations
│   ├── models/
│   │   └── db.js                   # MongoDB connection with in-memory fallback
│   ├── routes/
│   │   ├── authRoutes.js           # Auth & profile update endpoints
│   │   ├── giftRoutes.js           # Gifts CRUD, pagination, and ownership endpoints
│   │   ├── searchRoutes.js         # ReDoS-safe search engine
│   │   ├── requestRoutes.js        # Gift claim request workflow endpoints
│   │   └── uploadRoutes.js         # Multer direct image upload endpoint
│   ├── sentiment/
│   │   └── index.js                # Natural language processing sentiment analyzer
│   ├── tests/
│   │   └── api.test.js             # 25 automated integration tests (Supertest)
│   └── uploads/                    # Local directory for uploaded gift images
└── giftlink-frontend/
    ├── Dockerfile                  # Multi-stage production container for React & Nginx
    ├── .dockerignore
    ├── nginx.conf                  # Nginx reverse proxy configuration
    ├── .env.example                # Frontend environment template
    ├── package.json
    └── src/
        ├── App.js                  # Main route configuration
        ├── index.css               # Global theme & animated shimmer skeleton styles
        ├── config.js               # Centralized API_BASE_URL configuration
        ├── context/
        │   └── AuthContext.js      # Global authentication state management
        └── components/
            ├── Navbar/             # Navigation header
            ├── MainPage/           # Landing page with hero banner & featured items
            ├── GiftsPage/          # Paginated catalog with filter controls
            ├── DetailsPage/        # Item details, sentiment comments & request modal
            ├── AddGiftPage/        # Gift listing form with photo uploader
            ├── SearchPage/         # Multi-criteria filter search engine
            ├── Profile/            # Profile settings & donor/beneficiary request tabs
            ├── LoginPage/          # Sign-in form with password toggle
            └── RegisterPage/       # Sign-up form with validation & password toggle
```

---

## 📜 License
Distributed under the MIT License. Built with ❤️ for community sharing and sustainable living.
