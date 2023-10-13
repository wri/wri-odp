FROM node:18

# Create app directory
WORKDIR /usr/src/app

ENV NEXTAUTH_SECRET "secret"
ENV NEXTAUTH_URL "http://localhost:3000" 
ENV CKAN_URL "https://demo.dev.datopian.com"

COPY . .

# You can setup env vars here or via `.env` file

RUN npm ci
RUN npm run build
EXPOSE 3000

# For staging/production please use `yarn start` command.
CMD [ "npm", "run", "start"]
