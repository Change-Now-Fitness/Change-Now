Please reach out to admin for env files
========================================

LOCAL backend .env config
(/backend/.env)
========================================
DATABASE_URL= same on both
JWT_SECRET= same on both

PORT=4000
PUBLIC_API_URL=http://localhost:4000
CORS_ALLOWED_ORIGINS=http://localhost:8081
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
TRUST_PROXY=true
==========================================

PROD backend .env config - DOES NOT PULL FROM LOCAL ENV
(on ec2 instance /opt/change-now/backend.env)

========================================
NODE_ENV=production
DATABASE_URL= same on both
JWT_SECRET= same on both
PUBLIC_API_URL= https://api.changenow.fit
CORS_ALLOWED_ORIGINS=http://localhost:8081,[web vercel link]

