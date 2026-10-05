# 📚 BookLoop – Book Sharing & Exchange Platform

BookLoop is a clean, simple, and responsive full-stack web application that allows users to register, log in, share books from their shelf, browse available books, search the community catalog, and request book exchanges with other members.

---

## 🌟 Key Features

1. **Home Page**:
   - Clean welcome hero with quick call-to-action buttons.
   - Live preview of recently added books.
   - Responsive modern navigation bar.

2. **Browse Books**:
   - Displays all books available in the community.
   - Search books instantly by title, author, or category.
   - Send book exchange requests with a single click.
   - Automatic badges for your own books vs. other members' books.

3. **My Books**:
   - Add new books to your collection (Title, Author, Category with suggestions).
   - View your shared books collection.
   - Delete your own books at any time with safety confirmation.

4. **My Requests**:
   - **Sent Requests**: Track books you have requested from other users with real-time status badges (`Pending`, `Accepted`, `Rejected`).
   - **Incoming Requests**: View exchange requests received from other members for your books, with one-click **Accept** and **Reject** actions.

5. **Authentication**:
   - User Registration (Name, Email, Password with bcrypt hashing).
   - User Login with JSON Web Token (JWT) session management.
   - Route protection: prevents unauthorized access, prevents requesting your own books, and prevents users from deleting books they do not own.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Modern Responsive CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Password hashing with `bcryptjs` and token-based authentication with `jsonwebtoken` (JWT)
- **Architecture**: RESTful APIs connecting frontend and backend

---

## 📁 Project Directory Structure

```text
bookloop/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic (Local, Atlas & fallback)
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile
│   │   ├── bookController.js     # Book creation, listing, searching, deletion
│   │   └── requestController.js  # Exchange requests, status updates (Accept/Reject)
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User Mongoose schema
│   │   ├── Book.js               # Book Mongoose schema
│   │   └── Request.js            # Request Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── bookRoutes.js         # /api/books routes
│   │   └── requestRoutes.js      # /api/requests routes
│   ├── .env                      # Environment variables configuration
│   ├── .env.example              # Sample environment configuration template
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express application entry point & static file server
├── frontend/
│   ├── css/
│   │   └── style.css             # Cohesive, modern & responsive styles
│   ├── js/
│   │   ├── api.js                # API client, JWT helpers, notifications
│   │   ├── navbar.js             # Shared responsive navbar component
│   │   ├── home.js               # Home page logic
│   │   ├── browse.js             # Book browsing and search logic
│   │   ├── my-books.js           # My books management logic
│   │   ├── my-requests.js        # Request tracking and accept/reject logic
│   │   └── auth.js               # Login and registration handlers
│   ├── index.html                # 1. Home Page
│   ├── browse.html               # 2. Browse Books Page
│   ├── my-books.html             # 3. My Books Page
│   ├── my-requests.html          # 4. My Requests Page
│   ├── login.html                # 5. Login Page
│   └── register.html             # 6. Register Page
└── README.md
```

---

## 🚀 Getting Started Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher installed)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local MongoDB service or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud URI)
  > *Note: BookLoop includes a zero-configuration in-memory MongoDB fallback out-of-the-box so you can start testing immediately even before setting up a local database!*

---

### Step 1: Install Dependencies

Open your terminal, navigate to the `backend/` directory, and install dependencies:

```bash
cd backend
npm install
```

---

### Step 2: Configure Environment Variables

The `backend/.env` file is pre-configured with default values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bookloop
JWT_SECRET=bookloop_jwt_secret_key_2026_secure
```

- If you are running **Local MongoDB**, ensure your MongoDB service is started.
- If you are using **MongoDB Atlas**, replace `MONGO_URI` with your connection string:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookloop?retryWrites=true&w=majority
  ```

---

### Step 3: Start the Backend Server

Inside the `backend/` directory, run:

```bash
npm start
```

Or for development with automatic reload on changes:

```bash
npm run dev
```

You will see:
```text
=======================================================
 BookLoop is running!
 Server URL : http://localhost:5000
 Frontend   : http://localhost:5000/index.html
 Mode       : development
=======================================================
[MongoDB] Connected successfully to: ...
```

---

### Step 4: Open BookLoop in Your Browser

Open your favorite browser and visit:
👉 **`http://localhost:5000`** (or `http://localhost:5000/index.html`)

You can now:
1. Register a new user at `register.html`.
2. Add your favorite books at `my-books.html`.
3. Search and browse books at `browse.html`.
4. Send and track exchange requests at `my-requests.html`.

---

## 📡 REST API Documentation

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Yes |

### 📖 Books (`/api/books`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | Get all books (supports `?search=<keyword>`) | No |
| `GET` | `/api/books/my-books`| Get books belonging to the logged-in user | Yes |
| `POST` | `/api/books` | Add a new book (`title`, `author`, `category`) | Yes |
| `DELETE` | `/api/books/:id` | Delete own book (ownership strictly verified) | Yes |

### 🤝 Exchange Requests (`/api/requests`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Request a book (`bookId`). Prevents self-request | Yes |
| `GET` | `/api/requests/my-requests` | Get requests made by the logged-in user | Yes |
| `GET` | `/api/requests/received` | Get incoming requests for books owned by user | Yes |
| `PUT` | `/api/requests/:id/status` | Update request status (`Accepted` or `Rejected`) | Yes |

---

## 🔒 Security & Validation Rules
- **Password Security**: Passwords are never stored in plain text; they are securely hashed using `bcryptjs` with salt rounds.
- **JWT Protection**: User actions are authenticated via `Bearer <token>` HTTP headers.
- **Ownership Verification**:
  - Users can only delete books they personally created. Attempts to delete other users' books return HTTP `403 Forbidden`.
  - Users cannot request their own books (returns HTTP `400 Bad Request`).
  - Duplicate pending requests for the same book by the same user are prevented.
