# Hohaya API

Backend API for Hohaya built with Node.js, Express, and TypeScript.

## Features

- **TypeScript** : Strongly typed codebase for better maintainability.
- **Mongoose** : MongoDB object modeling.
- **JWT Authentication** : Secure access to endpoints.
- **RESTful API** : Organized routing for Properties, Users, Visits, and Transactions.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- pnpm (recommended)

### Installation

```bash
sudo pnpm install
```

### Running the Project

**Development mode:**
```bash
pnpm run dev
```

**Build for production:**
```bash
pnpm run build
```

**Start production server:**
```bash
pnpm start
```

## Project Structure

- `index.ts` : Entry point of the application.
- `routes/` : Express routes.
- `controllers/` : Request handlers.
- `models/` : Mongoose models and interfaces.
- `middlewares/` : Authentication and role-based access control.
