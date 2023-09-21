FROM node:18-alpine as build

WORKDIR /app

ENV NODE_ENV production

COPY . .
RUN npm install vite
RUN npm install
RUN npm run build

ENTRYPOINT ["npm", "run", "preview"]
