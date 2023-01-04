FROM node:19

RUN apt update
RUN apt install -y npm git openssh-client

RUN git clone https://git.faulty.nl/didier/site.git /app

WORKDIR /app

RUN npm install
RUN npm run compile

ENTRYPOINT ["node", "runner.js"]
