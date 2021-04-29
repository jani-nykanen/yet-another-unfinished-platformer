
.PHONY: js
js:
	mkdir -p output
	mkdir -p output/js
	tsc src/core/*.ts src/*.ts --module es2020 --lib es2020,dom --target es2020 --outDir output/js

.PHONY: core
core:
	mkdir -p output
	mkdir -p output/js
	mkdir -p output/js/core
	tsc src/core/*.ts --module es2020 --lib es2020,dom --target es2020 --outDir output/js/core

.PHONY:
game:
	mkdir -p output
	mkdir -p output/js
	tsc src/*.ts --module es2020 --lib es2020,dom --target es2020 --outDir output/js


server:
	(cd output; python3 -m http.server)

linecount:
	(cd src; find . -name '*.ts' | xargs wc -l)

artstuff:
	./dev/imagegen.sh
