import requests
import time

BACKEND_API_URL = "https://honeypot-gb9v.onrender.com/api/attack"

# A list of random public IP addresses from around the world
global_ips = [
    "46.17.40.1", "176.12.34.12", "95.108.1.1", 
    "114.114.114.114", "220.181.38.148", "211.162.240.1",
    "177.20.10.1", "187.10.20.30",
    "192.200.1.1", "64.233.160.1", "198.51.100.1",
    "144.76.10.1", "88.198.50.1",
    "212.58.244.20", "81.134.202.29",
    "133.1.2.3", "124.83.159.212"
]

print("Injecting skewed data...")

# We want password to be wildly uneven:
# 123456: 15 times
# admin: 8 times
# root: 4 times
# password: 2 times

attacks_to_send = (
    [("123456", "admin")] * 15 +
    [("admin", "root")] * 8 +
    [("root", "ubuntu")] * 4 +
    [("password", "test")] * 2
)

import random
random.shuffle(attacks_to_send)

for passw, user in attacks_to_send:
    ip = random.choice(global_ips)
    payload = {
        "ip": ip,
        "username": user,
        "passwordTried": passw
    }
    try:
        requests.post(BACKEND_API_URL, json=payload, timeout=5)
    except:
        pass
    time.sleep(0.1)

print("Done injecting skewed data.")
