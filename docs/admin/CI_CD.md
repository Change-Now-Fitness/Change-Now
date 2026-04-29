CI/CD (GitHub Actions -> ECR -> SSM -> EC2)
High-level flow (push to deployment branch):

Lint
Tests (unit + e2e)
Build backend Docker image
Push image to ECR tagged with git commit SHA
Deploy: SSM runs a script on EC2 that pulls the SHA tag and restarts the container
Workflow file:

.github/workflows/ci.yml
What CI/CD produces:

ECR image: 312695118456.dkr.ecr.us-east-2.amazonaws.com/change-now-backend:<git-sha>
Deploy mechanism:

GitHub Actions assumes AWS role using OIDC:
arn:aws:iam::312695118456:role/change-now-github-actions-deploy-prod
GitHub Actions uses AWS SSM Run Command (AWS-RunShellScript) to run:
bash /opt/change-now/deploy-backend.sh <git-sha>
EC2 instance is selected via GitHub repo secret:
EC2_INSTANCE_ID
Where to look:

GitHub repo -> Actions: see logs for lint/test/build/deploy steps
AWS -> ECR: confirm image tag exists
AWS -> Systems Manager -> Fleet Manager: instance must be online
AWS -> Systems Manager -> Run Command history: command output if needed
Required GitHub secrets (typical):

EC2_INSTANCE_ID (deploy target)
Test-only secrets if tests need them (DB/JWT, etc)

Testing note (important):

CI runs Playwright end-to-end tests that seed a known test user into Postgres before running.
That means the CI DATABASE_URL must point to a dedicated test database (not production), because the seed script creates/updates rows.
The seed script also includes a schema-repair step for legacy `exercise_templates` tables missing an auto-increment default on `id`.

CI also runs backend integration tests via:
- backend: npm run test:integration (sets RUN_INTEGRATION=1)
CI lint also runs for frontend/backend; backend ESLint includes Jest globals for `backend/test/*.test.js`.
IAM requirements (summary):

GitHub Actions role needs:
ECR push permissions for repo(s)
SSM SendCommand
SSM read results (GetCommandInvocation, ListCommandInvocations) on SSM resources in region/account
ECR tag policy:

If the ECR repo uses immutable tags, do not push a moving tag like latest.
Use git SHA tags for deploy and rollback.
Rollback:

Re-run deploy with a previous SHA tag that exists in ECR (manual) or trigger a workflow run for that commit/branch state.
On EC2, you can also manually run:
/opt/change-now/deploy-backend.sh <old-sha>