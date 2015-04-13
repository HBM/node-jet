#!/usr/bin/env sh
find ./lib ./bin ./examples ./test -name "*.js" | xargs node_modules/.bin/js-beautify -j -r -t --good-stuff
