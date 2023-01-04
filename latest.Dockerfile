FROM debian:latest

RUN apt update
RUN apt install -y git
RUN apt install -y npm nodejs

RUN git clone https://git.faulty.nl/didier/site.git /app

WORKDIR /app

RUN npm install
RUN npm run compile

ENTRYPOINT ["node", "runner.js"]
