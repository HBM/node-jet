#!/usr/bin/env sh
find lib/ -name "*.js" | xargs node_modules/.bin/js-beautify -j -r --good-stuff