FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./

ENV NODE_ENV=production

CMD ["sh", "-c", "npm run init-db && npm start"]
