Cloud runtime (EC2 + Docker + Nginx + SSM + ECR)
Components:

Before you run anything (tools you’ll need)

- On your local machine:
  - AWS console access (ECR + SSM) or AWS CLI if you prefer
- On the EC2 host:
  - Docker installed/running
  - Nginx installed/running
  - SSM agent online

EC2 instance runs:
Docker (backend container)
Nginx (public entrypoint / reverse proxy)
SSM agent (for deploy automation)
ECR stores Docker images
Supabase hosts Postgres database
On EC2 (important paths):

Deploy script: /opt/change-now/deploy-backend.sh
Backend env file: /opt/change-now/backend.env
Nginx config: typically /etc/nginx/nginx.conf and /etc/nginx/sites-enabled/<site>
Logs:
Docker logs: docker logs change-now-backend
Nginx logs: /var/log/nginx/access.log, /var/log/nginx/error.log
Nginx role:

Terminates TLS (if configured with certbot/ACM/etc) and proxies requests to backend container port 4000
Typical proxy target: http://127.0.0.1:4000 on the EC2 host (Nginx is on host, backend port is published)
SSM role:

Deploys without SSH keys by executing shell commands on the instance
Instance must appear “Online” in Systems Manager Fleet Manager
ECR role:

EC2 instance role must allow ECR pull
Deploy script logs in to ECR and pulls the requested SHA tag
Health checks (typical):

Verify container is running: docker ps
Verify backend responds locally on EC2: curl -i http://127.0.0.1:4000/<some-route>
Verify public routing: curl -i https://<your-domain>/<some-route>