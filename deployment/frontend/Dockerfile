FROM node:18

# Create app directory
WORKDIR /usr/src/app

ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG CKAN_URL

COPY . .

# You can setup env vars here or via `.env` file

RUN npm ci -f
RUN SKIP_ENV_VALIDATION=1 npm run build
EXPOSE 3000

# For staging/production please use `yarn start` command.
CMD [ "npm", "run", "start"]
