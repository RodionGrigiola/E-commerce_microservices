FROM node:22-alpine

RUN apk add --no-cache openssl libcrypto3

WORKDIR /app

COPY package*.json ./
COPY apps/cart-service/package.json ./apps/cart-service/
COPY packages/shared/package.json ./packages/shared/


RUN npm install

COPY apps/cart-service/prisma ./apps/cart-service/prisma/

RUN ./node_modules/.bin/prisma generate --schema=./apps/cart-service/prisma/schema.prisma

COPY . .

CMD ["npm", "run", "dev", "-w", "apps/cart-service"]
