# Administrarea produselor

Produsele se editează din panoul în letonă, descris în [admin/README.md](admin/README.md). Instrucțiunea simplă a clientului este în [docs/klienta-instrukcija-lv.md](docs/klienta-instrukcija-lv.md).

Sursa unică pentru dezvoltare este `data/store.json`. Fișierele `data/products.js`, `data/site-config.js` și `data/page-content.js` sunt generate și nu se editează separat. După modificarea sursei rulați `node scripts/build-store.mjs` și testele.
