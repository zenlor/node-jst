#
# Test configuration
#
TESTS = \
	test/index.js \
	test/underscore_templates.js \
	test/minstache_templates.js \
	test/whiskers_templates.js
REPORTER = list
COMMIT = $(git rev-parse HEAD)

#
# Run tests
#
test:
	./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

test-watch:
	./node_modules/.bin/mocha \
		--watch
		--require should \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

#
# Run benchmark
#
benchmark:
	@@ node benchmark/console/index.js

#
# Docs
#
docs: clean-docs index.html test.html
	git checkout gh-pages
	mv docs/index.html index.html
	mv docs/test.html test.html
	git commit -am 'updating docs from $(COMMIT)'
	git push origin gh-pages
	git checkout master

test.html:
	make test \
	REPORTER=doc \
		| cat docs/head.html - docs/tail.html \
		> docs/test.html

index.html:
	cat Readme.md | \
		./node_modules/.bin/marked | \
		cat docs/head.html - docs/tail.html \
		> docs/index.html

clean-docs:
	rm -f docs/index.html docs/test.html

.PHONY: test benchmark clean-docs