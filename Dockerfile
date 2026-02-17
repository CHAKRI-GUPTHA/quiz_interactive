# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Backend with built frontend
FROM node:18-alpine
WORKDIR /app

# Copy backend files
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install --production

# Copy all source files
COPY . .

# Copy built frontend to backend public folder
RUN mkdir -p backend/public && cp -r dist/* backend/public/

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
