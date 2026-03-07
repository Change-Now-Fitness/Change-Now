# Welcome to ChangeNow 🔩

ChangeNow is a workout tracking mobile application built with:

**Frontend:** Expo (React Native)

**Backend:** Express.js REST API

**Database:** PostgreSQL (Supabase)

---
## Project Structure 📁

```
Change-Now/
├── frontend/   # Expo mobile app
├── backend/    # Express REST API
└── assets/     # Shared assets
```
---
## Backend (API Server) 🚀

### Setup
```
cd backend
npm install
```

### Run the backend
```
npm start
```
Backend runs at: http://localhost:4000

### Available Test Endpoints
GET / → Server health check

GET /users → Returns users from database

---
## Frontend (Expo App) 📱

### Setup
```
cd frontend
npm install
```

### Run the frontend
```
npx expo start
```
Frontend runs at: http://localhost:8081

---

## Backend Deployment (AWS EC2) ☁️

The backend is deployed on an AWS EC2 instance and managed using **PM2**.

### Connect to the server

ssh -i change-now-key.pem ec2-user@18.224.229.202


### Navigate to the backend

cd ~/Change-Now/backend


### Pull latest backend changes

cd ~/Change-Now
git pull origin putting-backend-on-server
cd backend


### Install dependencies (if needed)

npm install


### Start the backend with PM2

pm2 start server.js --name changenow-backend
pm2 save


### Restart the backend after updates

pm2 restart changenow-backend


### Check server status

pm2 status


### View logs

pm2 logs changenow-backend


---

### Live Backend API

http://18.224.229.202:4000
