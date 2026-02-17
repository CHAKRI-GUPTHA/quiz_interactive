# Quiz Interactive - Deployment Guide

## Quick Start (Local)

```bash
npm install
cd backend && npm install
npm run dev
```

---

## Production Deployment

### Prerequisites
- Node.js 18+ or Docker
- Git
- Accounts on your chosen platform (AWS, Azure, Heroku, DigitalOcean, etc.)

---

## Option 1: Docker Deployment (Recommended for All Platforms)

### Local Docker Build & Test
```bash
docker build -t quiz-interactive:latest .
docker-compose up
# Visit http://localhost:5000
```

### Deploy to Docker Hub
```bash
# Build and tag
docker build -t your-dockerhub-username/quiz-interactive:latest .
docker login
docker push your-dockerhub-username/quiz-interactive:latest
```

---

## Option 2: AWS Deployment

### A. Using Elastic Beanstalk (Easiest)
1. Install AWS CLI:
   ```bash
   pip install awscli
   aws configure
   ```

2. Install Elastic Beanstalk CLI:
   ```bash
   pip install awsebcli
   ```

3. Initialize and deploy:
   ```bash
   eb init -p "Node.js 18 running on 64bit Amazon Linux 2" quiz-interactive
   eb create quiz-interactive-env
   eb deploy
   ```

4. Add environment variables:
   ```bash
   eb setenv MONGODB_URI="your_mongodb_connection_string" NODE_ENV=production
   eb open
   ```

### B. Using EC2 + Docker
1. Launch an EC2 instance (Ubuntu 22.04)
2. SSH into the instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. Install Docker and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose-plugin -y
   sudo usermod -aG docker $USER
   ```

4. Clone and deploy:
   ```bash
   git clone https://github.com/CHAKRI-GUPTHA/quiz_interactive.git
   cd quiz_interactive
   docker-compose up -d
   ```

5. Setup reverse proxy with Nginx:
   ```bash
   sudo apt install nginx -y
   ```
   Create `/etc/nginx/sites-available/quiz-interactive`:
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
   sudo ln -s /etc/nginx/sites-available/quiz-interactive /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Option 3: Heroku Deployment

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

2. Login and create app:
   ```bash
   heroku login
   heroku create quiz-interactive
   ```

3. Create `Procfile` in project root:
   ```
   web: node backend/server.js
   ```

4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set NODE_ENV=production
   ```

5. Deploy:
   ```bash
   git push heroku main
   heroku open
   ```

---

## Option 4: Azure App Service

1. Install Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

2. Create resource group and app:
   ```bash
   az group create --name quiz-rg --location eastus
   az appservice plan create --name quiz-plan --resource-group quiz-rg --sku B1 --is-linux
   az webapp create --resource-group quiz-rg --plan quiz-plan --name quiz-interactive --runtime "NODE|18-lts"
   ```

3. Deploy from GitHub:
   ```bash
   az webapp deployment github-actions add --name quiz-interactive --resource-group quiz-rg \
     --repo CHAKRI-GUPTHA/quiz_interactive --branch main
   ```

4. Set app settings:
   ```bash
   az webapp config appsettings set --resource-group quiz-rg --name quiz-interactive \
     --settings MONGODB_URI="your_mongodb_uri" NODE_ENV=production
   ```

---

## Option 5: DigitalOcean App Platform

1. Connect your GitHub repo at https://cloud.digitalocean.com/apps

2. Create new app, select your repository

3. DigitalOcean auto-detects Node.js; configure:
   - **HTTP Routes**: Set inbound port 80 → application port 5000
   - **Environment Variables**: Add MONGODB_URI, NODE_ENV

4. Deploy by pushing to main branch

---

## Option 6: Render.com (Simple & Free)

1. Go to https://render.com and sign up

2. Click "New +" → "Web Service"

3. Connect GitHub repo (`CHAKRI-GUPTHA/quiz_interactive`)

4. Configure:
   - Runtime: Node
   - Build command: `npm install && npm run build && cd backend && npm install`
   - Start command: `node backend/server.js`
   - Environment Variables:
     - `MONGODB_URI`: your MongoDB connection
     - `NODE_ENV`: production

5. Hit Deploy

---

## Environment Variables Required

Create a `.env` file in the root (or set via platform UI):
```
NODE_ENV=production
BACKEND_PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz_interactive
JWT_SECRET=your_secret_key_here
VITE_API_URL=https://your-deployed-domain.com
```

---

## MongoDB Setup

### Option A: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/quiz_interactive`
4. Use this for `MONGODB_URI`

### Option B: Self-hosted MongoDB
```bash
docker run -d -p 27017:27017 --name quiz-mongo mongo:5.0
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Using CloudFlare (Easy)
1. Point domain to Cloudflare nameservers
2. Set DNS to point to your server IP
3. Enable "Flexible SSL" in Cloudflare dashboard

---

## Monitoring & Logs

### AWS Elastic Beanstalk
```bash
eb logs
eb status
```

### Docker Container
```bash
docker logs -f container_name
```

### Heroku
```bash
heroku logs --tail
```

### Azure
```bash
az webapp log tail --resource-group quiz-rg --name quiz-interactive
```

---

## Support & Troubleshooting

1. **Frontend not loading**: Check `VITE_API_URL` environment variable matches your backend domain
2. **Database connection fails**: Verify `MONGODB_URI` and IP whitelist in MongoDB Atlas
3. **Port already in use**: Change `BACKEND_PORT` or kill existing process

---

## Next Steps

1. Configure your chosen deployment platform
2. Set environment variables
3. Push to main branch (or manually trigger deploy)
4. Verify app at your deployed URL
5. Monitor logs for errors

Good luck! 🚀
