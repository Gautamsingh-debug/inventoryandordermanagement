# Inventory & Order Management System

A full-stack, production-ready Inventory and Order Management System. Built with a modern, decoupled architecture, it features a transactional inventory engine that guarantees stock integrity under high concurrency, along with a beautiful, responsive React frontend.

## 🚀 Tech Stack

**Backend**
* **Python 3.12**
* **FastAPI:** High-performance, async framework.
* **SQLAlchemy (Async):** Modern ORM interacting with PostgreSQL.
* **Alembic:** Database migrations.
* **Pydantic:** Strict data validation.

**Frontend**
* **React 18:** Scaffolded with Vite for lightning-fast HMR and builds.
* **Vanilla CSS:** Custom design system with modern glassmorphism, micro-animations, and a highly polished UI.
* **Axios:** API client configuration.
* **Lucide React:** Beautiful iconography.

**Infrastructure**
* **PostgreSQL 16:** Relational database with strict `CHECK` constraints to ensure data integrity at the lowest level.
* **Docker & Docker Compose:** Containerized environments for both development and production. Nginx is used to serve the compiled frontend.

## 📦 Key Features

* **Inventory Engine:** Orders use **Row-Level Pessimistic Locking** (`SELECT ... FOR UPDATE`) in database transactions. This guarantees that stock quantities are never driven negative, even during simultaneous concurrent purchases.
* **Strict Constraints:** Unique constraints on SKUs and Customer Emails. Database-level `CHECK` constraints prevent negative pricing or stock quantities independent of application logic.
* **Responsive Dashboard:** Real-time visibility into total products, customers, orders, and low-stock warnings.
* **Soft Deletion:** Products are soft-deleted (`is_active=False`) to preserve historical order data, while orders can be fully canceled (automatically refunding inventory stock).

---

## 🛠️ Local Development

### Prerequisites
* Docker Desktop (with WSL2 enabled if on Windows)
* Git

### Quick Start
The easiest way to run the entire stack locally is using Docker Compose.

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd "inventory and order management"
   ```

2. **Start the containers:**
   ```bash
   docker compose up -d --build
   ```

3. **Run Database Migrations:**
   Wait about 10 seconds for the database to fully initialize, then run:
   ```bash
   docker compose exec backend alembic upgrade head
   ```

4. **Access the Application:**
   * **Frontend Application:** [http://localhost:5173](http://localhost:5173)
   * **Backend API Docs (Swagger):** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## ☁️ Deployment Guide

This application is designed to be easily deployed to free hosting platforms. The recommended setup is **Railway** for the Backend and Database, and **Vercel** for the Frontend.

### 1. Database & Backend (Railway)

1. **Push your code to GitHub.**
2. Go to [Railway.app](https://railway.app/) and click **New Project** -> **Provision PostgreSQL**.
3. In the same project, click **New** -> **GitHub Repo** and select your repository.
4. **Configure the Backend Service:**
   * Go to the Settings for your new GitHub service on Railway.
   * Change the **Root Directory** to `/backend`. Railway will automatically find the Dockerfile there and build it.
5. **Set Environment Variables:**
   * Go to the Variables tab of your Backend service and add:
     * `DATABASE_URL`: Set this to the connection string of the PostgreSQL database Railway just provisioned for you.
     * `CORS_ORIGINS`: Set this to `*` for now, or the URL Vercel gives you in the next step.

### 2. Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. **Configure the Build:**
   * Edit the **Root Directory** and set it to `frontend`.
   * Vercel will automatically detect that you are using Vite.
4. **Set Environment Variables:**
   * Add a new environment variable named `VITE_API_URL`.
   * Set its value to the public URL that Railway generated for your backend (e.g., `https://your-backend.up.railway.app`).
5. Click **Deploy**. Vercel will build your static assets and serve them globally!

---

## 🏗️ Project Structure

```text
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── routers/          # FastAPI REST endpoints
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── services/         # Business logic (Inventory Engine)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios HTTP client configuration
│   │   ├── components/       # Reusable React components (Modals, Tables)
│   │   ├── hooks/            # Custom React hooks for state management
│   │   └── pages/            # Main application views (Dashboard, Products)
│   ├── Dockerfile
│   └── vite.config.js
└── docker-compose.yml        # Orchestrates the DB, Backend, and Frontend
```
