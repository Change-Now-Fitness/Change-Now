Required to run binary:
node: v20.20.0
npm: 10.8.2

There are two essential parts of the binary, the frontend build artifact and the backend server package. 

To run the frontend build artifact:
 - In your terminal of choice (we use zsh for dev), navigate
to the dist directory
 - Ensure you have node and npm, then run 'npx serve .'
 - You should be promped to open up http://localhost:3000 in
 your browser, you will then need to start the backend server package 

To run the server package:
 - Return to the root binary directory and navigate to the backend directory
 - run 'npm install'
 - run 'npm start'
 - You should see: "Server listening on port 4000", the server is now running 

Working features:
sign up / log in (with browser cookies, not all pages use)
view exercise library
select an exercise
add custom exercise (only weight can currently be measured as a metric, for example, cardio will just ask for weight for now instead of time)
add set and view history (might not be any in history)
view graph of history

Basic usecase:
- Run frontend and server package
- click signup, make an account
- log in with the account
- select an exercise, like bench press
- add a workout log, so maybe put like 100 pounds 5 reps
- you should be able to see the new addition to the graph
- the next day, the workout log will be transfered into 
the scrollable history of logs below (this will happen instantly in final release)


Known issues:
- Currently using lax and unsecure cookie settings on this build for remote use (fine on localhost) but on deployment branch (beta) we use stricter settings to avoid CORS errors
- Login + cookies works but user authentication is not enforced across all pages yet
- Cookies currently last 10 minutes for development, if a cookie runs out there may be unexpected behavior, instead of pushing you back to the login page. Ex. if you try to add more data after cookie runs out, it might not work and you'll have to navigate back into the login page manually for a new cookie. See console logs for detailed server replies.
- Custom exercise can only use weight, no matter what is selected (can't handle cardio, body weight etc)
- We don't do anything with bench yet



