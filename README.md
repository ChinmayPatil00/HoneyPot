# 🌐 Global Threat Intelligence Honeypot

A real-time, interactive threat intelligence dashboard connected to a live honeypot backend. This project visualizes cyber attacks in real-time, tracking attacker IPs, mapping them globally, and logging their credential-stuffing attempts.

## ✨ Features
- **Live Geographic Tracking**: Instantly traces incoming attacks to their origin country and city, plotting them on an interactive D3/SVG world map.
- **Real-Time Attack Feed**: Utilizes WebSockets (Socket.IO) to push live attack data to the dashboard with zero latency.
- **Threat Profiling**: Automatically categorizes attacker behavior (e.g., "BRUTE FORCE", "LOW SKILL BOT") based on password payload analysis.
- **Interactive Simulation**: Built-in auto-simulation mode that generates realistic global attack traffic for testing and demonstration purposes.
- **Glassmorphism UI**: A premium, mobile-responsive dark-mode aesthetic featuring blurred glass panels and high-contrast alert states.
- **Attacker Portal**: A simulated terminal where you can "launch" an attack against the honeypot to see it appear live on the dashboard.

## 🛠️ Technology Stack
- **Frontend**: React.js (Vite), React Router, Socket.IO Client
- **Data Visualization**: Recharts (Analytics), React-Simple-Maps & D3-Geo (Global Map)
- **Styling**: Vanilla CSS with modern Glassmorphism, CSS Variables, and Flexbox/Grid
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB & Mongoose
- **Geolocation**: IP-API Integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Running locally on `127.0.0.1:27017` or via MongoDB Atlas URI)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

## 📱 Mobile Responsiveness
The dashboard is fully optimized for mobile devices, seamlessly stacking analytical cards, shrinking the map bounds, and lazy-loading heavy geographic SVGs to preserve device CPU and battery.

## 🔒 Security Posture
- **X-Forwarded-For Trusting**: The backend natively resolves attacker IPs via HTTP headers rather than trusting arbitrary client payloads, effectively preventing basic IP spoofing.
- **Input Validation**: Backend routes strictly sanitize payloads (username/password) to prevent memory bloating attacks against the database.
- **React Optimization**: Heavy global SVG layers are strictly memoized, and lists use composite keys to prevent aggressive React DOM re-renders during high-volume DDoS simulations.
