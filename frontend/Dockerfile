FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY next.config.mjs ./
COPY tailwind.config.js ./
COPY postcss.config.mjs ./
COPY src ./src

RUN mkdir -p /app/public

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
