# Stellar Smash

Stellar Smash is a high-fidelity 3D space rail-shooter game built using modern web technologies. Players navigate through a dynamic, hyper-tunnel space environment, battling enemies like Ghost Boy, King Boo, and Chuck amidst nebulae and procedural planets.

## Tech Stack

**Frontend:**
- **React**
- **Three.js** & **React Three Fiber** (`@react-three/fiber`) for 3D rendering
- **React Three Drei** for 3D abstractions and helpers
- **Postprocessing** (`@react-three/postprocessing`) for high-fidelity visual effects like Bloom
- **Zustand** for lightweight state management
- **GraphQL** & **Apollo Client** for data fetching
- **React Router DOM** for routing

**Backend:**
- **Node.js** & **Express.js**
- **Apollo Server** & **GraphQL** (with real-time Subscription support via `graphql-ws`)
- **MongoDB** & **Mongoose** for data persistence
- **JWT** (`jsonwebtoken`) & **bcryptjs** for secure authentication

## Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (local instance or a cloud MongoDB Atlas cluster)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure the environment variables:
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. (Optional) Run the seed script to populate the database with initial data:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory if you need to override the default API endpoint:
   ```env
   VITE_GRAPHQL_URI=http://localhost:4000/graphql
   VITE_WS_URI=ws://localhost:4000/graphql
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the local URL provided by Vite (e.g., `http://localhost:5173`).

## How to Play

1. **Launch & Select:** Launch the game and navigate to the mission selection page to choose your game mode and difficulty.
2. **Movement:** Use **W/A/S/D** or the **Arrow Keys** to steer your spacecraft, dodging asteroids and adjusting your position in the 3D hyper-tunnel environment. 
3. **Combat:** Use your **Mouse** to aim and **Left Click** or **Spacebar** to shoot down enemies (like Ghost Boy, King Boo, and Chuck) to rack up a high score.
4. **Survive:** Avoid collision with geometry and enemies. The game progressively scales in difficulty by optimizing object spawn rates and increasing density.
