#
# Test configuration
#
TESTS = test/*.js
REPORTER = list

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
# Generate HTML test report
#
test-docs:
	make test REPORT
	REPORER=doc \
		| cat docs/head.html - docs/tail.html \
		> docs/test.html


#
# Run benchmark
#
benchmark:
	@@ node benchmark/console/index.js


.PHONY: test test-docs benchmark