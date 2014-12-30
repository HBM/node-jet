#!/usr/bin/env sh
./bin/jetdws.js &
sleep 2
./examples/todo-server.js
