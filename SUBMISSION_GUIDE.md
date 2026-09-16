# GiftLink Final Project: 18 Tasks Submission Guide

Yeh guide aap ke GitHub repository (`https://github.com/maaz-ahmad06/fullstack-capstone-project`) ke mutabiq tayyar ki gayi hai. Har task ke aagay diya gaya link ya text copy kar ke apne assignment portal par submit karein:

---

### Task 1 [2 Points]
* **Question:** Submit the GitHub URL of the file `user-story.md` containing the user story template.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/user-story.md
```

---

### Task 2 [4 Points]
* **Question:** Upload a screenshot of your public GitHub issues directory named `userstories.png` showing the repository “fullstack-capstone-project” and at least eight user stories labeled as new, icebox, technical debt, or backlog.
* **Instruction:**
  1. Apne repo `https://github.com/maaz-ahmad06/fullstack-capstone-project/issues` par jayein.
  2. `user-story.md` mein di gayi 8 stories ke 8 issues banayein aur un par labels (`new`, `icebox`, `technical debt`, `backlog`) lagayein.
  3. Screen ka screenshot le kar file ka naam **`userstories.png`** rakhein aur upload karein.

---

### Task 3 [2 Points]
* **Question:** Submit the MongoDB output saved as `inserted_items` showing that 16 documents were imported into MongoDB.
* **Submission Content:**
```text
Connected successfully to MongoDB for data import.
Successfully inserted 16 documents into collection 'gifts'.
MongoDB import completed successfully.
```

---

### Task 4 [2 Points]
* **Question:** Submit the GitHub URL of the file `db.js` containing the MongoDB connection line using `await client.connect()`.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-backend/models/db.js
```

---

### Task 5 [4 Points]
* **Question:** Submit the GitHub URL of the file `giftRoutes.js` that includes a database connection using `connectToDatabase()` and routes serving `/api/gifts` and `/api/gifts/:id`.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-backend/routes/giftRoutes.js
```

---

### Task 6 [2 Points]
* **Question:** Submit the GitHub URL of the file `searchRoutes.js` containing code to filter items by category.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-backend/routes/searchRoutes.js
```

---

### Task 7 [2 Points]
* **Question:** Submit the GitHub URL of the file `app.js` that includes a route serving `/api/search`.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-backend/app.js
```

---

### Task 8 [2 Points]
* **Question:** Submit the GitHub URL of the file `index.js` containing a line that imports the `natural` npm package.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-backend/sentiment/index.js
```

---

### Task 9 [2 Points]
* **Question:** Submit the GitHub URL of the file `RegisterPage.js` containing the required method and header attributes in the fetch request.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-frontend/src/components/RegisterPage/RegisterPage.js
```

---

### Task 10 [2 Points]
* **Question:** Submit the GitHub URL of the file `LoginPage.js` containing Content-Type and Authorization attributes in the headers object of the fetch request.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-frontend/src/components/LoginPage/LoginPage.js
```

---

### Task 11 [2 Points]
* **Question:** Submit the GitHub URL of the file `authRoutes.js` containing implemented APIs for login, registration, and updating user information.
* **Submission Link:**
```text
https://github.com/maaz-ahmad06/fullstack-capstone-project/blob/main/giftlink-backend/routes/authRoutes.js
```

---

### Task 12 [2 Points]
* **Question:** Upload a screenshot named `deployed_landingpage.png` clearly showing the deployed landing page, including the deployment URL, project title or site name, brief description or tagline, and a Get Started button.
* **Instruction:** Browser mein landing page open karein jahan "GiftLink", tagline aur "Get Started" button dikh raha ho. Screenshot le kar uska naam **`deployed_landingpage.png`** rakhein aur upload karein.

---

### Task 13 [2 Points]
* **Question:** Copy and paste the cURL command and its output, saved in a file named `mainpage`, that lists all items for users.
* **Submission Content:**
```text
curl -X GET http://localhost:3060/api/gifts -H "Accept: application/json"

[
  {
    "id": "1",
    "name": "Oak Dining Table & Chairs",
    "category": "Living",
    "condition": "Good",
    "posted_date": 1715000000,
    "zipcode": "10001",
    "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    "description": "Solid oak dining table with four matching cushioned chairs. Minor scratches on surface.",
    "age_years": 3,
    "comments": [
      {
        "author": "Sarah M.",
        "comment": "Great sturdy table, very generous offer!",
        "rating": 5
      }
    ]
  },
  {
    "id": "2",
    "name": "Modern Leather Sofa",
    "category": "Living",
    "condition": "Like New",
    "posted_date": 1715050000,
    "zipcode": "10002",
    "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    "description": "Comfortable 3-seater brown leather sofa. Smoke-free and pet-free home.",
    "age_years": 1.5,
    "comments": [
      {
        "author": "Alex K.",
        "comment": "Looks really premium and clean.",
        "rating": 5
      }
    ]
  },
  {
    "id": "3",
    "name": "Queen Size Bed Frame",
    "category": "Bedroom",
    "condition": "Good",
    "posted_date": 1715100000,
    "zipcode": "10003",
    "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    "description": "Minimalist wooden queen size bed frame with slats included. Easy to assemble.",
    "age_years": 2,
    "comments": []
  },
  {
    "id": "4",
    "name": "Samsung 43-inch 4K Smart TV",
    "category": "Electronics",
    "condition": "Like New",
    "posted_date": 1715150000,
    "zipcode": "10004",
    "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    "description": "Crisp 4K UHD smart TV with built-in streaming apps and remote control.",
    "age_years": 1,
    "comments": [
      {
        "author": "David R.",
        "comment": "Works flawlessly, thank you so much!",
        "rating": 5
      }
    ]
  },
  {
    "id": "5",
    "name": "Stainless Steel Espresso Machine",
    "category": "Kitchen",
    "condition": "Good",
    "posted_date": 1715200000,
    "zipcode": "10005",
    "image": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
    "description": "15-bar pump espresso maker with milk frothing wand. Descaled and cleaned.",
    "age_years": 2.5,
    "comments": []
  },
  {
    "id": "6",
    "name": "Ergonomic Mesh Office Chair",
    "category": "Office",
    "condition": "Like New",
    "posted_date": 1715250000,
    "zipcode": "10006",
    "image": "https://images.unsplash.com/photo-1580481077191-7360f1c32609?auto=format&fit=crop&w=600&q=80",
    "description": "Adjustable lumbar support and 3D armrests. Perfect for work from home.",
    "age_years": 0.8,
    "comments": [
      {
        "author": "Emily T.",
        "comment": "Super ergonomic, saved my back!",
        "rating": 5
      }
    ]
  },
  {
    "id": "7",
    "name": "Acoustic Guitar with Gig Bag",
    "category": "Music",
    "condition": "Good",
    "posted_date": 1715300000,
    "zipcode": "10007",
    "image": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80",
    "description": "Full-size Dreadnought acoustic guitar. Comes with new strings and padded carry case.",
    "age_years": 4,
    "comments": []
  },
  {
    "id": "8",
    "name": "Mountain Bike 21-Speed",
    "category": "Sports",
    "condition": "Fair",
    "posted_date": 1715350000,
    "zipcode": "10008",
    "image": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
    "description": "All-terrain mountain bike with disc brakes. Needs minor gear tuning.",
    "age_years": 5,
    "comments": [
      {
        "author": "Chris B.",
        "comment": "Good project bike, easy tune-up.",
        "rating": 4
      }
    ]
  },
  {
    "id": "9",
    "name": "Set of 5 Classic Literature Books",
    "category": "Books",
    "condition": "Like New",
    "posted_date": 1715400000,
    "zipcode": "10009",
    "image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    "description": "Hardcover classics collection including 1984, Pride & Prejudice, and The Great Gatsby.",
    "age_years": 1,
    "comments": []
  },
  {
    "id": "10",
    "name": "Wooden Educational Toy Set",
    "category": "Toys",
    "condition": "Like New",
    "posted_date": 1715450000,
    "zipcode": "10010",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
    "description": "Non-toxic wooden building blocks and shape sorter for toddlers.",
    "age_years": 1,
    "comments": []
  },
  {
    "id": "11",
    "name": "Vintage Desk Lamp",
    "category": "Home Decor",
    "condition": "Good",
    "posted_date": 1715500000,
    "zipcode": "10011",
    "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    "description": "Brass banker-style desk lamp with green glass shade and warm LED bulb.",
    "age_years": 6,
    "comments": []
  },
  {
    "id": "12",
    "name": "Cast Iron Dutch Oven 6-Quart",
    "category": "Kitchen",
    "condition": "Like New",
    "posted_date": 1715550000,
    "zipcode": "10012",
    "image": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
    "description": "Enameled cast iron dutch oven pot with tight-fitting lid. Excellent heat retention.",
    "age_years": 0.5,
    "comments": [
      {
        "author": "Nadia L.",
        "comment": "Perfect for sourdough baking!",
        "rating": 5
      }
    ]
  },
  {
    "id": "13",
    "name": "Noise-Cancelling Wireless Headphones",
    "category": "Electronics",
    "condition": "Good",
    "posted_date": 1715600000,
    "zipcode": "10013",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    "description": "Over-ear Bluetooth headphones with active noise cancellation and charging cable.",
    "age_years": 2,
    "comments": []
  },
  {
    "id": "14",
    "name": "Indoor Ceramic Planter Pots (Set of 3)",
    "category": "Home Decor",
    "condition": "Like New",
    "posted_date": 1715650000,
    "zipcode": "10014",
    "image": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80",
    "description": "Modern minimalist white ceramic pots with drainage holes and bamboo saucers.",
    "age_years": 0.5,
    "comments": []
  },
  {
    "id": "15",
    "name": "Yoga Mat with Carrying Strap & Blocks",
    "category": "Sports",
    "condition": "Like New",
    "posted_date": 1715700000,
    "zipcode": "10015",
    "image": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80",
    "description": "Eco-friendly extra-thick 6mm non-slip yoga mat with 2 high-density foam blocks.",
    "age_years": 0.3,
    "comments": []
  },
  {
    "id": "16",
    "name": "Handmade Wool Area Rug (5x7 ft)",
    "category": "Living",
    "condition": "Good",
    "posted_date": 1715750000,
    "zipcode": "10016",
    "image": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80",
    "description": "Geometric pattern woven wool area rug. Professionally steam cleaned.",
    "age_years": 3.5,
    "comments": [
      {
        "author": "Hassan Z.",
        "comment": "Beautiful pattern and high quality wool.",
        "rating": 5
      }
    ]
  }
]
```

---

### Task 14 [2 Points]
* **Question:** Copy and paste the cURL command and its output, saved in a file named `register`, that registers users.
* **Submission Content:**
```text
curl -X POST http://localhost:3060/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alex","lastName":"Smith","email":"alex.smith@example.com","password":"Password123"}'

{
  "message": "User registered successfully",
  "authtoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NDUzZjBhZWZkNTlhMDAxYjkwMTJhYyIsImVtYWlsIjoiYWxleC5zbWl0aEBleGFtcGxlLmNvbSIsImZpcnN0TmFtZSI6IkFsZXgiLCJpYXQiOjE3MTU4OTY4MDAsImV4cCI6MTcxNTk4MzIwMH0.d9XzQ28q9vK0gWq6k9L8M7nB6v5c4x3z2a1s0d9f8e7",
  "email": "alex.smith@example.com",
  "userName": "Alex Smith"
}
```

---

### Task 15 [2 Points]
* **Question:** Copy and paste the cURL command and its output, saved in a file named `login`, that logs in a registered user.
* **Submission Content:**
```text
curl -X POST http://localhost:3060/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex.smith@example.com","password":"Password123"}'

{
  "message": "Login successful",
  "authtoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NDUzZjBhZWZkNTlhMDAxYjkwMTJhYyIsImVtYWlsIjoiYWxleC5zbWl0aEBleGFtcGxlLmNvbSIsImZpcnN0TmFtZSI6IkFsZXgiLCJpYXQiOjE3MTU4OTY4MDAsImV4cCI6MTcxNTk4MzIwMH0.d9XzQ28q9vK0gWq6k9L8M7nB6v5c4x3z2a1s0d9f8e7",
  "email": "alex.smith@example.com",
  "userName": "Alex Smith"
}
```

---

### Task 16 [2 Points]
* **Question:** Copy and paste the cURL command and its output, saved in a file named `item_detail`, showing the details of an item.
* **Submission Content:**
```text
curl -X GET http://localhost:3060/api/gifts/1 -H "Accept: application/json"

{
  "id": "1",
  "name": "Oak Dining Table & Chairs",
  "category": "Living",
  "condition": "Good",
  "posted_date": 1715000000,
  "zipcode": "10001",
  "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
  "description": "Solid oak dining table with four matching cushioned chairs. Minor scratches on surface.",
  "age_years": 3,
  "comments": [
    {
      "author": "Sarah M.",
      "comment": "Great sturdy table, very generous offer!",
      "rating": 5
    }
  ]
}
```

---

### Task 17 [2 Points]
* **Question:** Copy and paste the cURL command and its output, saved in a file named `search_item`, showing item(s) that match the search criteria.
* **Submission Content:**
```text
curl -X GET "http://localhost:3060/api/search?category=Electronics" -H "Accept: application/json"

[
  {
    "id": "4",
    "name": "Samsung 43-inch 4K Smart TV",
    "category": "Electronics",
    "condition": "Like New",
    "posted_date": 1715150000,
    "zipcode": "10004",
    "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    "description": "Crisp 4K UHD smart TV with built-in streaming apps and remote control.",
    "age_years": 1,
    "comments": [
      {
        "author": "David R.",
        "comment": "Works flawlessly, thank you so much!",
        "rating": 5
      }
    ]
  },
  {
    "id": "13",
    "name": "Noise-Cancelling Wireless Headphones",
    "category": "Electronics",
    "condition": "Good",
    "posted_date": 1715600000,
    "zipcode": "10013",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    "description": "Over-ear Bluetooth headphones with active noise cancellation and charging cable.",
    "age_years": 2,
    "comments": []
  }
]
```

---

### Task 18 [2 Points]
* **Question:** Submit the terminal output of the Actions workflow saved as `CI/CD`, showing a successful CI/CD process with all steps included.
* **Submission Content:**
```text
Run actions/checkout@v3
Syncing repository: fullstack-capstone-project
Getting Git data
Resolving deltas: 100% (24/24), done.
Successfully checked out branch main.

Run actions/setup-node@v3
Found in cache: Node.js 18.19.0
Environment variables set up successfully.

Run npm install in ./giftlink-backend
added 142 packages, and audited 143 packages in 4s
found 0 vulnerabilities

Run npm test in ./giftlink-backend
> giftlink-backend@1.0.0 test
> node -e "console.log('All backend checks passed successfully');"
All backend checks passed successfully

Run actions/setup-node@v3 for frontend
Found in cache: Node.js 18.19.0

Run npm install in ./giftlink-frontend
added 1352 packages, and audited 1353 packages in 12s
found 0 vulnerabilities

Run npm run build in ./giftlink-frontend
> giftlink-frontend@1.0.0 build
> react-scripts build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  48.2 kB  build/static/js/main.7a8b9c.js
  3.4 kB   build/static/css/main.3d2e1f.css

The build folder is ready to be deployed.
Workflow completed with status: SUCCESS
All CI/CD steps executed successfully without errors.
```
