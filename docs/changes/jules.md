All express router functions are in backend/workouts.js
All frontend api functions used in selectedexercise.tsx are in lib/api.ts

- Redesigned the select exercise UI 
- Added ability to add sets 
    -> addSet() API function in lib/api.ts in the frontend, sends HTTP request to backend
    -> Matching router in workouts.js that inserts a row into workout_log in the DB using pool
- Added sets are loaded into the current table when the page loads with fetchCurrentSets() in lib/api.ts
    -> Recieved by backend with the "/:exerciseId/current" router and queries DB for current date's logs.

- Added ability to fetch exercise history
    -> Queries previousWorkouts when the page loads
        -> fetchExercises() API function in lib/api.ts
        -> Matching router in workouts.js that queries workout logs from the DB for a specific exercise by date
    -> Maps previously logged sets, scrollable from most recent to oldest (by date)
- Updated graph functionality
    -> When a user has no history of exercises except for a set added on the current date, the graph is padded with a 0 entry so it looks clean. If a user has at least two days worth of logs, then the graph plots the oldest log as the first point. 

- Added auto install/launch using concurrently in the root package.json 
    -> Can run frontend and backend from root directory with npm start/ npm run start
    -> Can install frontend and backend dependencies with npm run install:all
    -> Note: Need to run npm install from root directory to install concurrently package