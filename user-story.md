# GiftLink Capstone Project - User Stories

## Project Overview
GiftLink is a full-stack web application designed to connect users who want to give away unwanted household items with individuals seeking free items to reuse or recycle. This promotes sustainability, reduces household waste, and builds community support.

---

## User Story Template
```markdown
**As a** [type of user],
**I want to** [perform some action],
**So that** [achieve some desired outcome/value].

### Acceptance Criteria:
1. Criterion 1
2. Criterion 2
3. Criterion 3
```

---

## Defined User Stories for GiftLink

### Story 1: User Registration
- **ID:** US-01
- **Title:** Register a New Account
- **Label:** `new`
- **Description:**
  - **As a** new visitor to GiftLink,
  - **I want to** register an account using my name, email address, and a secure password,
  - **So that** I can create item listings, add comments, and request items.
- **Acceptance Criteria:**
  1. Registration form validates email uniqueness and password strength.
  2. Passwords are encrypted before storing in the database.
  3. A JWT authentication token is issued upon successful registration.

---

### Story 2: User Authentication & Login
- **ID:** US-02
- **Title:** Secure User Login
- **Label:** `backlog`
- **Description:**
  - **As a** registered user,
  - **I want to** log in with my email and password,
  - **So that** I can access my account features securely.
- **Acceptance Criteria:**
  1. Valid credentials grant access and return a signed JWT token.
  2. Invalid credentials display clear, user-friendly error messages.
  3. Token is stored securely in session storage for authenticated API requests.

---

### Story 3: View All Available Gift Listings
- **ID:** US-03
- **Title:** Browse Main Gift Catalog
- **Label:** `backlog`
- **Description:**
  - **As a** browsing user,
  - **I want to** see a grid of all available household items with photos, titles, and condition tags,
  - **So that** I can quickly discover items that interest me.
- **Acceptance Criteria:**
  1. The landing page displays all active gift items from MongoDB.
  2. Each card showcases the item title, image, category, and date added.
  3. Clicking on an item card navigates directly to its detailed view.

---

### Story 4: Detailed Item View & Metadata
- **ID:** US-04
- **Title:** View Item Details & Sentiment Feedback
- **Label:** `backlog`
- **Description:**
  - **As a** potential recipient,
  - **I want to** view detailed specifications, condition, age, and existing comments of an item,
  - **So that** I can assess whether it meets my needs before requesting.
- **Acceptance Criteria:**
  1. Endpoint `/api/gifts/:id` returns comprehensive product metadata.
  2. Existing user comments and reviews are displayed with sentiment rating indicators.

---

### Story 5: Search and Category Filtering
- **ID:** US-05
- **Title:** Search & Filter Items
- **Label:** `backlog`
- **Description:**
  - **As a** user looking for a specific item,
  - **I want to** filter listings by category, condition, age, or keyword,
  - **So that** I can quickly locate relevant items without scrolling through the whole catalog.
- **Acceptance Criteria:**
  1. Endpoint `/api/search` filters by category (e.g. Living, Bedroom, Kitchen, Electronics).
  2. Multi-parameter queries return matching documents accurately.

---

### Story 6: User Profile Management
- **ID:** US-06
- **Title:** Update User Profile
- **Label:** `new`
- **Description:**
  - **As a** registered user,
  - **I want to** update my name and personal details in my profile,
  - **So that** my contact information remains up to date.
- **Acceptance Criteria:**
  1. Authenticated endpoint `PUT /api/auth/update` validates the JWT token.
  2. Successfully updates the user record in the MongoDB `users` collection.

---

### Story 7: Sentiment Analysis on User Reviews
- **ID:** US-07
- **Title:** Analyze Comment Sentiment
- **Label:** `icebox`
- **Description:**
  - **As an** administrator or community member,
  - **I want to** automatically analyze the sentiment of posted comments using Natural Language Processing (NLP),
  - **So that** positive and constructive feedback is highlighted.
- **Acceptance Criteria:**
  1. Backend integrates the `natural` npm package sentiment analyzer.
  2. Comments receive a calculated sentiment score (positive, neutral, negative).

---

### Story 8: Automated CI/CD & Containerization
- **ID:** US-08
- **Title:** Containerize Application & Setup CI/CD Pipeline
- **Label:** `technical debt`
- **Description:**
  - **As a** DevOps engineer,
  - **I want to** create Dockerfiles, Docker Compose, and a GitHub Actions pipeline,
  - **So that** testing and deployment can be automated reliably.
- **Acceptance Criteria:**
  1. Docker containers build frontend and backend services cleanly.
  2. GitHub Actions runs automated build, lint, and test steps on push.
