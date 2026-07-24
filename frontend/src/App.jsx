import React, { useState, useEffect, useMemo, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { io } from "socket.io-client";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ShieldAlert, Activity, Globe, MapPin, X, ShieldCheck, Terminal, Ban, Smartphone } from "lucide-react";
import QRCode from "react-qr-code";
import "./App.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

// Colors for Pie Chart
const COLORS = ['#FF4444', '#FF8800', '#FFCC00', '#00C851', '#33B5E5'];

// --- ATTACKER PORTAL COMPONENT ---
// This is what the audience sees on their phone when they scan the QR code!
function AttackerPortal() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("ready");

  const launchAttack = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setStatus("attacking");

    // We pick a random global IP for the audience member so they appear on the world map!
    const global_ips = [
      "46.17.40.1", "176.12.34.12", "114.114.114.114", "177.20.10.1", 
      "192.200.1.1", "144.76.10.1", "212.58.244.20", "133.1.2.3"
    ];
    
    const payload = {
      ip: global_ips[Math.floor(Math.random() * global_ips.length)],
      username: username,
      passwordTried: password
    };

    try {
      await fetch(`${BACKEND_URL}/api/attack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setStatus("success");
      setTimeout(() => setStatus("ready"), 3000);
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("ready"), 3000);
    }
  };

  return (
    <div className="attacker-portal">
      <div className="hacker-box">
        <ShieldAlert size={48} color="#FF4444" />
        <h1>Target Acquired</h1>
        <p>You are about to launch a cyberattack against the Honeypot.</p>
        
        <form onSubmit={launchAttack} className="hacker-form">
          <input 
            type="text" 
            placeholder="Username (e.g. root)" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            disabled={status !== 'ready'}
          />
          <input 
            type="text" 
            placeholder="Password (e.g. hacker123)" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            disabled={status !== 'ready'}
          />
          <button type="submit" disabled={status !== 'ready'} className={status}>
            {status === 'ready' && "LAUNCH ATTACK"}
            {status === 'attacking' && "INJECTING PAYLOAD..."}
            {status === 'success' && "ATTACK LOGGED ON MAP!"}
            {status === 'error' && "CONNECTION FAILED"}
          </button>
        </form>
        <p className="hint">Look at the projector screen to see your attack hit!</p>
      </div>
    </div>
  );
}


// --- MAIN DASHBOARD COMPONENT ---
function Dashboard() {
  const [attacks, setAttacks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // New State for Blocked IPs
  const [blacklistedIPs, setBlacklistedIPs] = useState([]);
  const [isAllAttacksModalOpen, setIsAllAttacksModalOpen] = useState(false);
  
  // Terminal logs state
  const [logs, setLogs] = useState([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND_URL);
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    socket.on("new_attack", (data) => {
      setAttacks((prev) => [data, ...prev].slice(0, 100));
      
      // Add raw log to the terminal
      const rawLog = `[${new Date().toLocaleTimeString()}] INBOUND TCP 22 SYN_RCVD src=${data.ip} user=${data.username} pass=${data.passwordTried} | REJECTED`;
      setLogs(prev => [...prev, rawLog].slice(-20));
    });

    fetch(`${BACKEND_URL}/api/attacks`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAttacks(data);
      })
      .catch(err => console.error(err));

    return () => socket.disconnect();
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Compute DEFCON Level (DEFCON 1 if attack in last 10 seconds)
  const defconLevel = useMemo(() => {
    if (attacks.length === 0) return 5;
    const timeSinceLastAttack = Date.now() - new Date(attacks[0].timestamp).getTime();
    if (timeSinceLastAttack < 10000) return 1;
    if (timeSinceLastAttack < 30000) return 3;
    return 5;
  }, [attacks]);

  // Compute Analytics
  const topPasswords = useMemo(() => {
    const counts = {};
    attacks.forEach(a => counts[a.passwordTried] = (counts[a.passwordTried] || 0) + 1);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [attacks]);

  const topCountries = useMemo(() => {
    const counts = {};
    attacks.forEach(a => {
      const country = a.country || "Unknown";
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [attacks]);

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    const global_ips = ["46.17.40.1", "114.114.114.114", "177.20.10.1", "192.200.1.1", "144.76.10.1"];
    const payload = {
      ip: global_ips[Math.floor(Math.random() * global_ips.length)],
      username: "admin",
      passwordTried: "123456"
    };
    try {
      await fetch(`${BACKEND_URL}/api/attack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) { }
    setTimeout(() => setIsSimulating(false), 800);
  };

  const blockIP = (ip) => {
    if (!blacklistedIPs.includes(ip)) {
      setBlacklistedIPs([...blacklistedIPs, ip]);
      setLogs(prev => [...prev, `[SYSTEM] FIREWALL RULE ADDED: DROP src=${ip}`].slice(-20));
    }
    setSelectedThreat(null);
  };

  const audienceLink = window.location.origin + '/attack';

  return (
    <div className={`dashboard-container defcon-${defconLevel}`}>
      <header className="header glass-panel">
        <div className="header-title">
          <ShieldCheck size={32} color="#00C851" />
          <h1>Global Threat Intelligence Network</h1>
        </div>
        
        {/* DEFCON Indicator */}
        <div className={`defcon-badge level-${defconLevel}`}>
          DEFCON {defconLevel}
        </div>

        <div className="header-actions">
          <div className="status-badge">
             {isConnected ? <span className="connected">🟢 Live</span> : <span className="disconnected">🔴 Offline</span>}
          </div>
          <button 
            className={`simulate-btn ${isSimulating ? 'simulating' : ''}`} 
            onClick={handleSimulateAttack}
            disabled={isSimulating}
          >
            <ShieldAlert size={18} />
            {isSimulating ? 'Launching...' : 'Simulate Cyberattack'}
          </button>
        </div>
      </header>

      {/* Analytics Row */}
      <div className="analytics-row">
        {/* Audience QR Code Panel */}
        <div className="qr-card glass-panel">
          <div className="qr-header">
            <Smartphone size={18} color="#00C851"/>
            <h3>Audience Attack Portal</h3>
          </div>
          <div className="qr-body">
            <div className="qr-wrapper">
              <QRCode value={audienceLink} size={100} bgColor="transparent" fgColor="#fff" />
            </div>
            <div className="qr-text">
              <p>Scan to attack the server!</p>
              <a href="/attack" target="_blank" rel="noreferrer">Open Portal</a>
            </div>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3><Activity size={18} /> Top 5 Passwords</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPasswords} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: '8px'}} />
                <Bar dataKey="count" fill="#FF4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3><Globe size={18} /> Top Countries</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topCountries} cx="50%" cy="50%" innerRadius={45} outerRadius={75} cornerRadius={8} paddingAngle={4} dataKey="value" stroke="none">
                  {topCountries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="stats-card glass-panel">
           <div className="stat-box">
             <h4>Total Intercepts</h4>
             <span className="stat-value">{attacks.length}</span>
           </div>
           <div className="stat-box">
             <h4>Blocked IPs</h4>
             <span className="stat-value" style={{color: '#888'}}>{blacklistedIPs.length}</span>
           </div>
        </div>
      </div>

      <div className="main-content">
        <div className="map-container glass-panel">
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 130 }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e1e28"
                    stroke="#2a2a35"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#3a3a45", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {attacks.map((attack, index) => {
              const isBlocked = blacklistedIPs.includes(attack.ip);
              return (
                <Marker key={index} coordinates={[attack.lon, attack.lat]}>
                  {/* Grey dot if blocked, Red dot if active */}
                  <circle r={5} fill={isBlocked ? "#666666" : "#FF4444"} className={isBlocked ? "" : "blink-marker"} />
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        <div className="feed-panel">
          <div className="feed-container glass-panel">
            <h2><Activity size={18} /> Live Attack Feed</h2>
            <div className="attack-list">
              {attacks.length === 0 ? (
                <p className="waiting-msg">System Active. Waiting for attacks...</p>
              ) : (
                attacks.map((attack, i) => {
                  const isBlocked = blacklistedIPs.includes(attack.ip);
                  return (
                    <div key={i} className={`attack-card ${isBlocked ? 'blocked-card' : ''}`} onClick={() => setSelectedThreat(attack)}>
                      <div className="attack-header">
                        <span className="ip">{attack.ip} {isBlocked && <span className="blocked-tag">[BLOCKED]</span>}</span>
                        <span className="time">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="attack-details">
                        <p><span>User:</span> {attack.username}</p>
                        <p><span>Pass:</span> <span className="password">{attack.passwordTried}</span></p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Raw Terminal Logs */}
          <div className="terminal-container glass-panel">
            <div className="terminal-header"><Terminal size={14}/> Raw Socket Intercepts</div>
            <div className="terminal-body" ref={terminalRef}>
               {logs.length === 0 ? "Listening on 0.0.0.0:2222..." : logs.map((log, i) => (
                 <div key={i} className="log-line">{log}</div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Threat Modal */}
      {selectedThreat && (
        <div className="modal-overlay" onClick={() => setSelectedThreat(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedThreat(null)}><X size={20} /></button>
            <div className="modal-header">
              {blacklistedIPs.includes(selectedThreat.ip) ? (
                <Ban size={32} color="#888" />
              ) : (
                <ShieldAlert size={32} color="#FF4444" />
              )}
              <h2>{blacklistedIPs.includes(selectedThreat.ip) ? "Threat Neutralized" : "Threat Analysis Report"}</h2>
            </div>
            <div className="modal-body">
              <div className="info-row"><MapPin size={16}/> <strong>Origin:</strong> {selectedThreat.city}, {selectedThreat.country}</div>
              <div className="info-row"><Globe size={16}/> <strong>IP Address:</strong> <span className="ip-highlight">{selectedThreat.ip}</span></div>
              
              <div className="threat-box">
                <h4>Attack Vector</h4>
                <p><strong>Method:</strong> SSH Brute Force</p>
                <p><strong>Username:</strong> {selectedThreat.username}</p>
                <p><strong>Password:</strong> {selectedThreat.passwordTried}</p>
              </div>
              
              {!blacklistedIPs.includes(selectedThreat.ip) && (
                <button className="block-ip-btn" onClick={() => blockIP(selectedThreat.ip)}>
                  <Ban size={16} /> ADD FIREWALL RULE (BLOCK IP)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Attacks Modal */}
      {isAllAttacksModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAllAttacksModalOpen(false)}>
          <div className="modal-content glass-panel all-attacks-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsAllAttacksModalOpen(false)}><X size={20} /></button>
            <div className="modal-header">
              <Activity size={32} color="#33B5E5" />
              <h2>All Intercepted Attacks</h2>
            </div>
            <div className="all-attacks-list">
              {attacks.map((attack, i) => {
                const isBlocked = blacklistedIPs.includes(attack.ip);
                return (
                  <div key={i} className={`attack-card ${isBlocked ? 'blocked-card' : ''}`}>
                    <div className="attack-header">
                      <span className="ip">{attack.ip} {isBlocked && <span className="blocked-tag">[BLOCKED]</span>}</span>
                      <span className="time">{new Date(attack.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="attack-details">
                      <p><span>Origin:</span> {attack.city}, {attack.country}</p>
                      <p><span>User:</span> {attack.username} | <span>Pass:</span> <span className="password">{attack.passwordTried}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Router Component
function App() {
  // Simple router based on window.location
  if (window.location.pathname === '/attack') {
    return <AttackerPortal />;
  }
  return <Dashboard />;
}

export default App;
