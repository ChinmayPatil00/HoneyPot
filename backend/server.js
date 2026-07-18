const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Allow frontend to connect via WebSockets and HTTP requests
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Uses env variable in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB (Local fallback if env variable is not set)
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/honeypot';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- DATABASE SETUP ---
// We define a Schema (blueprint) for how an Attack should be saved in MongoDB
const attackSchema = new mongoose.Schema({
  ip: String,
  username: String,
  passwordTried: String,
  country: String,
  city: String,
  lat: Number,
  lon: Number,
  timestamp: { type: Date, default: Date.now }
});

const Attack = mongoose.model('Attack', attackSchema);

// --- API ENDPOINTS ---

// 1. Fetch historical attacks when the dashboard loads
app.get('/api/attacks', async (req, res) => {
  try {
    // Get the 50 most recent attacks, sorted by newest first
    const attacks = await Attack.find().sort({ timestamp: -1 }).limit(50);
    res.status(200).json(attacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch past attacks" });
  }
});

// 2. The Python Honeypot will send a POST request here when it catches a hacker
app.post('/api/attack', async (req, res) => {
  try {
    const { ip, username, passwordTried } = req.body;
    console.log(`[ALERT] New attack detected from IP: ${ip} | User: ${username} | Pass: ${passwordTried}`);

    // Step 1: Find the geographical location of the Hacker's IP
    let lat = 0, lon = 0, country = 'Unknown', city = 'Unknown';
    try {
      // Note: In local testing, IP will be 127.0.0.1 which has no location.
      // We will only call the API if it's not a local IP.
      if (ip !== '127.0.0.1') {
        const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
        if (geoResponse.data.status === 'success') {
          lat = geoResponse.data.lat;
          lon = geoResponse.data.lon;
          country = geoResponse.data.country;
          city = geoResponse.data.city;
        }
      } else {
        // Mock data for local testing
        lat = 19.0760; // Mumbai Lat
        lon = 72.8777; // Mumbai Lon
        country = 'India';
        city = 'Mumbai (Local Test)';
      }
    } catch (geoError) {
      console.error("Geolocation API error:", geoError.message);
    }

    // Step 2: Create the attack record
    const newAttack = new Attack({
      ip, username, passwordTried, country, city, lat, lon
    });

    // Step 3: Send the attack instantly to the React Frontend Dashboard (Doing this FIRST so UI always works)
    io.emit('new_attack', newAttack);

    // Step 4: Try to save to MongoDB (Won't crash the API if MongoDB isn't running)
    try {
      await newAttack.save();
    } catch (dbError) {
      console.error("[-] MongoDB Save Error (Is MongoDB running?):", dbError.message);
    }

    res.status(200).json({ success: true, message: "Attack logged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('Frontend Dashboard connected!');
  
  socket.on('disconnect', () => {
    console.log('Frontend Dashboard disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
