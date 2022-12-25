FROM nginx:1.13.3-alpine

RUN apk add nodejs npm
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run compile
RUN cp -r dist/* /usr/share/nginx/html
