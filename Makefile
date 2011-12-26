#
# Run command line tests
#
test:
	@@ node test/index.js

#
# Run benchmark
#
benchmark:
	@@ node benchmark/console/index.js


.PHONY: test benchmark