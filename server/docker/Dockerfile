FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY drizzle.config.js ./
COPY src ./src
COPY drizzle ./drizzle

RUN npm run build

EXPOSE 8000

CMD ["sh", "-c", "npm run db:migrate && npm run start"]
