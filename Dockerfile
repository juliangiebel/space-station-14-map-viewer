FROM node:18-alpine as build

WORKDIR /app

ENV NODE_ENV production

COPY . .
RUN npm install vite
RUN npm install
RUN vite build

ENTRYPOINT ["vite", "preview"]
