FROM node:22-alpine

RUN apk add --no-cache openssl libcrypto3

WORKDIR /app

COPY package*.json ./
COPY apps/auth-service/package.json ./apps/auth-service/

RUN npm install

COPY apps/auth-service/prisma ./apps/auth-service/prisma/
RUN ./node_modules/.bin/prisma generate --schema=./apps/auth-service/prisma/schema.prisma

COPY . .

CMD ["npm", "run", "dev", "-w", "apps/auth-service"]
