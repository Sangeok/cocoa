FROM node:22.13.0-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22.13.0-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/config ./config
COPY package*.json ./
COPY drizzle.config.ts ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]