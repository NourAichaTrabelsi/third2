# Technical Intervention Manager

A web application for companies to manage technical interventions: admins create and assign interventions; technicians view and update their status through the lifecycle **To Do → In Progress → Done**.

## Features

- **Admin**: Create interventions, assign them to technicians, and view all interventions.
- **Technicians**: See only their assigned interventions and update status (To Do → In Progress → Done).
- **Lifecycle**: Each intervention has status `todo` → `in_progress` → `done`.

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Frontend**: React 18, Vite, React Router

## Setup

1. **Install dependencies**

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Start the API server** (from project root)

   ```bash
   cd server && npm run dev
   ```

   Server runs at `http://localhost:3001`.

3. **Start the frontend** (in another terminal)

   ```bash
   cd client && npm run dev
   ```

   App runs at `http://localhost:5173` and proxies `/api` to the backend.

## Usage

1. Open `http://localhost:5173`.
2. On the login screen, select a user:
   - **Admin User** – create interventions and assign them to technicians.
   - **Tech One** / **Tech Two** – view assigned interventions and update status.
3. As admin: use “New intervention” to create, then assign via the dropdown in the table.
4. As technician: use the status buttons on each card to move an intervention along **To Do → In Progress → Done**.

## API (examples)

- `GET /api/users` – list users
- `GET /api/users/technicians` – list technicians
- `GET /api/interventions` – all interventions (admin)
- `GET /api/interventions?technicianId=<id>` – interventions for one technician
- `POST /api/interventions` – create (body: `title`, `description?`, `assigned_technician_id?`)
- `PATCH /api/interventions/:id` – update (body: `status?`, `assigned_technician_id?`)

Status values: `todo`, `in_progress`, `done`.
