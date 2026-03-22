# 🍌 Banana Showdown

Banana Showdown is a full-stack web-based game featuring thrilling battles, character selection, energy management, and challenging puzzles! The application uses a React (Vite) frontend with an Express.js backend hosted securely on Vercel.

## 🚀 Features
- **User Authentication:** Secure Login and Registration system.
- **Character Selection:** Choose between unique characters (like Shadow Demon and Heart Enchantress) to take into battle.
- **Dynamic Battles:** Engage in fierce turn-based or real-time showdowns against Boss opponents.
- **Energy System:** Strategic energy management to limit and balance gameplay sessions.
- **Banana Puzzles:** Test your wits and earn rewards in the interactive puzzle mini-game.
- **Leaderboards:** Compete against other players for the top spot.
- **Stateless Database:** Integrated with JSONBin.io for persistent database storage on serverless architectures (Vercel).

## 🛠 Tech Stack
- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** JSONBin.io (using fallback local JSON for local dev)
- **Deployment:** Vercel (using Serverless Functions mapped via `/api`)

## 📂 Project Structure
```text
banana-showdown/
├── api/             # Vercel entry point for Serverless Functions
├── client/          # React (Vite) Frontend Application
│   ├── public/      # Static assets (images, videos)
│   ├── src/         # Frontend React source code
│   │   ├── pages/   # GamePage, CharacterSelectPage, Leaderboard, etc.
│   │   ├── utils/   # API utility, Video prefetchers
│   │   └── context/ # Global states like EnergyContext
│   └── package.json 
├── server/          # Express.js Backend Application
│   ├── routes/      # API routes (Auth, Game, Leaderboard, Puzzle)
│   ├── models/      # Database logic (JSONBin integration)
│   └── index.js     # Express server setup
├── vercel.json      # Vercel configuration file
└── package.json     # Root level scripts and dependencies
```

## 💻 Running Locally

To run the application locally on your machine, you need to set up both the frontend and the backend.

### 1. Backend Setup
1. Open a terminal and navigate to the root directory (or `server` depending on setup).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root or `server` directory and configure your environment variables (e.g., `PORT`, `JSONBIN_URL`, `JSONBIN_KEY`, JWT secrets).
4. Start the backend server:
   ```bash
   node server/index.js
   ```
   *The server will run on http://localhost:5000 (or your configured port).*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on the port provided by Vite (e.g., http://localhost:5173).*

## 🌐 Deployment
The app is configured to be deployed on **Vercel**. 
The `vercel.json` file handles routing API requests to the `/api/index.js` serverless function and redirects other traffic to the static React frontend build.

## 🤝 Contributing
Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.
