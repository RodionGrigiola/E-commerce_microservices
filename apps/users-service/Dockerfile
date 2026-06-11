FROM node:20-alpine

RUN apk add --no-cache openssl libcrypto3

WORKDIR /app

COPY package*.json ./
COPY apps/users-service/package.json ./apps/users-service/

RUN npm install

COPY apps/users-service/prisma ./apps/users-service/prisma/

RUN ./node_modules/.bin/prisma generate --schema=./apps/users-service/prisma/schema.prisma

COPY . .

CMD ["npm", "run", "dev", "-w", "apps/users-service"]
