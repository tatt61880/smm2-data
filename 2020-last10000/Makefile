all:
	perl main.pl
	node main.mjs
	node get-json.mjs
	node clear-check.mjs
	node ranking.mjs SMW 1000
	node ranking.mjs SMW 100
	node ranking.mjs NSMBU-Castle 1000
	node ranking.mjs NSMBU-Castle 100
	node ranking.mjs NSMBU 1000
	node ranking.mjs ALL 1000

temp:
	node ranking.mjs SMW 1000
	node ranking.mjs SMW 100

temp2:
	node ranking.mjs NSMBU 1000
	node ranking.mjs NSMBU 100

old:
	node ranking.mjs SM3DW 1000
	node ranking.mjs SM3DW 100

fetch:
	node get-jsons.mjs

test:
	perl ranking.pl SMW 1000
