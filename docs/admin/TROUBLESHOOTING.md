Troubleshooting
Deploy failures (GitHub Actions):

Check Actions logs under the deploy step.
If SSM errors:
InvalidInstanceId: wrong instance id, wrong region, instance stopped, not online in Fleet Manager
AccessDenied: IAM policy missing permissions for SSM read results
Script not found: /opt/change-now/deploy-backend.sh missing or wrong filename
Backend running but DB errors:

Confirm env inside container:
docker exec change-now-backend printenv DATABASE_URL
Confirm the deploy script passes --env-file and the file exists on EC2.
Ensure DATABASE_URL points to Supabase Postgres host, not localhost, and not the Supabase REST API URL.
IPv6 ENETUNREACH to Supabase:

Set NODE_OPTIONS=--dns-result-order=ipv4first in /opt/change-now/backend.env
Restart container
Verify what version is deployed:

docker inspect -f '{{.Config.Image}}' change-now-backend
The tag should be the git commit SHA that was deployed.
Nginx issues:

Check Nginx error log: /var/log/nginx/error.log
Verify proxy points to the correct host/port (backend published port 4000)

SSH into ec2 instance and run this to see backend logs:
docker logs --tail 50 change-now-backend