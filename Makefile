
browserify:
	./node_modules/.bin/browserify ./lib/browser.js --standalone jet > ./build/jet.js
	./node_modules/.bin/uglify -s ./build/jet.js -o ./build/jet.min.js


.PHONY: browserify
