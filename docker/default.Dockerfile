FROM node:19-alpine

RUN apk add npm git openssh-client

COPY .. /app

WORKDIR /app
RUN git remote set-url origin https://git.faulty.nl/didier/site.git
RUN npm install
RUN npm run compile

ENTRYPOINT ["node", "runner.js"]
