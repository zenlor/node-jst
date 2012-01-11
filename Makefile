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
# Run benchmark
#
benchmark:
	@@ node benchmark/console/index.js

#
# Docs
#
docs: clean-docs index.html test.html
	@git add -A
	@git stash
	@git checkout gh-pages

	@git add -A
	@git stash pop
	@git commit -am 'updating docs'
	@git push origin gh-pages
	@git checkout master

test.html:
	make test \
	REPORTER=doc \
		| cat docs/head.html - docs/tail.html \
		> test.html

index.html:
	@cat Readme.md | ./node_modules/.bin/marked > out.html
	@cat docs/head.html && cat out.html && cat docs/tail.html > index.html

clean-docs:
	@rm -f index.html test.html

.PHONY: test benchmark clean-docs