#!/bin/sh

server_nw() {
  python3 -m http.server 8080 &
  SERVER_PID=$!
  trap "kill $SERVER_PID" EXIT
}

watch() {
  nodemon -e hbs,js,css -w src -x "npm run compile dev"
}

server_nw && watch
