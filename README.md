# Airship Player Count Tracker Backend (airship.top)

## Overview

The backend is a NestJS app deployed on Google Cloud Run, using Neon as the serverless Postgres database and Cloud Scheduler jobs for player count fetching.

## Endpoints

| Endpoint                           | Description                            | Access         |
| ---------------------------------- | -------------------------------------- | -------------- |
| `GET /collect`                     | Fetches top games + platform stats     | Scheduler only |
| `GET /cleanup`                     | Deletes data older than 2 days         | Scheduler only |
| `GET /player-count/games`          | Returns current top games with history | Public         |
| `GET /player-count/platform-stats` | Returns latest online player count     | Public         |

## Scheduler Jobs

| Job                        | Schedule      | Endpoint   |
| -------------------------- | ------------- | ---------- |
| `<SERVICE_NAME>-collect`   | `* * * * *`   | `/collect` |
| `<SERVICE_NAME>-cleanup`   | `0 0 */2 * *` | `/cleanup` |


## Database (Neon)

The database is a serverless Postgres instance on [Neon](https://neon.tech).

- Connection string is stored in Secret Manager as `DATABASE_URL`
- Prisma connects via the `@prisma/adapter-neon` driver adapter (required by Prisma 7)
- Schema is managed with Prisma Migrate

```bash
DATABASE_URL="<neon-connection-string>" npx prisma migrate dev --name <migration-name>
```

## Secrets

`DATABASE_URL` is stored in Secret Manager and mounted at runtime via `--set-secrets`. The Cloud Run service account must have `roles/secretmanager.secretAccessor`:

```bash
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Redeploying

Copy `deploy.env.sh.example` to `deploy.env.sh` and fill in the GCP project values, then run the included deploy script from Cloud Shell:

```bash
cp deploy.env.sh.example deploy.env.sh
./deploy.sh
```

Or manually:

```bash
docker build -t <REGION>-docker.pkg.dev/<PROJECT_ID>/<REPO>/<SERVICE_NAME>:latest .
docker push <REGION>-docker.pkg.dev/<PROJECT_ID>/<REPO>/<SERVICE_NAME>:latest
gcloud run deploy <SERVICE_NAME> \
  --image <REGION>-docker.pkg.dev/<PROJECT_ID>/<REPO>/<SERVICE_NAME>:latest \
  --region <REGION> \
  --min-instances 0 \
  --max-instances 2 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest
```