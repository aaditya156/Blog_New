# 🚀 PulseBlog: Enterprise Microservice-Based Blogging Platform

A production-grade, distributed Full-Stack Blogging Platform engineered with an independent Next.js App Router frontend and decoupled Node.js / Express backend microservices connected to MongoDB and asynchronously synchronized via RabbitMQ AMQP messaging.

---

## 🏛️ System Architecture

```
                                  +-------------------+
                                  |  Next.js Frontend |
                                  |    (Port 3000)    |
                                  +---------+---------+
                                            |
                    +-----------------------+-----------------------+
                    |                       |                       |
                    v                       v                       v
          +-------------------+   +-------------------+   +-------------------+
          |   User Service    |   |  Author Service   |   |   Blog Service    |
          |    (Port 4001)    |   |    (Port 4002)    |   |    (Port 4003)    |
          +---------+---------+   +---------+---------+   +---------+---------+
                    |                       |                       ^
                    v                       v                       |
             [blog_user_db]           [blog_author_db]        [blog_read_db]
                                            |                       |
                                            | (Publishes Events)    | (Consumes Events)
                                            v                       |
                                     +--------------+               |
                                     |   RabbitMQ   +---------------+
                                     | Message Bus  |
                                     | (Port 5672)  |
                                     +--------------+
```

### Microservices Breakdown

| Service | Port | Database | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Frontend** | `3000` | N/A | Next.js 14 App Router, dynamic UI, responsive feeds, reader view, author publishing studio. |
| **User Service** | `4001` | `blog_user_db` | User registration, JWT authentication, Google OAuth verification, profile management. |
| **Author Service** | `4002` | `blog_author_db` | Blog creation, editing, deletion, and asynchronous publishing of AMQP events to RabbitMQ. |
| **Blog Service** | `4003` | `blog_read_db` | Read replica & aggregation engine, full-text search, view counter, like toggles, RabbitMQ event consumer. |
| **RabbitMQ** | `5672` / `15672` | N/A | AMQP Message Broker handling topic exchanges (`blog_exchange`) and worker queues (`blog_sync_queue`). |
| **MongoDB** | `27017` | Multi-DB | Isolated databases per microservice following database-per-service pattern. |

---

## 📁 Repository Structure

```
.
├── docker-compose.yml             # Orchestrates MongoDB, RabbitMQ, and microservices
├── package.json                   # Root monorepo workspace configuration
├── README.md                      # Architecture and setup guide
├── frontend/                      # Next.js App Router Client
│   ├── src/
│   │   ├── app/                   # Pages: /, /blogs, /blog/[id], /blog/new, /login, /profile/[id]
│   │   ├── components/            # Reusable UI components & BlogCard
│   │   ├── context/               # Global AppContext (auth, state, service URLs)
│   │   └── lib/                   # Utility helpers
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── services/                      # Backend Microservices
    ├── user/                      # User Service (Auth & Profiles)
    │   ├── src/
    │   │   ├── controllers/       # Registration, Login, Google OAuth, Profile
    │   │   ├── middleware/        # isAuth, Multer
    │   │   ├── model/             # Mongoose User Schema
    │   │   ├── routes/            # /api/v1/user routes
    │   │   ├── utils/             # db.ts, TryCatch.ts, GoogleConfig.ts, dataUri.ts
    │   │   └── server.ts          # Express server entry point
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── Dockerfile
    ├── author/                    # Author Service (Content Creation & Event Publishing)
    │   ├── src/
    │   │   ├── controllers/       # Blog CRUD for authors
    │   │   ├── middlewares/       # isAuth, Multer
    │   │   ├── model/             # AuthorBlog Schema
    │   │   ├── routes/            # /api/v1/author routes
    │   │   ├── utils/             # db.ts, TryCatch.ts, rabbitmq.ts (Publisher)
    │   │   └── server.ts          # Express server entry point
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── Dockerfile
    └── blog/                      # Blog Service (Read/Aggregation & Event Consumer)
        ├── src/
        │   ├── controllers/       # Public blogs, feeds, details, likes
        │   ├── middleware/        # isAuth (Optional/Required check)
        │   ├── model/             # Read-optimized Blog Schema
        │   ├── routes/            # /api/v1/blog routes
        │   ├── utils/             # db.ts, TryCatch.ts, consumer.ts (RabbitMQ Listener)
        │   └── server.ts          # Express server entry point & AMQP worker
        ├── package.json
        ├── tsconfig.json
        └── Dockerfile
```

---

## ⚡ Getting Started

### Option 1: Run Entire System with Docker Compose (Recommended)

Make sure you have Docker installed and running:

```bash
# Start MongoDB, RabbitMQ, all 3 microservices, and Frontend
docker-compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **User Service**: [http://localhost:4001/health](http://localhost:4001/health)
- **Author Service**: [http://localhost:4002/health](http://localhost:4002/health)
- **Blog Service**: [http://localhost:4003/health](http://localhost:4003/health)
- **RabbitMQ Management Dashboard**: [http://localhost:15672](http://localhost:15672) (User: `guest` / Pass: `guest`)

---

### Option 2: Run Locally in Monorepo Mode

#### 1. Start Infrastructure
Run local instances of MongoDB on port `27017` and RabbitMQ on port `5672`.

#### 2. Install Dependencies
```bash
# User Service
cd services/user && npm install

# Author Service
cd ../author && npm install

# Blog Service
cd ../blog && npm install

# Frontend
cd ../../frontend && npm install
```

#### 3. Start Development Servers
```bash
# User Service (Port 4001)
npm run dev --prefix services/user

# Author Service (Port 4002)
npm run dev --prefix services/author

# Blog Service (Port 4003)
npm run dev --prefix services/blog

# Frontend (Port 3000)
npm run dev --prefix frontend
```

---

## 🔄 Asynchronous Event-Driven Synchronization

When an author creates, edits, or deletes an article:
1. The **Author Microservice** (`services/author`) persists the change directly into its local database (`blog_author_db`).
2. It publishes an event (`BLOG_CREATED`, `BLOG_UPDATED`, `BLOG_DELETED`) to RabbitMQ topic exchange `blog_exchange` with routing key `blog.event`.
3. The **Blog Microservice** (`services/blog`) background worker consumes the event from queue `blog_sync_queue` and updates its read-optimized MongoDB instance (`blog_read_db`).
4. Read queries from the **Next.js Frontend** hit the Blog Service without placing any database read-lock or overhead on the Author or User services.
