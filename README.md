# Gaļas grozs

Magazin static pe GitHub Pages: https://www.galasgrozs.lv/.

Panou de administrare activ: https://galas-grozs-admin.galas-grozs.workers.dev/.

Panoul de administrare și instrucțiunile de instalare sunt în [admin/README.md](admin/README.md). `data/store.json` este sursa unică pentru catalog, contacte și textele paginilor. Fișierele publice se generează cu `npm run build`.

Pornire locală: `node admin/local.mjs`. Teste: `node --test tests/admin.test.mjs`, apoi `node tests/browser.mjs` cu serverul local pornit. Panoul local nu modifică site-ul public.
