#!/bin/bash
set -e

source deploy.env.sh

IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE_NAME:latest

git pull

docker build -t $IMAGE .
docker push $IMAGE

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --region $REGION \
  --min-instances 0 \
  --max-instances 2 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest
