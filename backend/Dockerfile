FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN mkdir -p public/temp

EXPOSE 8000

CMD ["npm", "start"]