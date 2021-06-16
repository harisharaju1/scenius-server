FROM node:15

WORKDIR /usr/src/app

COPY package.json ./

RUN yarn

COPY . .
COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8000
CMD ["node","dist/index.js"]
USER node