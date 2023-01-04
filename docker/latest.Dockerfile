FROM debian:latest

# setup ssh
COPY docker/deploykeys/id_rsa docker/deploykeys/id_rsa.pub /root/.ssh/
RUN chmod 600 /root/.ssh/id_rsa
RUN echo "StrictHostKeyChecking no" >> /etc/ssh/ssh_config
# I'll save you the hastle, this key is only used for cloning the repo, it's not used for anything else.

RUN apt update
RUN apt install -y git
RUN apt install -y npm nodejs

RUN git clone git@git.faulty.nl:didier/site /app

WORKDIR /app

RUN npm install
RUN npm run compile

ENTRYPOINT ["node", "runner.js"]
