# Administrarea produselor

Toate produsele, prețurile, categoriile și imaginile folosite de website sunt acum administrate dintr-un singur fișier:

`data/products.js`

Nu mai este nevoie să modifici separat `index.html`, `products.html` și coșul.

## Schimbarea prețului

Găsește produsul după `id` sau `name` și modifică valoarea:

```js
price: 8.5,
```

Scrie prețul fără simbolul euro. Website-ul adaugă automat `€` și unitatea produsului.

## Ascunderea sau reactivarea unui produs

Pentru a scoate temporar produsul din magazin:

```js
active: false,
```

Pentru a-l afișa din nou:

```js
active: true,
```

Un produs inactiv dispare automat din pagina Products, din homepage și din coșurile salvate.

## Marcarea unui produs ca indisponibil

Pentru ca produsul să rămână vizibil, dar să apară estompat cu marcajul „Unavailable”:

```js
available: false,
```

Butonul produsului va fi dezactivat, iar produsul nu va putea fi adăugat în coș. Dacă produsul se afla deja într-un coș salvat, va fi eliminat automat.

Pentru a permite din nou comenzile:

```js
available: true,
```

Dacă linia `available` lipsește, produsul este considerat disponibil.

## Afișarea unui produs pe homepage

```js
featured: true,
featuredOrder: 10,
```

Produsele cu `featured: true` apar în secțiunea „Most requested cuts”. Un număr mai mic la `featuredOrder` îl afișează mai devreme.

## Schimbarea ordinii produselor

În interiorul categoriei, ordinea este controlată de:

```js
order: 10,
```

Folosește valori precum `10`, `20`, `30`. Astfel poți introduce ulterior un produs între ele fără să renumerotezi tot catalogul.

## Schimbarea imaginii

Imaginile produselor se află în:

`assets/products/`

În produs, câmpul `image` trebuie să indice fișierul corect:

```js
image: "assets/products/pork-neck.png",
```

Poți păstra aceeași cale și înlocui doar fișierul imaginii.

## Adăugarea unui produs nou

1. Copiază un bloc complet de produs din aceeași categorie.
2. Schimbă `id` cu o valoare unică, scrisă cu litere mici și cratime.
3. Modifică `category`, `price`, `unit`, `image`, `name`, `description` și `meta`.
4. Adaugă imaginea în `assets/products/`.
5. Verifică produsul în browser înainte de commit și push.

Exemplu:

```js
{
  id: "new-pork-product",
  active: true,
  available: true,
  featured: false,
  order: 50,
  category: "pork",
  price: 9.5,
  priceSource: "client",
  unit: "kg",
  image: "assets/products/new-pork-product.png",
  name: { en: "New pork product" },
  description: {
    en: "Short product description."
  },
  meta: {
    en: "Cut: example · Best for: example"
  }
},
```

## Categoriile disponibile

- `pork`
- `beef`
- `chicken`
- `bbq`
- `boxes`

Categoriile sunt definite la începutul aceluiași fișier. Dacă o categorie este setată la `active: false`, nu mai apare în navigarea catalogului.

## Limbile letonă și rusă

Structura este deja pregătită pentru traduceri. Când vor fi adăugate, textele pot avea forma:

```js
name: {
  en: "Pork neck",
  lv: "Cūkgaļas kakla karbonāde",
  ru: "Свиная шея"
},
```

Până la introducerea traducerii, website-ul folosește automat textul în engleză.
