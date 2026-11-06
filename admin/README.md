# Administrare Gaļas grozs

Magazinul rămâne pe GitHub Pages, la https://www.galasgrozs.lv/. Panoul se instalează separat pe Cloudflare Workers. Include produse, categorii, textele celor opt pagini, contacte și livrare în LV/EN/RU, ciorne persistente, previzualizare, publicare și 20 de versiuni restaurabile.

## Starea instalării

Panoul este activ la https://galas-grozs-admin.galas-grozs.workers.dev/ și conectat prin GitHub App numai la repository-ul acestui site. Au fost verificate în producție autentificarea, salvarea ciornei, publicarea pe GitHub Pages și restaurarea. Catalogul aprobat a fost restaurat integral după probă. Ghidul clientului se deschide și din secțiunea Palīdzība. Utilizatorul și parola inițială se predau separat; secretele nu sunt în Git. Testarea locală nu publică pe magazin. Instrucțiunile de instalare de mai jos sunt pentru recrearea ori mutarea instalării.

## Verificare locală

Node.js 22 sau mai nou și dependențele din `package.json`:

```powershell
npm install
npm run admin
npm test
npm run test:browser
npm run admin:check
```

Panoul local ascultă exclusiv la http://127.0.0.1:4174. Parola locală generată, datele și publicările de probă sunt în `outputs/admin-local/`, excluse din Git. Acest server nu apelează GitHub și nu schimbă sursele site-ului. Testul de browser folosește Microsoft Edge instalat; pe alt sistem configurați un canal Playwright disponibil.

## Instalarea online

Pașii sunt pentru dezvoltator, nu pentru client.

1. Creați contul Cloudflare, preferabil pe adresa clientului. Activați autentificarea în doi pași. Pentru adresa `workers.dev` a panoului nu trebuie mutate serverele DNS ale magazinului.
2. Publicați pe ramura GitHub Pages sursele acestei implementări, inclusiv `data/store.json`, JS-urile generate, `js/editable-content.js` și paginile HTML. Verificați că noul `data/store.json` este accesibil public înaintea primei conectări.
3. Pentru conectarea asistată rulați `node admin/connect-github.mjs`. Deschideți adresa locală afișată, verificați aplicația în GitHub și instalați-o prin **Only select repositories** numai pe repository-ul site-ului. Identificatorii și cheia PKCS#8 se salvează în `outputs/admin-secrets/`, fără afișarea secretelor în browser. Alternativ creați manual o GitHub App cu **Contents: Read and write**, webhook dezactivat; cheia se convertește cu `node admin/convert-key.mjs calea-catre-cheie.pem`.
4. Verificați repository-ul, ramura, adresa publică și `ADMIN_USER` în `admin/wrangler.jsonc`. După transferul repository-ului către client, actualizați proprietarul și instalarea App.
5. Rulați `npx wrangler login`. Apoi, într-un terminal interactiv, `node admin/password.mjs`; alegeți o parolă inițială de minimum 16 caractere. Scriptul salvează numai hash-ul în `outputs/admin-secrets/password-hash.txt`.
6. Configurați secretele cu `npx wrangler secret put NUME --config admin/wrangler.jsonc`: `ADMIN_PASSWORD_HASH`, `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`. Folosiți intrarea standard din fișierele ignorate; nu introduceți secrete în conversații, documente sau Git. Alternativ există `GITHUB_TOKEN`, exclusiv pe server, cu **Contents: Read and write** numai pentru repository; expirarea lui întrerupe publicarea. Tokenul are prioritate dacă sunt configurate ambele variante.
7. Rulați `npm run admin:check`, apoi `npm run admin:deploy`. Nu activați un plan cu plată fără acord. SQLite Durable Objects sunt disponibile în planul gratuit în limitele Cloudflare; verificați oferta actuală. La atingerea limitelor, operațiile se pot opri.
8. Deschideți adresa HTTPS afișată de Wrangler. Probați salvarea, previzualizarea, o publicare controlată și restaurarea. Așteptați confirmarea că datele au ajuns pe site, apoi readuceți conținutul aprobat.
9. Clientul își schimbă parola din **Palīdzība → Mainīt paroli**. Predați accesul și ghidul simplu în letonă. Domeniul, Cloudflare, GitHub și Google Search Console trebuie transferate sau partajate separat; panoul nu transferă conturile.

## Date și publicare

`data/store.json` este sursa unică. `npm run build` validează și generează cele trei fișiere JS și textele HTML. Nu editați separat fișierele generate. Traducerile vechi nu suprascriu catalogul cu `schemaVersion: 3`.

Worker-ul folosește un Durable Object cu SQLite. Documentele mari sunt împărțite în fragmente sub limita de 128 KiB per valoare. Se păstrează 20 de versiuni. Fotografiile sunt redimensionate în browser, verificate pe server și comise împreună cu datele. Publicarea creează un singur commit cu toate fișierele și actualizează ramura fără force-push.

Dacă ramura s-a schimbat în afara panoului, publicarea se oprește. Descărcați ciorna din Versijas înainte de reîncărcarea datelor și reaplicați modificările. Panoul nu suprascrie automat munca altui editor.

După commit, panoul verifică fișierul public `data/store.json`. Trimiterea commitului nu confirmă deploy-ul. Dacă GitHub Pages eșuează, investigați deploy-ul în GitHub; datele comise și ciorna rămân disponibile.

## Acces și recuperare

Parola este derivată PBKDF2 SHA-256 cu salt aleator și 100.000 iterații, în limita Web Crypto Workers. Folosiți o expresie lungă și unică. Cookie-ul HTTPS este HttpOnly, Secure și SameSite=Strict, cu expirare după 8 ore. Operațiile cer aceeași origine. Autentificarea limitează încercările. Secretele GitHub nu ajung în browser. Panoul și previzualizarea nu sunt indexabile.

Schimbarea parolei invalidează sesiunile. Pentru recuperare, generați și instalați un hash nou în `ADMIN_PASSWORD_HASH`; această rotație înlocuiește și parola aleasă ulterior în panou și invalidează sesiunile vechi. Puteți revoca sesiunile și prin schimbarea secretului opțional `SESSION_VERSION`.

Nu expuneți `outputs/`, `.dev.vars`, fișiere PEM sau directoare interne printr-un server public. `admin/public/` este singurul director de asset-uri al Worker-ului.

## Limite

- Comenzile se trimit pe WhatsApp de către cumpărător. Panoul nu are listă de comenzi, facturi, încasări sau stoc numeric.
- Promoțiile se activează și se dezactivează manual.
- Se editează textele existente ale paginilor și rețetelor. Secțiuni noi, rețete noi, fotografii de rețete și schimbarea designului sunt lucrări de dezvoltare.
- DNS-ul domeniului fără `www`, indexarea Google și proprietarii conturilor se configurează separat.
- Publicarea reală și accesul clientului trebuie probate după conectarea contului Cloudflare.

Documentație oficială: [Worker assets](https://developers.cloudflare.com/workers/static-assets/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), [GitHub App tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app).
