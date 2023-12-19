FROM node:18

# Create app directory
WORKDIR /usr/src/app

ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG CKAN_URL
ARG NEXT_PUBLIC_CKAN_URL
ARG AZURE_AD_CLIENT_ID
ARG AZURE_AD_CLIENT_SECRET
ARG AZURE_AD_TENANT_ID
ARG RW_API_KEY

COPY . .

# You can setup env vars here or via `.env` file

RUN npm ci -f
RUN SKIP_ENV_VALIDATION=0 npm run build
EXPOSE 3000

# For staging/production please use `yarn start` command.
CMD [ "npm", "run", "start"]
