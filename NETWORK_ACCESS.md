# 🌐 Multi-Server & Remote Access Setup

Your Quiz Interactive app can now run on **any server** and be accessed from **any machine**. Here's how:

---

## Quick Start - Access from Another Machine

### Step 1: Find Your Server's IP Address

**On Windows (Server Machine):**
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**On Mac/Linux (Server Machine):**
```bash
ifconfig
# or
hostname -I
```

### Step 2: Run the Server
```bash
npm run prod
# or for development:
npm run dev
```

### Step 3: Access from Another Machine
Open a browser on ANY connected machine and visit:
```
http://YOUR_SERVER_IP:5000
```

**Example:** If server IP is `192.168.1.100`, visit:
```
http://192.168.1.100:5000
```

---

## Network Access Scenarios

### Scenario 1: Same WiFi/LAN Network
✅ **Works automatically**
- Server and client on same network
- Use server's internal IP (e.g., 192.168.x.x)
- All features available

**Steps:**
1. Get server IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Run: `npm run prod` on server
3. Visit: `http://SERVER_IP:5000` on any machine

---

### Scenario 2: Different Networks (Over Internet)
You need a **tunnel** to expose your local server to the internet.

#### Option A: Using ngrok (Free & Easy)
1. Download & install ngrok: https://ngrok.com/download
2. Signup for free account: https://dashboard.ngrok.com

3. On your server machine:
```bash
ngrok http 5000
```

4. ngrok will show a URL like: `https://abc123.ngrok.io`

5. Share this URL - anyone can access your app:
```
https://abc123.ngrok.io
```

#### Option B: Deploy to Cloud (Recommended)
Instead of tunneling, deploy to a cloud server:
- **AWS** (see DEPLOYMENT.md)
- **Heroku** (see DEPLOYMENT.md)
- **Azure** (see DEPLOYMENT.md)
- **DigitalOcean** (see DEPLOYMENT.md)

---

### Scenario 3: Docker on Remote Server
Deploy with Docker to any VPS/Server:

1. SSH into your server:
```bash
ssh user@server-ip
```

2. Clone your repo:
```bash
git clone https://github.com/CHAKRI-GUPTHA/quiz_interactive.git
cd quiz_interactive
```

3. Run with Docker:
```bash
docker-compose up -d
```

4. Access from anywhere:
```
http://server-ip:5000
```

---

## Environment Variables for Different Servers

Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=production
BACKEND_PORT=5000

# API Configuration (for frontend)
VITE_API_URL=http://YOUR_SERVER_IP:5000

# Database (optional)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quiz
```

**For different servers:**

**Local development:**
```
VITE_API_URL=http://localhost:5000
```

**LAN server (192.168.1.100):**
```
VITE_API_URL=http://192.168.1.100:5000
```

**Cloud server (example.com):**
```
VITE_API_URL=https://example.com
```

**ngrok tunnel:**
```
VITE_API_URL=https://abc123.ngrok.io
```

---

## Firewall & Port Configuration

### Allow Port 5000 Through Firewall

**Windows Firewall:**
```powershell
netsh advfirewall firewall add rule name="Quiz App" dir=in action=allow protocol=tcp localport=5000
```

**Linux (UFW):**
```bash
sudo ufw allow 5000/tcp
```

**macOS (System Preferences):**
1. System Preferences → Security & Privacy → Firewall Options
2. Add port 5000 to allowed list

---

## Testing From Another Machine

### For LAN Access
1. Server machine runs: `npm run prod`
2. Get server IP: `ipconfig` (shows 192.168.x.x)
3. On client machine, open browser: `http://192.168.1.100:5000` (replace with actual IP)
4. You should see the Quiz app

### For Internet Access (ngrok)
1. Server machine runs: `ngrok http 5000`
2. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)
3. Share URL with anyone - they can access your app

---

## Production Server Checklist

- [ ] Server machine running: `npm run prod`
- [ ] Firewall allows port 5000
- [ ] Network security allows connections
- [ ] Tested from another machine on same network
- [ ] Got server IP address (192.168.x.x or public IP)
- [ ] For internet access: using ngrok or deployed to cloud
- [ ] Set correct `VITE_API_URL` in `.env`
- [ ] Frontend built (`dist/` folder exists)

---

## Troubleshooting

### Can't connect from another machine
❌ **Problem:** Getting "Connection refused" or timeout
✅ **Solution:** 
- Ensure server is running: `npm run prod`
- Check firewall allows port 5000
- Verify correct IP address: `ipconfig`
- Both machines on same network (no VPN blocking)
- Try: `ping SERVER_IP` to test connection

### Wrong API URL
❌ **Problem:** Frontend loads but quiz data missing
✅ **Solution:**
- Check `VITE_API_URL` in `.env` or `vite.config.js`
- Should match server's accessible IP/URL
- Rebuild frontend: `npm run build`

### Port already in use
❌ **Problem:** `Error: listen EADDRINUSE :::5000`
✅ **Solution:**
```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## Quick Access Scripts

### Get Server IP (Windows)
Create `get-ip.ps1`:
```powershell
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}).IPAddress
Write-Host "Server IP: $ipAddress"
Write-Host "Access app at: http://$ipAddress`:5000"
```

Run: `powershell .\get-ip.ps1`

### Get Server IP (Mac/Linux)
Create `get-ip.sh`:
```bash
#!/bin/bash
IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $IP"
echo "Access app at: http://$IP:5000"
```

Run: `bash get-ip.sh`

---

## Advanced: Nginx Reverse Proxy

For production, use Nginx as a reverse proxy:

Create `/etc/nginx/sites-available/quiz`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Summary

| Scenario | Setup | Access URL |
|----------|-------|-----------|
| **Local** | `npm run dev` | `http://localhost:5000` |
| **LAN** | `npm run prod` | `http://192.168.x.x:5000` |
| **ngrok** | `ngrok http 5000` | `https://abc123.ngrok.io` |
| **Cloud (AWS/Azure)** | See DEPLOYMENT.md | Your domain |
| **Docker** | `docker-compose up` | `http://server-ip:5000` |

Need help? See **DEPLOYMENT.md** for cloud platforms or **QUICK_START.html** for interactive setup! 🚀
