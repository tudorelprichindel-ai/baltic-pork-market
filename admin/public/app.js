"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const e = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = (value) => structuredClone(value);
const date = (value) => new Date(value).toLocaleString("lv-LV", { dateStyle: "medium", timeStyle: "short" });
const money = (value) => Number(value).toLocaleString("lv-LV", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const decimal = (value) => Number(String(value).replace(",", "."));
let state, dirty = false, busy = false, editGeneration = 0, view = "products", language = "lv", edit, editDirty = false, uploading = false, statusTimer, reopenEditor;
let productSearch = "", categoryFilter = "", statusFilter = "", selectedPage = "index.html";
function toast(message, error = false) { const node = document.createElement("div"); node.className = `toast${error ? " error" : ""}`; node.textContent = message; $("#notifications").append(node); setTimeout(() => node.remove(), error ? 12000 : 5500); }
async function api(path, options = {}) {
  let response;
  try { response = await fetch(`/api/${path}`, { ...options, headers: options.raw ? { "Content-Type": options.type } : { "Content-Type": "application/json" }, body: options.body === undefined ? undefined : options.raw ? options.body : JSON.stringify(options.body) }); }
  catch { throw new Error("Nav savienojuma. Izmaiņas paliek šajā logā. Atjaunojiet internetu un mēģiniet vēlreiz."); }
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== "login") {
      if ($("#editor").open) { reopenEditor = { product: !!$("#product-form"), value: clone(edit), dirty: editDirty }; $("#editor").close(); }
      if ($("#confirm").open) { $$('#confirm input[type="password"]').forEach((input) => { input.value = ""; }); $("#confirm").close(); }
      $("#login").hidden = false; $("#app").hidden = true; $("#login-error").textContent = "Sesija beigusies. Pieslēdzieties; jūsu izmaiņas šajā logā tiks paturētas.";
    }
    const error = new Error(data.error || "Darbību neizdevās pabeigt."); error.status = response.status; throw error;
  }
  return data;
}
function markDirty() { editGeneration++; dirty = true; updateBar(); }
function updateBar() {
  if (!state) return;
  $("#save-status").textContent = dirty ? "Ir nesaglabātas izmaiņas. Saglabājiet melnrakstu." : `Melnraksts saglabāts: ${date(state.updatedAt)}`;
  $("#change-count").textContent = dirty ? "Nesaglabātas izmaiņas" : state.changes.length ? `${state.changes.length} izmaiņas gaida publicēšanu` : "Viss saglabāts";
  $("#save").disabled = busy || !dirty;
  $("#publish").disabled = busy || (!dirty && !state.changes.length);
  $("#preview").disabled = busy;
}
function acceptState(next) { state = next; dirty = false; updateBar(); }
async function save() {
  if (!dirty) return true;
  if (busy) return false;
  const generation = editGeneration;
  const snapshot = clone(state.store);
  busy = true; updateBar();
  try {
    const saved = await api("draft", { method: "POST", body: { store: snapshot, revision: state.revision } });
    // Keep the live object: form handlers still reference it while saving.
    state = { ...saved, store: state.store }; dirty = editGeneration !== generation;
    toast(dirty ? "Iepriekšējās izmaiņas saglabātas. Saglabājiet arī jaunās izmaiņas." : "Melnraksts saglabāts. Vietnē vēl nekas nav mainījies.");
    return !dirty;
  }
  catch (error) { toast(error.message, true); return false; }
  finally { busy = false; updateBar(); }
}
async function boot(preserve = false) {
  await api("session");
  if (!preserve || !state) acceptState(await api("state"));
  $("#login").hidden = true; $("#app").hidden = false;
  $("#local-banner").hidden = !state.local;
  $("#public-site").href = state.publicUrl;
  changeView(); updateBar(); checkStatus();
  if (reopenEditor) { const saved = reopenEditor; reopenEditor = null; edit = saved.value; editDirty = saved.dirty; if (saved.product) renderProductEditor(); else renderCategoryEditor(); $("#editor").showModal(); }
}
$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const form = event.currentTarget; const button = $("button[type=submit]", form); button.disabled = true; $("#login-error").textContent = "";
  try { await api("login", { method: "POST", body: Object.fromEntries(new FormData(form)) }); form.password.value = ""; await boot(!!state); }
  catch (error) { $("#login-error").textContent = error.message; }
  finally { button.disabled = false; }
});
$("#show-password").addEventListener("click", (event) => { const input = $('[name="password"]'); const show = input.type === "password"; input.type = show ? "text" : "password"; event.currentTarget.textContent = show ? "Slēpt" : "Rādīt"; event.currentTarget.setAttribute("aria-pressed", show); });
$("#save").addEventListener("click", save);
$("#preview").addEventListener("click", async () => { if (!await save()) return; window.open(`/preview/${view === "pages" ? selectedPage : "products.html"}`, "_blank", "noopener"); });
$("#publish").addEventListener("click", async () => {
  if (!await save()) return;
  confirmDialog("Pārskatiet izmaiņas", `<p>Šīs izmaiņas būs redzamas vietnes apmeklētājiem pēc publicēšanas.</p><ul>${state.changes.map((c) => `<li>${e(c)}</li>`).join("")}</ul><p class="inline-hint">${state.local ? "Šis ir izmēģinājums datorā. Publiskā vietne netiks mainīta." : "Pēc publicēšanas vietnes atjaunošana var aizņemt dažas minūtes. Panelis pārbaudīs, kad izmaiņas ir redzamas."}</p>`, state.local ? "Pārbaudīt publicēšanu" : "Publicēt vietnē", async () => {
    acceptState(await api("publish", { method: "POST", body: { revision: state.revision } }));
    render(); checkStatus(); toast(state.local ? "Publicēšanas izmēģinājums pabeigts datorā." : "Izmaiņas nosūtītas publicēšanai. Gaida vietnes atjaunošanu.");
  });
});
$("#logout").addEventListener("click", () => confirmDialog("Iziet no paneļa?", `<p>${dirty ? "Jums ir nesaglabātas izmaiņas. Vispirms saglabājiet melnrakstu, ja vēlaties tās paturēt." : "Saglabātais melnraksts paliks pieejams nākamajā pieslēgšanās reizē."}</p>`, "Iziet", async () => { await api("logout", { method: "POST", body: {} }); dirty = false; state = null; location.reload(); }));
$("#mobile-logout").onclick = () => $("#logout").click();
window.addEventListener("beforeunload", (event) => { if (dirty || editDirty || uploading) { event.preventDefault(); event.returnValue = ""; } });
window.addEventListener("hashchange", changeView);
function changeView() { if (!state) return; const next = location.hash.slice(1); view = ["products", "categories", "pages", "settings", "history", "help"].includes(next) ? next : "products"; $$('[data-view]').forEach((a) => a.classList.toggle("active", a.dataset.view === view)); render(); }
function heading(title, text, action = "") { return `<div class="section-head"><div><h1>${title}</h1><p>${text}</p></div>${action}</div>`; }
function tabs() { return `<div class="tabs" role="group" aria-label="Teksta valoda">${["lv", "en", "ru"].map((lang) => `<button type="button" class="${lang === language ? "active" : "secondary"}" data-lang="${lang}" aria-pressed="${lang === language}">${{lv:"Latviski",en:"English",ru:"Русский"}[lang]}</button>`).join("")}</div>`; }
function bindTabs(container, rerender) { $$('[data-lang]', container).forEach((b) => b.addEventListener("click", () => { language = b.dataset.lang; rerender(); })); }
function render() { ({ products: renderProducts, categories: renderCategories, pages: renderPages, settings: renderSettings, history: renderHistory, help: renderHelp })[view](); if (view === "help") renderPasswordHelp(); }
const statusOf = (p) => !p.active ? "hidden" : !p.available ? "unavailable" : "available";
const statuses = { available: "Pieejams", unavailable: "Uz laiku nav", hidden: "Paslēpts" };
const imageUrl = (path) => `/api/image/${encodeURIComponent(path.split("/").pop())}`;
function renderProducts() {
  const { products, categories } = state.store.catalog;
  const filtered = products.filter((p) => (!productSearch || `${p.name.lv} ${p.name.en} ${p.name.ru}`.toLowerCase().includes(productSearch.toLowerCase())) && (!categoryFilter || p.category === categoryFilter) && (!statusFilter || statusOf(p) === statusFilter)).sort((a,b) => (categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category)) || a.order - b.order);
  $("#main").innerHTML = heading("Produkti", "Mainiet cenas, fotogrāfijas un pieejamību. Izmaiņas vispirms saglabājiet kā melnrakstu.", '<button id="new-product" class="primary">+ Pievienot produktu</button>') +
    `<div class="summary-grid"><div><strong>${products.filter((p) => p.active && p.available).length}</strong><span>PIEEJAMI PRODUKTI</span></div><div><strong>${products.filter((p) => p.active && !p.available).length}</strong><span>UZ LAIKU NAV</span></div><div><strong>${products.filter((p) => !p.active).length}</strong><span>PASLĒPTI</span></div></div><div class="filters"><input id="search" type="search" placeholder="Meklēt pēc produkta nosaukuma…" aria-label="Meklēt produktus" value="${e(productSearch)}"><select id="category-filter" aria-label="Kategorija"><option value="">Visas kategorijas</option>${categories.map((c) => `<option value="${e(c.id)}" ${c.id === categoryFilter ? "selected" : ""}>${e(c.label.lv)}</option>`).join("")}</select><select id="status-filter" aria-label="Pieejamība"><option value="">Visi statusi</option>${Object.entries(statuses).map(([k,v]) => `<option value="${k}" ${k === statusFilter ? "selected" : ""}>${v}</option>`).join("")}</select></div><div class="product-list">${filtered.length ? filtered.map((p) => `<article class="product-row"><img src="${imageUrl(p.image)}" alt="" loading="lazy"><div><h3>${e(p.name.lv)}</h3><p class="small">${e(categories.find((c) => c.id === p.category)?.label.lv)}${p.featured ? " · Sākumlapā" : ""}</p></div><div class="price">${p.hidePrice ? "Pēc vienošanās" : p.promotion ? `${money(p.salePrice)}<del>${money(p.price)}</del>` : money(p.price)}${p.hidePrice ? "" : `<span class="small"> / ${p.unit === "box" ? "kompl." : p.unit === "piece" ? "gab." : "kg"}</span>`}</div><div class="badges"><span class="badge ${statusOf(p)}">${statuses[statusOf(p)]}</span>${p.promotion ? '<br><span class="badge promo">Akcija</span>' : ""}</div><button class="secondary" data-edit-product="${p.id}" aria-label="Rediģēt ${e(p.name.lv)}">Rediģēt</button></article>`).join("") : '<div class="empty">Nav atrasts neviens produkts. Mainiet meklēšanas vārdus vai filtrus.</div>'}</div>`;
  $("#new-product").onclick = () => openProduct();
  $("#search").oninput = (event) => { const pos = event.target.selectionStart; productSearch = event.target.value; renderProducts(); $("#search").focus(); $("#search").setSelectionRange(pos,pos); };
  $("#category-filter").onchange = (event) => { categoryFilter = event.target.value; renderProducts(); };
  $("#status-filter").onchange = (event) => { statusFilter = event.target.value; renderProducts(); };
  $$('[data-edit-product]').forEach((b) => b.onclick = () => openProduct(b.dataset.editProduct));
}
function localizedFields(object, fields) { return fields.map(([key, label, multiline]) => `<label>${label} <span class="small">(${language.toUpperCase()})</span>${multiline ? `<textarea data-localized="${key}" rows="3" maxlength="2000">${e(object[key]?.[language])}</textarea>` : `<input data-localized="${key}" maxlength="200" value="${e(object[key]?.[language])}">`}</label>`).join(""); }
function bindLocalized(root) { $$('[data-localized]', root).forEach((input) => input.oninput = () => { edit[input.dataset.localized] ||= { lv:"", en:"", ru:"" }; edit[input.dataset.localized][language] = input.value; editDirty = true; }); }
function openProduct(id) {
  edit = id ? clone(state.store.catalog.products.find((p) => p.id === id)) : { id: `product-${crypto.randomUUID().slice(0,12)}`, category: state.store.catalog.categories.find((c) => c.active)?.id, name: {lv:"",en:"",ru:""}, description: {lv:"",en:"",ru:""}, meta: {lv:"",en:"",ru:""}, active: false, available: true, featured: false, promotion: false, hidePrice: false, price: 0, unit: "kg", image: "", order: 10, featuredOrder: 10, priceSource: "client" };
  editDirty = false; language = "lv"; renderProductEditor(); $("#editor").showModal();
}
function renderProductEditor() {
  const dialog = $("#editor"); const categories = state.store.catalog.categories;
  dialog.innerHTML = `<form id="product-form"><header class="dialog-head"><div><span class="eyebrow">PRODUKTA REDIĢĒŠANA</span><h2 id="editor-title">${e(edit.name.lv || "Jauns produkts")}</h2></div><button type="button" class="quiet close-editor" aria-label="Aizvērt">✕</button></header><div class="dialog-body">${tabs()}${localizedFields(edit, [["name","Produkta nosaukums"],["description","Apraksts",true],["meta","Papildu informācija (nav obligāta)",true]])}${edit.featuredDescription ? localizedFields(edit, [["featuredDescription","Īsais apraksts sākumlapā",true]]) : ""}<p class="small">Aizpildiet nosaukumu un aprakstu visās trīs valodās. Tulkojumi netiek izdomāti automātiski.</p><div class="form-section"><h3>Fotogrāfija</h3><div class="image-editor"><img id="product-image" ${edit.image ? `src="${imageUrl(edit.image)}"` : ""} alt="Produkta priekšskatījums"><label>Izvēlēties jaunu fotogrāfiju<input id="photo" type="file" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG vai WebP. Līdz 20 MB. Panelis automātiski samazinās attēlu.</small></label></div><p id="upload-status" class="small" aria-live="polite"></p></div><div class="form-section"><h3>Cena un pieejamība</h3><div class="grid-2"><label>Kategorija<select data-prop="category">${categories.map((c) => `<option value="${e(c.id)}" ${c.id === edit.category ? "selected" : ""}>${e(c.label.lv)}${c.active ? "" : " (paslēpta)"}</option>`).join("")}</select></label><label>Produkta statuss<select id="product-status">${Object.entries(statuses).map(([k,v]) => `<option value="${k}" ${k === statusOf(edit) ? "selected" : ""}>${v}</option>`).join("")}</select><small>“Uz laiku nav” — produkts paliek redzams, bet to nevar pasūtīt. “Paslēpts” — nav redzams vietnē.</small></label></div><div class="grid-2"><label>Parastā cena (€)<input data-prop="price" data-number inputmode="decimal" value="${e(edit.price)}" required></label><label>Cena par<select data-prop="unit"><option value="kg" ${edit.unit === "kg" ? "selected" : ""}>1 kilogramu</option><option value="box" ${edit.unit === "box" ? "selected" : ""}>1 komplektu</option><option value="piece" ${edit.unit === "piece" ? "selected" : ""}>1 gabalu</option></select></label></div><label class="check"><input type="checkbox" data-prop="hidePrice" ${edit.hidePrice ? "checked" : ""}> Cena pēc vienošanās (nerādīt cenu)</label><label class="check"><input id="promotion" type="checkbox" data-prop="promotion" ${edit.promotion ? "checked" : ""}> Rādīt akcijas cenu</label><label id="sale-price-label" ${edit.promotion ? "" : "hidden"}>Akcijas cena (€)<input data-prop="salePrice" data-number inputmode="decimal" value="${e(edit.salePrice ?? "")}"><small>Jābūt zemākai par parasto cenu. Pēc akcijas beigām noņemiet atzīmi.</small></label></div><div class="form-section"><h3>Iepakojumi / svars</h3><p class="small">Atstājiet tukšu, ja pircējs pasūta pa 1 kg, 1 gabalam vai 1 komplektam. Piemēram: 500 g = 0,5 no kilograma cenas.</p><div id="variants">${(edit.variants || []).map((v,i) => `<div class="variant"><label>Nosaukums (${language.toUpperCase()})<input data-variant-label="${i}" value="${e(v.label[language])}" maxlength="100"></label><label>Cenas daļa<input data-variant-weight="${i}" inputmode="decimal" value="${e(v.multiplier)}"></label><button type="button" class="quiet" data-remove-variant="${i}" aria-label="Noņemt iepakojumu">✕</button></div>`).join("")}</div><button type="button" id="add-variant" class="secondary">+ Pievienot iepakojumu</button></div><div class="form-section"><h3>Izvietojums</h3><label class="check"><input type="checkbox" data-prop="featured" ${edit.featured ? "checked" : ""}> Rādīt arī sākumlapā</label><div class="grid-2"><label>Secība kategorijā<input type="number" data-prop="order" data-number min="0" max="10000" value="${edit.order}"><small>Mazāks skaitlis — augstāk sarakstā.</small></label><label>Secība sākumlapā<input type="number" data-prop="featuredOrder" data-number min="0" max="10000" value="${edit.featuredOrder}"></label></div></div><p id="editor-error" class="error" role="alert"></p></div><footer class="dialog-footer"><button type="button" class="secondary close-editor">Atcelt</button><button type="submit" class="primary" id="apply-product">Paturēt izmaiņas melnrakstā</button></footer></form>`;
  bindTabs(dialog, renderProductEditor); bindLocalized(dialog);
  $$('[data-prop]', dialog).forEach((input) => input.oninput = () => { edit[input.dataset.prop] = input.type === "checkbox" ? input.checked : input.hasAttribute("data-number") ? decimal(input.value) : input.value; editDirty = true; if (input.id === "promotion") $("#sale-price-label").hidden = !input.checked; });
  $("#product-status").onchange = (event) => { edit.active = event.target.value !== "hidden"; edit.available = event.target.value !== "unavailable"; editDirty = true; };
  $$('[data-variant-label]',dialog).forEach((input) => input.oninput = () => { edit.variants[input.dataset.variantLabel].label[language] = input.value; editDirty = true; });
  $$('[data-variant-weight]',dialog).forEach((input) => input.oninput = () => { edit.variants[input.dataset.variantWeight].multiplier = decimal(input.value); editDirty = true; });
  $$('[data-remove-variant]',dialog).forEach((button) => button.onclick = () => { edit.variants.splice(Number(button.dataset.removeVariant),1); editDirty = true; renderProductEditor(); });
  $("#add-variant").onclick = () => { edit.variants ||= []; if (edit.variants.length >= 10) return toast("Var pievienot līdz 10 iepakojumiem.", true); edit.variants.push({ id: `pack-${crypto.randomUUID().slice(0,8)}`, label: {lv:"500 g",en:"500 g",ru:"500 г"}, multiplier: .5 }); editDirty = true; renderProductEditor(); };
  $("#photo").onchange = uploadPhoto;
  $$('.close-editor',dialog).forEach((b) => b.onclick = closeEditor);
  $("#product-form").onsubmit = async (event) => {
    event.preventDefault(); if (uploading) return;
    for (const lang of ["lv","en","ru"]) if (!edit.name[lang]?.trim() || !edit.description[lang]?.trim()) { $("#editor-error").textContent = `Aizpildiet nosaukumu un aprakstu: ${lang.toUpperCase()}.`; return; }
    if (!edit.image) return $("#editor-error").textContent = "Pievienojiet produkta fotogrāfiju.";
    if (!Number.isFinite(edit.price) || (!edit.hidePrice && edit.price <= 0)) return $("#editor-error").textContent = "Ievadiet derīgu cenu, piemēram, 7,50.";
    if (edit.promotion && (edit.hidePrice || !edit.salePrice || edit.salePrice >= edit.price)) return $("#editor-error").textContent = "Akcijas cenai jābūt zemākai par parasto cenu.";
    const products = state.store.catalog.products; const i = products.findIndex((p) => p.id === edit.id);
    if (i < 0) products.push(clone(edit)); else products[i] = clone(edit);
    editDirty = false; dialog.close(); markDirty(); renderProducts(); await save();
  };
}
async function uploadPhoto(event) {
  const file = event.target.files[0]; if (!file) return;
  if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) return toast("Izvēlieties JPG, PNG vai WebP līdz 20 MB.", true);
  uploading = true; $("#apply-product").disabled = true; $("#upload-status").textContent = "Fotogrāfija tiek sagatavota un augšupielādēta…";
  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width > 12000 || bitmap.height > 12000) { bitmap.close(); throw new Error("Attēla izmēri ir pārāk lieli. Izvēlieties mazāku fotogrāfiju."); }
    const scale = Math.min(1,1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale); canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
    let blob = await new Promise((resolve) => canvas.toBlob(resolve,"image/webp",.84));
    if (blob.size > 900000) blob = await new Promise((resolve) => canvas.toBlob(resolve,"image/webp",.6));
    if (blob.size > 900000) throw new Error("Attēlu neizdevās pietiekami samazināt. Izvēlieties mazāku fotogrāfiju.");
    const result = await api("upload", { method:"POST", raw:true, type:blob.type, body:blob });
    edit.image = result.path; editDirty = true; $("#product-image").src = imageUrl(edit.image); $("#upload-status").textContent = "Fotogrāfija gatava. Paturiet produkta izmaiņas melnrakstā.";
  } catch (error) { $("#upload-status").textContent = error.message; toast(error.message, true); }
  finally { uploading = false; $("#apply-product").disabled = false; }
}
function closeEditor() { if (uploading) return toast("Uzgaidiet, līdz fotogrāfijas augšupielāde ir pabeigta.", true); if (editDirty) confirmDialog("Atmest šī loga izmaiņas?", "<p>Šī produkta vai kategorijas jaunās izmaiņas vēl nav saglabātas melnrakstā.</p>", "Atmest izmaiņas", async () => { editDirty = false; $("#editor").close(); }); else $("#editor").close(); }
$("#editor").addEventListener("cancel", (event) => { event.preventDefault(); closeEditor(); });
function renderCategories() {
  $("#main").innerHTML = heading("Kategorijas", "Produktu grupas un to secība vietnē. Paslēpjot kategoriju, paslēpsies arī tās produkti.", '<button id="new-category" class="primary">+ Pievienot kategoriju</button>') + state.store.catalog.categories.slice().sort((a,b) => a.order-b.order).map((c) => `<article class="panel"><div class="section-head"><div><h2>${e(c.label.lv)}</h2><p>${state.store.catalog.products.filter((p) => p.category === c.id).length} produkti · Secība: ${c.order} · ${c.active ? "Redzama" : "Paslēpta"}</p></div><button class="secondary" data-edit-category="${c.id}">Rediģēt</button></div><p>${e(c.description.lv)}</p></article>`).join("");
  $("#new-category").onclick = () => openCategory(); $$('[data-edit-category]').forEach((b) => b.onclick = () => openCategory(b.dataset.editCategory));
}
function openCategory(id) { edit = id ? clone(state.store.catalog.categories.find((c) => c.id === id)) : { id:`category-${crypto.randomUUID().slice(0,12)}`, active:true, order:60, label:{lv:"",en:"",ru:""}, title:{lv:"",en:"",ru:""}, description:{lv:"",en:"",ru:""} }; editDirty = false; language = "lv"; renderCategoryEditor(); $("#editor").showModal(); }
function renderCategoryEditor() {
  const dialog = $("#editor");
  dialog.innerHTML = `<form id="category-form"><header class="dialog-head"><h2 id="editor-title">${e(edit.label.lv || "Jauna kategorija")}</h2><button type="button" class="quiet close-editor" aria-label="Aizvērt">✕</button></header><div class="dialog-body">${tabs()}${localizedFields(edit, [["label","Īsais nosaukums"],["title","Virsraksts produktu lapā"],["description","Apraksts",true]])}<label class="check"><input type="checkbox" id="category-active" ${edit.active ? "checked" : ""}> Kategorija ir redzama vietnē</label><label>Secība<input type="number" id="category-order" min="0" max="10000" value="${edit.order}"></label><p id="editor-error" class="error" role="alert"></p></div><footer class="dialog-footer"><button type="button" class="secondary close-editor">Atcelt</button><button type="submit" class="primary">Paturēt izmaiņas melnrakstā</button></footer></form>`;
  bindTabs(dialog,renderCategoryEditor); bindLocalized(dialog); $$('.close-editor',dialog).forEach((b) => b.onclick = closeEditor);
  $("#category-active").onchange = (ev) => { edit.active = ev.target.checked; editDirty = true; };
  $("#category-order").oninput = (ev) => { edit.order = Number(ev.target.value); editDirty = true; };
  $("#category-form").onsubmit = async (ev) => { ev.preventDefault(); if (["lv","en","ru"].some((l) => !edit.label[l].trim() || !edit.title[l].trim())) return $("#editor-error").textContent = "Aizpildiet nosaukumu un virsrakstu visās trīs valodās."; const categories = state.store.catalog.categories; const i = categories.findIndex((c) => c.id === edit.id); if (i < 0) categories.push(clone(edit)); else categories[i] = clone(edit); editDirty = false; dialog.close(); markDirty(); renderCategories(); await save(); };
}
function renderPages() {
  const page = state.store.pages.find((p) => p.file === selectedPage);
  $("#main").innerHTML = heading("Lapu teksti", "Izvēlieties lapu un valodu. Mainiet tekstu, saglabājiet melnrakstu un apskatiet priekšskatījumu.") + `<label class="page-picker">Lapa<select id="page-picker">${state.store.pages.map((p) => `<option value="${p.file}" ${p.file === selectedPage ? "selected" : ""}>${e(p.title)}</option>`).join("")}</select></label><div class="panel">${tabs()}${page.fields.map((field) => `<div class="page-field">${field.business ? '<p class="inline-hint">Saņemšanas un piegādes informācija tiek atjaunota automātiski. Mainiet to sadaļā <a href="#settings">Kontakti un piegāde</a>.</p>' : `<label>${e(field.label)} (${language.toUpperCase()})<textarea rows="${field.text[language].length > 200 ? 4 : 2}" data-page-field="${field.id}" maxlength="5000">${e(field.text[language])}</textarea></label>`}</div>`).join("")}</div>`;
  $("#page-picker").onchange = (ev) => { selectedPage = ev.target.value; renderPages(); }; bindTabs($("#main"),renderPages);
  const search = document.createElement("input"); search.type = "search"; search.placeholder = "Meklēt tekstu šajā lapā…"; search.setAttribute("aria-label", "Meklēt lapas tekstu"); search.className = "page-text-search";
  $("#main .panel").before(search);
  search.oninput = () => $$(".page-field").forEach((row) => { row.hidden = !`${row.textContent} ${$("textarea",row)?.value || ""}`.toLowerCase().includes(search.value.toLowerCase()); });
  $$('[data-page-field]').forEach((input) => input.oninput = () => { page.fields.find((f) => f.id === input.dataset.pageField).text[language] = input.value; markDirty(); });
}
function renderSettings() {
  const site = state.store.site;
  const field = (key,label,type = "text",hint = "") => `<label>${label}<input id="setting-${key}" data-setting="${key}" type="${type}" value="${e(site[key])}" ${type === "number" ? 'min="0" max="10000" step="0.01"' : ""}>${hint ? `<small>${hint}</small>` : ""}</label>`;
  $("#main").innerHTML = heading("Kontakti un piegāde", "Šeit mainītā informācija atjaunosies visā vietnē un WhatsApp pasūtījuma ziņā.") + `<section class="panel"><h2>Saziņa ar pircējiem</h2><div class="grid-2">${field("phone","Tālrunis, kā to redz pircējs","tel")}${field("whatsappNumber","WhatsApp numurs","text","Ar valsts kodu, tikai cipari. Piemērs: 37129174626")}${field("email","E-pasta adrese","email")}</div><div class="grid-2">${field("instagramUrl","Instagram saite","url")}${field("facebookUrl","Facebook saite","url")}</div></section><section class="panel"><h2>Saņemšana un piegāde</h2><p>Aizpildiet informāciju katrā valodā. Tā tiek izmantota arī pasūtījumu un biežāko jautājumu lapās.</p>${tabs()}${[ ["orderDays","Pasūtījumu pieņemšanas dienas"],["deliveryDays","Piegādes dienas"],["pickupLocation","Saņemšanas vieta un pilna adrese"] ].map(([key,label]) => `<label>${label} (${language.toUpperCase()})<input data-setting-localized="${key}" maxlength="500" value="${e(site[key][language])}"></label>`).join("")}${field("freeDeliveryThreshold","Bezmaksas piegāde Rīgā pasūtījumiem virs (€)","number","Tieši šī summa vēl neatbilst nosacījumam “virs”. Piegādi ārpus Rīgas saskaņo WhatsApp.")}</section><div class="inline-hint">Pasūtījumus pircēji nosūta WhatsApp, kur jūs apstiprināt svaru, pieejamību un galīgo summu. Tiešsaistes maksājumi nav pieslēgti.</div>`;
  bindTabs($("#main"),renderSettings);
  $$('[data-setting]').forEach((input) => input.oninput = () => { site[input.dataset.setting] = input.type === "number" ? decimal(input.value) : input.value; markDirty(); });
  $$('[data-setting-localized]').forEach((input) => input.oninput = () => { site[input.dataset.settingLocalized][language] = input.value; markDirty(); });
}
function renderHistory() {
  $("#main").innerHTML = heading("Versijas un atjaunošana", "Ja kaut kas mainīts kļūdaini, atjaunojiet iepriekšējo versiju kā melnrakstu. Vietne mainīsies tikai pēc publicēšanas.") + `<div class="panel"><h2>Publicēto versiju vēsture</h2><p>Saglabātas pēdējās 20 versijas. Atjaunojot, tiek atjaunots tās versijas saturs, cenas un fotogrāfijas.</p>${state.history.map((version,i) => `<article class="history-row"><div><h3>${date(version.at)} ${i === 0 ? '<span class="badge">Jaunākā</span>' : ""}</h3><ul>${version.changes.slice(0,10).map((c) => `<li>${e(c)}</li>`).join("")}${version.changes.length > 10 ? `<li>…un vēl ${version.changes.length - 10} izmaiņas</li>` : ""}</ul></div><button class="secondary" data-restore="${version.id}">Atjaunot kā melnrakstu</button></article>`).join("")}</div><div class="panel"><h2>Melnraksts un rezerves kopija</h2><p>Lejupielādējiet melnraksta kopiju savā datorā. Tā nesatur paroles.</p><div class="actions"><button class="secondary" id="export">Lejupielādēt melnrakstu</button><button class="danger" id="discard">Atmest melnraksta izmaiņas</button></div></div><details class="panel"><summary>Ja vietni mainījis tās uzturētājs</summary><p>Vispirms lejupielādējiet melnraksta kopiju. Datu atjaunošana aizstāj melnrakstu ar pašreizējo glabātuves saturu.</p><button class="secondary" id="refresh">Ielasīt vietnes datus no jauna</button></details>`;
  $$('[data-restore]').forEach((b) => b.onclick = () => confirmDialog("Atjaunot iepriekšējo versiju?", "<p>Tā aizstās pašreizējo melnrakstu. Pārskatiet to priekšskatījumā un pēc tam publicējiet.</p>", "Atjaunot melnrakstu", async () => { acceptState(await api("restore", { method:"POST",body:{revision:state.revision,id:b.dataset.restore} })); renderHistory(); toast("Versija atjaunota melnrakstā. Pārskatiet un publicējiet."); }));
  $("#discard").onclick = () => confirmDialog("Atmest visas melnraksta izmaiņas?", "<p>Melnraksts atkal sakritīs ar pēdējo publicēto versiju.</p>", "Atmest izmaiņas", async () => { acceptState(await api("discard",{method:"POST",body:{revision:state.revision}})); renderHistory(); toast("Melnraksts atjaunots no publicētās versijas."); });
  $("#refresh").onclick = () => confirmDialog("Ielasīt datus no jauna?", "<p>Pašreizējais melnraksts tiks aizstāts. Pirms tam lejupielādējiet tās kopiju.</p>", "Ielasīt datus", async () => { acceptState(await api("refresh",{method:"POST",body:{revision:state.revision}})); renderHistory(); toast("Dati atjaunoti."); });
  $("#export").onclick = () => { const blob = new Blob([JSON.stringify(state.store,null,2)],{type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `galas-grozs-melnraksts-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); };
}
function renderHelp() {
  $("#main").innerHTML = heading("Palīdzība", "Ikdienā pietiek ar trim darbībām: mainīt, pārbaudīt, publicēt.") + `<div class="panel steps"><h2>Kā nomainīt cenu vai fotogrāfiju</h2>${[["Atveriet produktu","Sadaļā “Produkti” atrodiet vajadzīgo produktu un nospiediet “Rediģēt”."],["Ievadiet izmaiņas","Mainiet cenu, pieejamību vai fotogrāfiju. Tekstiem pārbaudiet visas trīs valodas."],["Paturiet melnrakstā","Nospiediet “Paturēt izmaiņas melnrakstā”. Panelis saglabās tās, bet apmeklētāji vēl neredzēs."],["Pārbaudiet priekšskatījumu","Nospiediet “Priekšskatījums”. Pārbaudiet nosaukumu, cenu un fotogrāfiju."],["Publicējiet","Nospiediet “Pārskatīt un publicēt”, pārbaudiet sarakstu un apstipriniet. Sagaidiet paziņojumu, ka izmaiņas redzamas publiskajā vietnē."]].map(([title,text]) => `<div class="step"><div><h3>${title}</h3><p>${text}</p></div></div>`).join("")}</div><div class="help-grid"><div class="panel"><h2>Ja produkts beidzies</h2><p>Izvēlieties <strong>“Uz laiku nav”</strong>. Produkts paliek redzams, bet to nevar pievienot grozam. Kad tas atkal pieejams, izvēlieties <strong>“Pieejams”</strong>.</p><p><strong>“Paslēpts”</strong> pilnībā paslēpj produktu no pircējiem. Saglabājiet melnrakstu un publicējiet.</p></div><div class="panel"><h2>Ja izdarīta kļūda</h2><p>Pirms publicēšanas sadaļā “Versijas” varat atmest melnraksta izmaiņas. Pēc publicēšanas atjaunojiet iepriekšējo versiju kā melnrakstu, pārbaudiet un publicējiet.</p></div><div class="panel"><h2>Kur pienāk pasūtījumi?</h2><p>Uz jūsu norādīto WhatsApp numuru. Pircējam pašam jānosūta sagatavotā ziņa. Jūs sarakstē apstiprināt pieejamību, precīzu svaru, saņemšanu un samaksu.</p><p>Panelī nav pasūtījumu saraksta un tiešsaistes maksājumu.</p></div><div class="panel"><h2>Ja nekas nenotiek</h2><p>Izlasiet paziņojumu ekrānā. Pārbaudiet internetu. Neaizveriet logu, ja ir nesaglabātas izmaiņas. Ja publicēšana ieilgst, nospiediet “Pārbaudīt vēlreiz”.</p><p>Ja vajadzīga palīdzība, sazinieties ar cilvēku, kurš jums nodeva vietni. Nosūtiet paziņojuma tekstu, nevis paroli.</p></div></div>`;
}
function renderPasswordHelp() {
  $("#main").insertAdjacentHTML("afterbegin", '<p><a class="secondary download-guide" href="/guide-lv.pdf" target="_blank" rel="noopener">Atvērt vienkāršo instrukciju PDF ↗</a></p>');
  $("#main").insertAdjacentHTML("beforeend", '<div class="panel form-section"><h2>Jūsu piekļuves parole</h2><p>Izvēlieties garu paroli, ko izmantojat tikai šim panelim. Pēc paroles maiņas jāpieslēdzas no jauna.</p><button class="secondary" id="change-password">Mainīt paroli</button></div>');
  $("#change-password").onclick = async () => {
    if (!await save()) return;
    confirmDialog("Mainīt piekļuves paroli", '<label>Pašreizējā parole<input id="current-password" type="password" autocomplete="current-password"></label><label>Jaunā parole<input id="new-password" type="password" autocomplete="new-password" minlength="16"><small>Vismaz 16 rakstzīmes. Var izmantot vairākus vārdus.</small></label><label>Atkārtojiet jauno paroli<input id="repeat-password" type="password" autocomplete="new-password"></label>', "Saglabāt jauno paroli", async () => {
      if ($("#new-password").value !== $("#repeat-password").value) throw new Error("Jaunās paroles nesakrīt.");
      await api("password", {method:"POST",body:{password:$("#current-password").value,newPassword:$("#new-password").value}});
      dirty = false; location.reload();
    });
  };
}
function confirmDialog(title, body, buttonText, action) {
  const dialog = $("#confirm");
  dialog.innerHTML = `<div class="dialog-head"><h2 id="confirm-title">${e(title)}</h2></div><div class="dialog-body">${body}<p id="confirm-error" class="error" role="alert"></p></div><div class="dialog-footer"><button class="secondary" id="cancel-confirm">Atcelt</button><button class="primary" id="accept-confirm">${e(buttonText)}</button></div>`;
  $("#cancel-confirm").onclick = () => dialog.close();
  $("#accept-confirm").onclick = async () => { $("#accept-confirm").disabled = true; $("#cancel-confirm").disabled = true; busy = true; $("#main").inert = true; updateBar(); try { await action(); dialog.close(); } catch (error) { $("#confirm-error").textContent = error.message; } finally { busy = false; $("#main").inert = false; updateBar(); $("#accept-confirm").disabled = false; $("#cancel-confirm").disabled = false; } };
  dialog.showModal();
}
$("#confirm").addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });
async function checkStatus() {
  clearTimeout(statusTimer); if (!state?.deployment) { $("#deployment").hidden = true; return; }
  const target = $("#deployment"); target.hidden = false;
  if (state.local) { target.textContent = "Publicēšanas izmēģinājums pabeigts lokāli. Publiskā vietne nav mainīta."; return; }
  target.textContent = "Pārbauda, vai izmaiņas ir redzamas publiskajā vietnē…";
  try { const result = await api("status"); target.innerHTML = `${result.live ? "✓ Izmaiņas ir redzamas publiskajā vietnē." : "Izmaiņas nosūtītas. Vietnes atjaunošana vēl nav apstiprināta."} <button class="secondary" id="check-status">Pārbaudīt vēlreiz</button>`; $("#check-status").onclick = checkStatus; if (!result.live && Date.now()-Date.parse(state.deployment.at)<900000) statusTimer = setTimeout(checkStatus,20000); }
  catch (error) { target.textContent = error.message; }
}
boot().catch((error) => { if (error.status !== 401) $("#login-error").textContent = error.message; });
