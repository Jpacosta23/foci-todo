FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm ci

COPY . .

WORKDIR /app/apps/web

RUN npm run build

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]