# GiftLink - Full-Stack MERN Community Platform

GiftLink is a full-stack community platform designed to connect people who want to give away pre-loved household items with individuals seeking free items to reuse or recycle. It promotes sustainability, reduces household waste, and fosters community support.

---

## 🌟 Key Features
- **Item Listings & Detailed Views:** Browse household items across categories with photos, condition tags, and metadata.
- **Donate / List Items:** Logged-in users can list items to give away with custom or preset imagery, condition details, and location.
- **Interactive Gift Requests:** Connect with donors directly via pickup coordination request modals.
- **JWT Authentication:** Secure user registration, bcrypt password hashing, login, and profile management.
- **AI Sentiment Analysis:** Natural Language Processing (NLP) powered by the `natural` library to evaluate comment sentiment and feedback.
- **Smart Search & Filters:** Multi-criteria search by category, condition, keyword, and item age.
- **MongoDB NoSQL Persistence:** Robust storage with resilient fallback support for gifts, users, and community comments.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, React Router v6, Bootstrap Icons, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **NLP / AI:** `natural` Sentiment Analysis library

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Optional: resilient fallback in-memory datastore is included)

### 1. Setup Backend
```bash
cd giftlink-backend
npm install
npm run import-data    # Seeds sample gift items into MongoDB
npm start              # Starts backend on http://localhost:3060
```

### 2. Setup Frontend
```bash
cd giftlink-frontend
npm install
npm start              # Starts React on http://localhost:3000
```
