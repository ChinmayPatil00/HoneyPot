import requests
import random
import time

BACKEND_API_URL = "https://honeypot-gb9v.onrender.com/api/attack"

# A list of random public IP addresses from around the world
global_ips = [
    # Russia
    "46.17.40.1", "176.12.34.12", "95.108.1.1", 
    # China
    "114.114.114.114", "220.181.38.148", "211.162.240.1",
    # Brazil
    "177.20.10.1", "187.10.20.30",
    # USA
    "192.200.1.1", "64.233.160.1", "198.51.100.1",
    # Germany
    "144.76.10.1", "88.198.50.1",
    # UK
    "212.58.244.20", "81.134.202.29",
    # Japan
    "133.1.2.3", "124.83.159.212"
]

# Common passwords hackers try
passwords = ["123456", "admin", "root", "password", "qwerty", "12345678", "hacker123", "letmein", "toor"]
usernames = ["root", "admin", "postgres", "ubuntu", "user", "test"]

print("=========================================")
print("[*] STARTING GLOBAL ATTACK SIMULATION...")
print("=========================================")

for i in range(15):
    ip = random.choice(global_ips)
    username = random.choice(usernames)
    password = random.choice(passwords)
    
    payload = {
        "ip": ip,
        "username": username,
        "passwordTried": password
    }
    
    print(f"[*] Simulating attack from IP: {ip} (User: {username}, Pass: {password})")
    
    try:
        response = requests.post(BACKEND_API_URL, json=payload, timeout=10)
        if response.status_code == 200:
            print("    [+] Successfully logged on the map!")
        else:
            print(f"    [-] Server error: {response.status_code}")
    except Exception as e:
        print(f"    [-] Connection failed: {e}")
        
    # Wait 1 to 3 seconds before the next attack to make it look realistic
    time.sleep(random.randint(1, 3))

print("\n[+] SIMULATION COMPLETE! Open your Vercel Dashboard to see the map!")
