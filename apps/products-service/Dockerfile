FROM node:22-alpine

RUN apk add --no-cache openssl libcrypto3

WORKDIR /app

COPY package*.json ./
COPY apps/products-service/package.json ./apps/products-service/
COPY packages/shared/package.json ./packages/shared/


RUN npm install

COPY apps/products-service/prisma ./apps/products-service/prisma/

RUN ./node_modules/.bin/prisma generate --schema=./apps/products-service/prisma/schema.prisma

COPY . .

CMD ["npm", "run", "dev", "-w", "apps/products-service"]
