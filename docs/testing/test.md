exerciselibrary.test.tsx:

This file checks the Exercise Library screen without a real server or phone. It pretends the user is logged out and checks that the app sends them to the home/login route; then it pretends they’re logged in and that the server returns one exercise, and checks that that exercise name shows up on the screen; finally it pretends they add a new custom exercise and checks that the “save” logic runs and the new name appears. 
How: fake versions of navigation and API calls are used so nothing hits the network—Jest swaps those in, the screen renders in Node, and the test taps buttons and types text like a user would. 
What we expect: all three checks pass—redirect when not logged in, list shows when data is fake-loaded, and a custom exercise shows up after the add flow.


login.test.tsx:

This file checks the login page: that the email and password boxes and the main buttons show up, that tapping “Sign Up” opens the signup screen, and that after entering email/password and tapping “Log In,” the login helper runs with those values and the app “goes to” the exercise library tab. 
How: the real login screen is shown, but logging in doesn’t call your backend—it calls a fake login function that we control, and we watch fake “go to this screen” calls instead of a real app navigator. 
What we expect: the form looks right, Sign Up triggers the right navigation, and a successful fake login triggers both the login call and navigation to /(tabs)/exerciselibrary.


signup.test.tsx:

This file checks the signup page: wrong confirmation password shows “passwords don’t match,” a password that’s too short shows the length error, and when everything is valid and signup “succeeds,” the signup helper is called and the app moves to the same main tab area as after login. 
How: same idea—no real account is created; a fake signUp returns success, and we only check the screen text and that the right functions were “called.” 
What we expect: two error cases show the right messages; the happy path calls signup with the test email/password and then navigates to /(tabs)/exerciselibrary.


addset.test.ts:

This file unit-tests the addSet() API helper in frontend/lib/api.ts. It verifies that addSet sends a POST request to /workouts/sets with the correct JSON body (exerciseId, userId, weight, reps), and that it returns the parsed JSON payload on success. It also checks the error path when the backend response is not ok.  
How: fetch is mocked with Jest, so no real network call is made.  
What we expect: on success, fetch is called with the right endpoint and payload; on failure, addSet throws "Failed to save set".


fetchExercises.test.ts:

This file unit-tests fetchExercises() in frontend/lib/api.ts. It checks that the request includes userId in query params, returns the exercise list on success, and throws an ApiError-like object when the response is not ok.  
How: fetch is mocked and controlled for both success and failure cases.  
What we expect: correct endpoint usage, expected JSON result, and correct error handling for non-2xx responses.


fetchCurrentSets.test.ts:

This file unit-tests fetchCurrentSets() in frontend/lib/api.ts. It verifies that the request URL is built correctly with exerciseId, userId, and date, and returns current-set rows on success. It also verifies rejection behavior when the response is not ok.  
How: fetch is mocked in Jest to avoid backend dependency.  
What we expect: correct endpoint call, returned set rows, and thrown error message "Failed to fetch sets" on failure.


fetchExerciseHistory.test.ts:

This file unit-tests fetchExerciseHistory() in frontend/lib/api.ts. It verifies that the request URL includes exerciseId and userId, returns grouped history data on success, and throws on failed responses.  
How: fetch is mocked to simulate both successful and failed API responses.  
What we expect: correct endpoint call, expected history object returned, and thrown error message "Failed to fetch history" when response is not ok.
