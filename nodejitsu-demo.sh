#!/usr/bin/env sh
node bin/jetdws.js &
sleep 2
node examples/todo-server.js
