# GiftLink - Full-Stack Capstone Project

GiftLink is a full-stack community platform connecting users looking to give away pre-loved household items with individuals seeking free items to reuse or recycle.

---

## 🌟 Key Features
- **Item Listings & Detailed Views:** Browse diverse categories with photos, condition badges, and metadata.
- **MongoDB NoSQL Persistence:** Robust schema for gift items, users, and comments.
- **JWT Authentication:** Secure user registration, password hashing (bcrypt), login, and profile update endpoints.
- **Sentiment Analysis:** Integrated Natural Language Processing using the `natural` library to evaluate comment sentiment.
- **Smart Search & Filters:** Search by category, item condition, keyword, and age.
- **Docker & CI/CD:** Containerized backend/frontend services with automated GitHub Actions testing pipeline.

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Setup Backend
```bash
cd giftlink-backend
npm install
npm run import-data    # Seeds 16 documents into MongoDB
npm start              # Runs backend on http://localhost:3060
```

### 2. Setup Frontend
```bash
cd giftlink-frontend
npm install
npm start              # Runs React on http://localhost:3000
```

### 3. Docker Compose (Alternative)
```bash
docker-compose up --build
```
