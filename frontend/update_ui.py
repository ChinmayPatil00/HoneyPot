import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { ShieldAlert, Activity, Globe, MapPin, X, ShieldCheck, Terminal, Ban, Smartphone } from "lucide-react";',
    'import { ShieldAlert, Activity, Globe, MapPin, X, ShieldCheck, Terminal, Ban, Smartphone, Download, Cpu, Skull } from "lucide-react";'
)

# 2. Helpers
helpers = '''
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
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'alarm') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
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

// --- ATTACKER PORTAL COMPONENT ---'''
content = content.replace('// --- ATTACKER PORTAL COMPONENT ---', helpers)

# 3. States inside Dashboard
states = '''
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
'''
content = content.replace(
    '  const [blacklistedIPs, setBlacklistedIPs] = useState([]);\n  const [isAllAttacksModalOpen, setIsAllAttacksModalOpen] = useState(false);',
    states
)

# 4. Modify Audio on actual attacks
content = content.replace(
    '''      setLogs(prev => [...prev, `[CONNECTION] Attack detected from ${newAttack.ip}`].slice(-50));''',
    '''      setLogs(prev => [...prev, `[CONNECTION] Attack detected from ${newAttack.ip}`].slice(-50));\n      playAudio('beep');\n      setCpuUsage(prev => Math.min(prev + (Math.random() * 15 + 5), 100));'''
)

# 5. Modify Audio on DEFCON 1
content = content.replace(
    '''    if (attackCount > 10) return 1;''',
    '''    if (attackCount > 10) { playAudio('alarm'); return 1; }'''
)

# 6. Buttons in Header
buttons = '''
        <div className="header-actions">
          <button className="simulate-btn" onClick={() => setIsAutoSimulating(!isAutoSimulating)}>
            <Activity size={16} /> {isAutoSimulating ? "Stop Simulation" : "Auto-Simulate Traffic"}
          </button>
          <button className="simulate-btn" style={{color:'#33B5E5', borderColor:'#33B5E5', background:'rgba(51,181,229,0.1)'}} onClick={() => {
            let csv = "IP,Username,Password,Country,City,Timestamp\\n";
            attacks.forEach(a => { csv += `${a.ip},${a.username},${a.passwordTried},${a.country},${a.city},${a.timestamp}\\n`; });
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
          <div className="status-badge connected">
'''
content = re.sub(r'<div className="header-actions">.*?<div className="status-badge connected">', buttons, content, flags=re.DOTALL)

# 7. CPU in Stats Card
cpu_stat = '''
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
'''
content = re.sub(r'<div className="stats-card glass-panel">.*?</div>\s*</div>\s*</div>\s*<div className="main-content">', cpu_stat + '      </div>\\n\\n      <div className="main-content">', content, flags=re.DOTALL)
# Fallback replacement if the above regex fails slightly
if 'CPU Load' not in content:
    content = re.sub(r'<div className="stats-card glass-panel">.*?</div>\s*</div>\s*<div className="main-content">', cpu_stat + '      </div>\\n\\n      <div className="main-content">', content, flags=re.DOTALL)

# 8. AI Badge in Attack Card
ai_badge = '''
                        <p>
                          <span>Pass:</span> <span className="password">{attack.passwordTried}</span>
                          {(() => {
                             const prof = getAIProfile(attack.passwordTried);
                             return <span className="ai-badge" style={{color: prof.color, border: `1px solid ${prof.color}`, fontSize: '0.65rem', padding: '2px 4px', borderRadius: '4px', marginLeft: '8px', letterSpacing: '0.5px'}}>{prof.label}</span>;
                          })()}
                        </p>
'''
content = content.replace(
    '''                        <p><span>Pass:</span> <span className="password">{attack.passwordTried}</span></p>''',
    ai_badge
)

# 9. Lockdown UI overlay
lockdown_ui = '''
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
'''
content = content.replace('''    </div>\n  );\n}\n\n// Router Component''', lockdown_ui + '\n// Router Component')
# Windows line endings fallback
content = content.replace('''    </div>\r\n  );\r\n}\r\n\r\n// Router Component''', lockdown_ui + '\r\n// Router Component')


with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete")
