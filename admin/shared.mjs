import { businessText } from "../js/editable-content.js";
export const LANGUAGES = ["lv", "en", "ru"];
export const PAGE_FILES = ["index.html", "products.html", "how-to-order.html", "recipes.html", "about.html", "contact.html", "faq.html", "quality.html"];
export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const fail = (message) => { throw new AppError(message); };
const string = (value, max = 2000) => typeof value === "string" && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
const id = (value) => typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
const number = (value, min = 0, max = 10000) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const localized = (value, required = false, max = 2000) => value && typeof value === "object" && LANGUAGES.every((lang) => string(value[lang], max) && (!required || value[lang].trim()));
export const safeImagePath = (path) => typeof path === "string" && /^assets\/products\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)$/.test(path);
export function validateStore(input) {
  if (JSON.stringify(input).length > 250000) fail("Pārāk daudz datu. Sazinieties ar vietnes uzturētāju.");
  const store = structuredClone(input);
  if (store?.schemaVersion !== 1 || store.catalog?.schemaVersion !== 3 || store.catalog.defaultLanguage !== "lv") fail("Nepareizs datu formāts.");
  const { categories, products } = store.catalog;
  if (!Array.isArray(categories) || !categories.length || categories.length > 30 || !Array.isArray(products) || products.length > 300) fail("Pārbaudiet kategoriju un produktu skaitu.");
  const categoryIds = new Set();
  for (const cat of categories) {
    if (!id(cat.id) || categoryIds.has(cat.id)) fail("Kategorijas identifikators nav derīgs vai atkārtojas.");
    categoryIds.add(cat.id);
    if (typeof cat.active !== "boolean" || !number(cat.order) || !localized(cat.label, true, 100) || !localized(cat.title, true, 200) || !localized(cat.description)) fail("Aizpildiet kategorijas tekstus visās trīs valodās.");
  }
  const productIds = new Set();
  for (const p of products) {
    const name = p.name?.lv || "Jauns produkts";
    if (!id(p.id) || productIds.has(p.id) || !categoryIds.has(p.category)) fail(`${name}: pārbaudiet kategoriju un identifikatoru.`);
    productIds.add(p.id);
    if (!["kg", "box", "piece"].includes(p.unit) || !number(p.price, 0, 10000) || (!p.hidePrice && p.price <= 0)) fail(`${name}: cenai jābūt lielākai par nulli.`);
    if (!safeImagePath(p.image)) fail(`${name}: pievienojiet JPG, PNG vai WebP fotogrāfiju.`);
    if (!localized(p.name, true, 200) || !localized(p.description, true) || !localized(p.meta) || (p.featuredDescription && !localized(p.featuredDescription))) fail(`${name}: aizpildiet nosaukumu un aprakstu visās trīs valodās.`);
    for (const field of ["active", "available", "featured", "promotion", "hidePrice"]) if (typeof p[field] !== "boolean") fail(`${name}: nederīgs statuss.`);
    if (!number(p.order) || !number(p.featuredOrder)) fail(`${name}: nederīga secība.`);
    if (p.promotion && (p.hidePrice || !number(p.salePrice, 0.01, 10000) || p.salePrice >= p.price)) fail(`${name}: akcijas cenai jābūt zemākai par parasto cenu.`);
    if (p.variants) {
      if (!Array.isArray(p.variants) || p.variants.length > 10) fail(`${name}: nederīgi iepakojumi.`);
      const variantIds = new Set();
      for (const v of p.variants) {
        if (!id(v.id) || variantIds.has(v.id) || !localized(v.label, true, 100) || !number(v.multiplier, 0.01, 100)) fail(`${name}: pārbaudiet iepakojumu svaru un nosaukumu.`);
        variantIds.add(v.id);
      }
    }
  }
  const s = store.site;
  if (!s || !string(s.phone, 40) || !/^\+?[0-9 ()-]{7,30}$/.test(s.phone) || !/^\d{8,15}$/.test(s.whatsappNumber) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s.email) || !string(s.email, 150)) fail("Pārbaudiet tālruni, WhatsApp numuru un e-pastu.");
  for (const key of ["instagramUrl", "facebookUrl"]) {
    if (!string(s[key], 500)) fail("Sociālā tīkla saite ir pārāk gara.");
    if (s[key]) { try { const u = new URL(s[key]); if (u.protocol !== "https:" || u.username || u.password) fail("Izmantojiet drošu https sociālā tīkla saiti."); } catch { fail("Pārbaudiet sociālā tīkla saiti."); } }
  }
  for (const key of ["orderDays", "deliveryDays", "pickupLocation"]) if (!localized(s[key], true, 500)) fail("Aizpildiet saņemšanas un piegādes informāciju visās valodās.");
  if (!number(s.freeDeliveryThreshold) || s.cardPaymentsEnabled !== false) fail("Pārbaudiet bezmaksas piegādes slieksni. Kartes maksājumi nav pieslēgti.");
  if (!Array.isArray(store.pages) || store.pages.length !== PAGE_FILES.length) fail("Trūkst lapu tekstu.");
  const pages = new Set();
  for (const page of store.pages) {
    if (!PAGE_FILES.includes(page.file) || pages.has(page.file) || !Array.isArray(page.fields) || page.fields.length > 200) fail("Nederīga lapa.");
    pages.add(page.file);
    const fields = new Set();
    for (const f of page.fields) {
      if (!id(f.id) || fields.has(f.id) || !string(f.label, 200) || !localized(f.text, true, 5000)) fail("Aizpildiet lapas tekstu visās valodās.");
      if (f.business && !["orderDays", "deliveryInfo", "pickupPayment", "confirmationInfo", "orderInfo"].includes(f.business)) fail("Nederīga piegādes informācija.");
      fields.add(f.id);
    }
  }
  return store;
}
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const jsData = (value) => JSON.stringify(value, null, 2).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
export function generatedFiles(store) {
  validateStore(store);
  return {
    "data/store.json": JSON.stringify(store, null, 2) + "\n",
    "data/products.js": `// Generated from data/store.json. Edit in the administration panel.\nwindow.GALAS_GROZS_CATALOG = ${jsData(store.catalog)};\n`,
    "data/site-config.js": `// Generated from data/store.json.\nwindow.GALAS_GROZS_SITE = ${jsData(store.site)};\n`,
    "data/page-content.js": `// Generated from data/store.json.\nwindow.GALAS_GROZS_PAGE_CONTENT = ${jsData(store.pages)};\n`
  };
}
export function renderPage(html, page, site, revision) {
  for (let field of page.fields) {
    if (field.business) field = { ...field, text: { ...field.text, lv: businessText(field.business, site, "lv") } };
    if (field.id === "seo-title") html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(field.text.lv)}</title>`);
    else if (field.id === "seo-description") html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?\s*>)/, (_, a, b) => a + escapeHtml(field.text.lv) + b);
    else {
      const re = new RegExp(`(<([a-z0-9]+)\\b[^>]*data-content-id="${field.id}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`, "g");
      html = html.replace(re, (_, start, tag, end) => start + escapeHtml(field.text.lv) + end);
    }
  }
  html = html.replace(/href="tel:[^"]*"/g, () => `href="tel:${escapeHtml(site.phone.replace(/[^+\d]/g, ""))}"`);
  html = html.replace(/https:\/\/wa.me\/\d+/g, () => `https://wa.me/${site.whatsappNumber}`);
  html = html.replace(/href="mailto:[^"]*"/g, () => `href="mailto:${escapeHtml(site.email)}"`);
  html = html.replace(/(<a\b[^>]*href="(?:tel:[^"]+|https:\/\/wa.me\/\d+)[^>]*>)([^<]*)(<\/a>)/g, (whole, start, text, end) => /^[+\d\s()-]+$/.test(text.trim()) && /\d{7}/.test(text.replace(/\D/g, "")) ? start + escapeHtml(site.phone) + end : whole);
  html = html.replace(/(<a\b[^>]*href="mailto:[^"]+"[^>]*>)[^<]*(<\/a>)/g, (_, start, end) => start + escapeHtml(site.email) + end);
  // Render contact details and social links in structured data, too.
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (_, start, raw, end) => {
    const data = JSON.parse(raw);
    function visit(value) {
      if (!value || typeof value !== "object") return;
      if (value["@type"] === "Organization") { value.email = site.email; value.telephone = site.phone; value.sameAs = [site.instagramUrl, site.facebookUrl].filter(Boolean); value.address = { "@type": "PostalAddress", "streetAddress": site.pickupLocation.lv, "addressCountry": "LV" }; }
      Object.values(value).forEach(visit);
    }
    visit(data);
    return start + "\n" + jsData(data) + "\n" + end;
  });
  return html.replace(/((?:data\/(?:products|site-config|page-content|i18n|i18n-ru.generated|i18n-ru-review)|js\/main)\.js)(?:\?v=[^"\s]+)?/g, (_, path) => `${path}?v=${revision}`);
}
export function changesBetween(before, after) {
  const changes = [];
  for (const p of after.catalog.products) {
    const previous = before.catalog.products.find((v) => v.id === p.id);
    if (JSON.stringify(previous) !== JSON.stringify(p)) changes.push(`${previous ? "Mainīts" : "Pievienots"} produkts: ${p.name.lv}`);
  }
  if (JSON.stringify(before.catalog.categories) !== JSON.stringify(after.catalog.categories)) changes.push("Mainītas kategorijas");
  if (JSON.stringify(before.site) !== JSON.stringify(after.site)) changes.push("Mainīti kontakti vai piegādes noteikumi");
  for (const page of after.pages) if (JSON.stringify(before.pages.find((p) => p.file === page.file)) !== JSON.stringify(page)) changes.push(`Mainīti lapas teksti: ${page.title}`);
  return changes;
}
export function assertImage(bytes, type) {
  if (bytes.length > 900000 || bytes.length < 20) fail("Fotogrāfija ir par lielu vai bojāta (ne vairāk kā 900 KB pēc apstrādes).");
  const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const isPng = [137,80,78,71,13,10,26,10].every((v, i) => bytes[i] === v);
  const isWebp = new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (!(type === "image/jpeg" && isJpeg || type === "image/png" && isPng || type === "image/webp" && isWebp)) fail("Atļauti tikai JPG, PNG un WebP attēli.");
  return type === "image/jpeg" ? "jpg" : type.split("/")[1];
}
