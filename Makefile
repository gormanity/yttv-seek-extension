.PHONY: all build typecheck test check pack clean watch

all: build

build:
	npm run build

typecheck:
	npm run typecheck

test:
	npm test

## typecheck + test — fast local check before committing
check: typecheck test

pack:
	npm run pack

clean:
	rm -rf dist

watch:
	npm run test:watch
