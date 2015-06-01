
browserify:
	./node_modules/.bin/browserify ./lib/browser.js --standalone jet > ./build/jet.js
	./node_modules/.bin/uglifyjs ./build/jet.js -o ./build/jet.min.js


.PHONY: browserify
