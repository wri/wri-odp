FROM node:18

# Create app directory
WORKDIR /usr/src/app

ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG CKAN_URL
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_KEY_ID
ARG S3_BUCKET_NAME
ARG S3_BUCKET_REGION
ARG NEXT_PUBLIC_S3_ENDPOINT

COPY . .

# You can setup env vars here or via `.env` file

RUN npm ci -f
RUN npm run build
EXPOSE 3000

# For staging/production please use `yarn start` command.
CMD [ "npm", "run", "start"]
