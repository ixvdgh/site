FROM node:19-alpine

RUN apk add npm git

COPY . /tmp/app

RUN git clone https://git.faulty.nl/didier/site /app
WORKDIR /app
RUN npm install
RUN npm run compile

ENTRYPOINT ["node", "runner.js"]
