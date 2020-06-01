FROM node:11.8.0-alpine

RUN apk add git

ENV APP_DIR=/code
WORKDIR $APP_DIR

COPY package.json $APP_DIR
COPY yarn.lock $APP_DIR
RUN yarn install

ADD . $APP_DIR
RUN yarn run build

CMD ["yarn", "run", "start"]
