import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { io } from "socket.io-client";
import "./App.css";

// This is a free map topology file that draws the world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Connect to our Node.js Backend using WebSockets!
// In production, this uses the Vercel environment variable. Locally, it falls back to localhost.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";
const socket = io(BACKEND_URL);

function App() {
  const [attacks, setAttacks] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Track connection status
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // This is where the magic happens: Listening for the 'new_attack' event
    socket.on("new_attack", (data) => {
      console.log("New attack received!", data);
      
      // Add the new attack to the top of our list, keeping only the last 50 attacks to prevent memory issues
      setAttacks((prevAttacks) => [data, ...prevAttacks].slice(0, 50));
    });

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new_attack");
    };
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>🚨 Global Threat Intelligence Network</h1>
        <p>Real-time SSH Honeypot Dashboard | Status: {isConnected ? <span style={{color: '#4caf50'}}>🟢 Connected</span> : <span style={{color: '#f44336'}}>🔴 Disconnected</span>}</p>
      </header>

      <div className="main-content">
        {/* Left Side: The World Map */}
        <div className="map-container">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 130 }}
          >
            {/* Draw all the countries */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#2a2a2a"
                    stroke="#444"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#333", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Draw a flashing red dot for every attack we have intercepted */}
            {attacks.map((attack, index) => (
              <Marker key={index} coordinates={[attack.lon, attack.lat]}>
                {/* The solid center dot that points exactly to the location */}
                <circle r={3} fill="#FF5533" />
                {/* The pulsing radar ring around the dot */}
                <circle r={12} fill="none" stroke="#FF5533" strokeWidth="2" className="pulse-marker" />
              </Marker>
            ))}
          </ComposableMap>
        </div>

        {/* Right Side: The Live Feed of stolen passwords */}
        <div className="feed-container">
          <h2>Live Attack Feed</h2>
          <div className="attack-list">
            {attacks.length === 0 ? (
              <p className="waiting-msg">Waiting for hackers...</p>
            ) : (
              attacks.map((attack, i) => (
                <div key={i} className="attack-card">
                  <div className="attack-header">
                    <span className="ip">{attack.ip}</span>
                    <span className="location">📍 {attack.city}, {attack.country}</span>
                  </div>
                  <div className="attack-details">
                    <p><strong>User:</strong> {attack.username}</p>
                    <p><strong>Pass:</strong> <span className="password">{attack.passwordTried}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
