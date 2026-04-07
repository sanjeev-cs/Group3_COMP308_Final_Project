# Stellar Smash 🚀 

**Stellar Smash** is a high-fidelity 3D Hyper-Tunnel rail-shooter built with the MERN stack, GraphQL, and modern web graphics. You race down a cosmic procedural tunnel, defending against bizarre and dangerous entities!

## 🌟 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 18 (Vite), Zustand, React Router v6 |
| **3D Engine & Graphics** | Three.js via `@react-three/fiber` & `@react-three/drei` |
| **API** | GraphQL (Apollo Server 4 + Apollo Client) & Express.js |
| **Database** | MongoDB + Mongoose |
| **Real-time** | GraphQL Subscriptions (WebSockets via `graphql-ws`) for Live Leaderboards |
| **Authentication** | JWT (jsonwebtoken + bcryptjs) |

---

## 🛠️ Local Setup Instructions

**1. Prerequisites**
- Node.js 18+
- MongoDB (running locally on port 27017 or a Mongo Atlas URI)

**2. Backend Setup (`/server`)**
```bash
cd server
npm install
```
Create a `.env` file from the example:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/stellar-smash
JWT_SECRET=super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```
Seed the database with initial variables and run the development server:
```bash
npm run seed
npm run dev
```

**3. Frontend Setup (`/client`)**
```bash
cd client
npm install
npm run dev
```
*The React app will boot up in Vite on `http://localhost:5173`. Open it in your browser and start playing!*

---

## 🎮 Gameplay Mechanics & Features

**The Core Loop**: You are speeding down a dynamic, high-speed 3D tunnel. Various custom enemies and obstacles will hurdle toward your screen. Your goal is to aim precisely and click to destroy target threats to accrue points before time runs out, all while dodging the deadly mines.

### Mechanics & Interactivity
- 🎯 **Raycast Targeting**: The 3D engine uses precise hitbox centers to register your targeting. Click quickly and accurately.
- 💥 **Forcefields**: Your defense system. Taking damage from mines drops your forcefield strength.
- 🏆 **Dynamic Live Leaderboard**: After completing a level, your score automatically posts to the real-time GraphQL subscriptions leaderboard.

### Custom Levels & Enemies
The game escalates through 3 uniquely crafted difficulty levels, bringing out custom 3D models and increasingly dangerous bosses.

*Across all levels, **Avoid Space Mines**. Clicking a mine results in a **15 point penalty** and the **loss of 1 Forcefield**.*

#### **Level 1**
An introductory flight through standard cosmic debris. Perfect for getting your bearings and practicing aim.
- ☄️ **Meteor** (+10 Points)

#### **Level 2**
Things get spooky and bizarre as you encounter custom modeled spectral threats. Speed and complexity escalate.
- 👻 **Ghost Boy** (+20 Points)
- 👑 **King Boo** (+30 Points)

#### **Level 3**
The ultimate challenge. Incredible speeds and the highest value targets test your reflexes to their limit.
- 🪓 **Chuck** (+50 Points)
- ☠️ **The Boss** (+100 Points)

*Can you beat the boss and claim the number one spot on the live leaderboard? Good luck!*
