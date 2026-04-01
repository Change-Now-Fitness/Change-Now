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

### Live Backend API

http://18.224.229.202:4000

---

## Beta Release Notes 🧪

### Currently Working Features

* User signup and login
* Exercise library with muscle group navigation
* Search functionality
* Add custom exercise modal
* Selected exercise view
* Add workout sets
* View current workout sets
* View historical workout logs
* Backend API and database integration
* Live backend deployment on AWS EC2

### Features In Progress

* Graph and analytics visualization refinements
* Additional workout trend metrics
* UI responsiveness improvements

### Known Issues

* Graph display formatting is still being refined
* Minor mobile styling inconsistencies on smaller screens
* Some API error messages are still being improved for user clarity

---

## Testing 🧪

Testing documentation is maintained separately in the project documentation folder for ease of maintenance and future expansion.

Detailed testing instructions, test cases, and validation workflows can be found in:

```text id="wjlwm7"
docs/testing/
```

This includes:

* unit test documentation
* system / integration test workflows
* manual test procedures
* known issue validation steps

A new developer should refer to this folder for full test execution details and expected outputs.


## Bug Tracking + Features 🐞

The ChangeNow team uses **GitHub Issues** to track bugs, missing features, and release milestones. This keeps project management centralized with the codebase and allows tasks to be assigned to individual team members.

Tracked items include:

* bugs
* feature requests
* API milestones
* beta blockers
* final release tasks

Our main project schedule was initially maintained in a master planning document, and we are currently migrating active tasks and bug reports into GitHub Issues for better coordination and developer visibility.

---

## Change Logs 📝

Project evolution and developer changes are documented in:

```text
docs/changelog.md
docs/changes/
```

Individual developer logs include:

* `adam.md`
* `sam.md`
* `alex.md`
* `chenqi.md`
* `jules.md`

These logs document feature additions, design updates, bug fixes, and milestone progress.

---

## Developer Handoff 👨‍💻

This repository contains all source code, documentation, deployment instructions, and testing resources required for continued development from the beta milestone.

Primary development folders:

```text
frontend/
backend/
docs/
testing/
```

A new developer can use this README to:

* install dependencies
* run the backend
* run the frontend
* deploy updates to EC2
* execute tests
* review active issues and historical changes

This is a new update, our main project schedule is in a master document and we're in the process of migrating this over to Issues. Issues is used mainly for our "current" checklist or features that are next in line. Some features that were implemented in the past have not been added to Issues.
