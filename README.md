# Talvio Platform

A modern, full-stack platform for job matching and professional networking, built with Next.js (frontend) and Node.js/Express/Prisma (backend).

---

## 🚀 Features
- User authentication & role-based access (Admin, Employer, Professional, Undergraduate)
- Job posting and candidate management
- Interview scheduling
- Admin dashboards and approval workflows
- Responsive landing and user pages
- Modular, scalable codebase

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL (via Prisma)
- **Authentication:** Passport.js, JWT
- **Other:** ESLint, Prettier, REST API

---

## 📁 Folder Structure

```
frontend/
  app/
  components/
  constant/
  context/
  lib/
  public/
  types/
backend/
  prisma/
  src/
    config/
    middlewares/
    modules/
    types/
    utils/
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database

### 1. Clone the repository
```bash
git clone https://github.com/your-org/talvio.git
cd talvio
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Set up environment variables
- Copy `.env.example` to `.env` in both `backend/` and `frontend/` folders and fill in the required values.

### 4. Database setup (backend)
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run the applications
- **Backend:**
  ```bash
  cd backend
  npm run dev
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```

---

## ⚙️ Environment Variables
- See `.env.example` in both `backend/` and `frontend/` for required variables (DB connection, JWT secrets, etc.)

---

## 📜 Scripts
- **Backend:**
  - `npm run dev` — Start backend in development mode
  - `npm run build` — Build backend
  - `npm run start` — Start backend in production
  - `npx prisma migrate dev` — Run database migrations
  - `npx prisma db seed` — Seed the database
- **Frontend:**
  - `npm run dev` — Start frontend in development mode
  - `npm run build` — Build frontend
  - `npm run start` — Start frontend in production

---

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License.

---

## 📬 Contact
For questions, suggestions, or support, please contact the maintainers at [asankasampath200228@gmail.com].
