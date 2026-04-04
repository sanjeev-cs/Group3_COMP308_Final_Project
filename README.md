# Stellar Smash 🚀

A 3D space defense reaction game built with the MERN stack, GraphQL, and Three.js.

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18 (Vite), React Three Fiber, Zustand, React Router v6 |
| **3D Engine** | Three.js via `@react-three/fiber` + `@react-three/drei` |
| **API** | GraphQL — Apollo Server 4 + Express.js |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Database** | MongoDB + Mongoose |
| **Real-time** | GraphQL Subscriptions (graphql-ws) |

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Server

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/stellar-smash
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

### 2. Client

```bash
cd client
npm install
npm run dev
```

### 3. Play

Open `http://localhost:5173` in your browser.

## Game Overview

**Concept**: You're a space station commander. Asteroids, alien drones, and cosmic debris fly toward you in 3D space — click to destroy/collect them.

**Object Types**:
- 🪨 **Asteroid** (brown) — +10 points
- 👾 **Drone** (red) — +20 points
- 💠 **Energy Orb** (cyan) — +15 points
- ✨ **Stardust** (gold) — +25 points + bonus time
- 💣 **Mine** (pulsing red) — DON'T click! -15 pts + lose a life

**Missions**:
1. Asteroid Belt (Easy) — 60s, slow
2. Drone Swarm (Medium) — 50s, medium speed
3. Meteor Storm (Hard) — 45s, fast

## Features

- JWT authentication (register/login)
- 3D game rendered with Three.js (React Three Fiber)
- GraphQL API with Apollo Server 4
- Real-time leaderboard via GraphQL subscriptions
- XP & leveling system (10 levels)
- 6 unlockable achievements
- 3 purchasable power-ups (Stardust currency)
- Daily & weekly challenges
- Responsive design

## Project Structure

```
├── server/           # Express + Apollo Server + MongoDB
│   └── src/
│       ├── config/   # Database connection
│       ├── models/   # Mongoose models (5)
│       ├── graphql/  # TypeDefs + Resolvers
│       ├── middleware/ # JWT auth
│       ├── utils/    # Game logic, JWT helpers
│       └── seed/     # Database seeder
│
├── client/           # React Vite + Three.js
│   └── src/
│       ├── config/   # Apollo Client
│       ├── graphql/  # Queries, Mutations, Subscriptions
│       ├── store/    # Zustand game state
│       ├── contexts/ # Auth context
│       ├── components/ # UI + Game components
│       └── pages/    # 7 pages
```

## Group 3 — COMP308 Final Project
