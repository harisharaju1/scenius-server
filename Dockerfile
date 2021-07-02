FROM node:15

WORKDIR /usr/src/app

COPY package.json ./

RUN yarn

COPY . .

RUN yarn build
ENV PORT 4000
EXPOSE $PORT

CMD ["node","dist/index.js"]