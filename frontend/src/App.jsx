import React, { useState, useEffect, useMemo, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { io } from "socket.io-client";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ShieldAlert, Activity, Globe, MapPin, X, ShieldCheck, Terminal, Ban, Smartphone, Download, Cpu, Skull } from "lucide-react";
import QRCode from "react-qr-code";
import "./App.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

// Vibrant 'Toy-like' Primary Colors for the Pie Chart
const COLORS = ['#FF1493', '#00E5FF', '#FFEB3B', '#39FF14', '#FF5722'];


const playAudio = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'beep') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'alarm') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch(e) { }
};

const getAIProfile = (pass) => {
  if (['123456', 'password', '12345678'].includes(pass)) return { label: 'LOW SKILL BOT', color: '#888' };
  if (['admin', 'root'].includes(pass)) return { label: 'BRUTE FORCE', color: '#FF8800' };
  return { label: 'TARGETED THREAT', color: '#FF4444' };
};

// --- ATTACKER PORTAL COMPONENT ---
function AttackerPortal() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("ready");
  const [realIp, setRealIp] = useState("8.8.8.8");

  useEffect(() => {
    // Fetch the real IP of the mobile device
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setRealIp(data.ip))
      .catch(err => console.error("Could not fetch IP"));
  }, []);

  const launchAttack = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setStatus("attacking");
    
    const payload = {
      ip: realIp,
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
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(5);
  const [isLockdown, setIsLockdown] = useState(false);

  // CPU Decay
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => (prev > 5 ? Math.max(5, prev - Math.random() * 2) : 5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto Simulator
  useEffect(() => {
    let interval;
    if (isAutoSimulating && !isLockdown) {
      interval = setInterval(() => {
        const randomIP = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        const randomCities = [
          {c:"Moscow", co:"Russia", lat: 55.75, lon: 37.61}, 
          {c:"Beijing", co:"China", lat: 39.9, lon: 116.4},
          {c:"Pyongyang", co:"North Korea", lat: 39.02, lon: 125.75},
          {c:"Tehran", co:"Iran", lat: 35.68, lon: 51.38},
          {c:"New York", co:"USA", lat: 40.71, lon: -74.00},
          {c:"London", co:"UK", lat: 51.50, lon: -0.12},
          {c:"Mumbai", co:"India", lat: 19.07, lon: 72.87},
          {c:"Tokyo", co:"Japan", lat: 35.67, lon: 139.65},
          {c:"Sydney", co:"Australia", lat: -33.86, lon: 151.20},
          {c:"Sao Paulo", co:"Brazil", lat: -23.55, lon: -46.63}
        ];
        const rc = randomCities[Math.floor(Math.random()*randomCities.length)];
        const passwords = ["123456", "admin", "root", "password", "db_backup_2026", "secret123"];
        const pass = passwords[Math.floor(Math.random()*passwords.length)];
        
        const newAttack = {
          ip: randomIP,
          username: "admin",
          passwordTried: pass,
          city: rc.c,
          country: rc.co,
          lat: rc.lat,
          lon: rc.lon,
          timestamp: new Date().toISOString()
        };
        
        setAttacks(prev => [newAttack, ...prev]);
        setCpuUsage(prev => Math.min(prev + (Math.random() * 15 + 5), 100));
        setLogs(prev => [...prev, `[SIM] INTRUSION DETECTED: ${randomIP} on port 22`].slice(-50));
        playAudio('beep');
      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [isAutoSimulating, isLockdown]);

  
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
          <button className="simulate-btn" onClick={() => setIsAutoSimulating(!isAutoSimulating)}>
            <Activity size={16} /> {isAutoSimulating ? "Stop Simulation" : "Auto-Simulate Traffic"}
          </button>
          <button className="simulate-btn" style={{color:'#33B5E5', borderColor:'#33B5E5', background:'rgba(51,181,229,0.1)'}} onClick={() => {
            let csv = "IP,Username,Password,Country,City,Timestamp\n";
            attacks.forEach(a => { csv += `${a.ip},${a.username},${a.passwordTried},${a.country},${a.city},${a.timestamp}\n`; });
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'Executive_Threat_Report.csv';
            a.click();
          }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="simulate-btn" style={{color:'red', borderColor:'red', background:'rgba(255,0,0,0.2)', fontWeight:'bold'}} onClick={() => {setIsLockdown(true); playAudio('alarm');}}>
            <Skull size={16} /> LOCKDOWN
          </button>
          <div className="status-badge">
             {isConnected ? <span className="connected">🟢 Live</span> : <span className="disconnected">🔴 Offline</span>}
          </div>
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
                <Pie data={topCountries} cx="50%" cy="50%" innerRadius={40} outerRadius={75} cornerRadius={12} paddingAngle={6} dataKey="value" stroke="rgba(255,255,255,0.1)" strokeWidth={2}>
                  {topCountries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.6))' }} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        
        <div className="stats-card glass-panel" style={{display: 'flex', flexDirection: 'row', gap: '30px', justifyContent: 'space-around'}}>
           <div className="stat-box">
             <h4>CPU Load</h4>
             <span className="stat-value" style={{color: cpuUsage > 80 ? 'red' : cpuUsage > 50 ? 'orange' : '#00C851'}}>{Math.round(cpuUsage)}%</span>
           </div>
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

                        <p>
                          <span>Pass:</span> <span className="password">{attack.passwordTried}</span>
                          {(() => {
                             const prof = getAIProfile(attack.passwordTried);
                             return <span className="ai-badge" style={{color: prof.color, border: `1px solid ${prof.color}`, fontSize: '0.65rem', padding: '2px 4px', borderRadius: '4px', marginLeft: '8px', letterSpacing: '0.5px'}}>{prof.label}</span>;
                          })()}
                        </p>

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

      {/* Nuclear Lockdown Overlay */}
      {isLockdown && (
        <div className="lockdown-overlay">
          <Skull size={120} color="red" style={{marginBottom: '20px'}} />
          <h1>SYSTEM ISOLATED</h1>
          <p>ALL INBOUND CONNECTIONS TERMINATED</p>
          <button className="simulate-btn" style={{marginTop: '30px', borderColor:'white', color:'white', background: 'transparent'}} onClick={() => {setIsLockdown(false); setCpuUsage(5);}}>RESTORE SYSTEM</button>
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
