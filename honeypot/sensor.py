import socket
import threading
import paramiko
import requests
import time
import os

# Configuration
HONEYPOT_PORT = 2222
# This pulls the deployed Render URL
BACKEND_API_URL = "https://honeypot-gb9v.onrender.com/api/attack"
RSA_KEY_FILE = "server_rsa.key"

# Generate or load the RSA Key for our Fake SSH Server
try:
    host_key = paramiko.RSAKey(filename=RSA_KEY_FILE)
except IOError:
    print("Generating new RSA key for the Honeypot...")
    host_key = paramiko.RSAKey.generate(2048)
    host_key.write_private_key_file(RSA_KEY_FILE)

# This class defines how our Fake SSH Server behaves
class SSHServer(paramiko.ServerInterface):
    def __init__(self, client_ip):
        self.event = threading.Event()
        self.client_ip = client_ip

    def check_channel_request(self, kind, chanid):
        if kind == 'session':
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    # This is the most important function: It catches the password guess!
    def check_auth_password(self, username, password):
        print(f"\n[+] ATTACK DETECTED!")
        print(f"    IP: {self.client_ip}")
        print(f"    User: {username}")
        print(f"    Pass: {password}")
        
        # Send the stolen credentials to our Node.js Backend
        try:
            # If the user attacks from localhost, we want to grab their REAL internet IP 
            # so the dashboard shows their actual city instead of a fallback.
            actual_ip = self.client_ip
            if actual_ip == "127.0.0.1":
                try:
                    actual_ip = requests.get('https://api.ipify.org', timeout=3).text
                except Exception:
                    pass

            payload = {
                "ip": actual_ip,
                "username": username,
                "passwordTried": password
            }
            print(f"[*] Sending attack data to backend: {payload}")
            # Increased timeout to 60s because free Render servers go to sleep and take 50s to wake up!
            response = requests.post(BACKEND_API_URL, json=payload, timeout=60)
            if response.status_code == 200:
                pass
        except Exception as e:
            print(f"[-] Failed to send attack to backend (is the backend running?): {e}")

        # Always return AUTH_FAILED. This tells the hacker "Wrong Password".
        # We also add a 1-second delay to make it feel like a real Linux server checking a database.
        time.sleep(1)
        return paramiko.AUTH_FAILED

    def get_allowed_auths(self, username):
        return 'password'

# Handles a single hacker connecting to our server
def handle_connection(client, addr):
    client_ip = addr[0]
    print(f"[*] Incoming connection from {client_ip}")
    
    try:
        transport = paramiko.Transport(client)
        transport.add_server_key(host_key)
        
        server = SSHServer(client_ip)
        try:
            transport.start_server(server=server)
        except paramiko.SSHException as e:
            print(f"[-] SSH negotiation failed: {e}")
            return
        
        # Wait for the hacker to try authenticating (up to 400 seconds)
        chan = transport.accept(400)
        if chan is None:
            print("[-] Hacker disconnected before typing a password.")
            return
            
    except Exception as e:
        print(f"[-] Error handling connection: {e}")
    finally:
        client.close()

# Starts the main listener
def start_honeypot():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('0.0.0.0', HONEYPOT_PORT))
    sock.listen(100)
    
    print(f"=========================================")
    print(f"[*] HONEYPOT ACTIVE ON PORT {HONEYPOT_PORT}")
    print(f"[*] Waiting for hackers...")
    print(f"=========================================")
    
    while True:
        try:
            client, addr = sock.accept()
            # Start a new thread for every hacker, so multiple hackers can attack us at once
            threading.Thread(target=handle_connection, args=(client, addr)).start()
        except KeyboardInterrupt:
            print("\n[*] Shutting down honeypot.")
            break
        except Exception as e:
            print(f"[-] Error accepting connection: {e}")

if __name__ == "__main__":
    start_honeypot()
