To start the backend, ensure you're in the backend directory and then do:

node index.js

if you have dependency issues, chatgpt it for now, 

my .env may or may not be in the github but it has the supabase links with a populated db with tables. if its not, you might need to create your own but i do plan to create a team db so we dont have this issue

--------------
COMPONENTS
--------------
backend/routes/auth.js
has authentication (login/signup stuff)

backend/dbconnections.js
has the connections pool that can be used to connect to the DB 

