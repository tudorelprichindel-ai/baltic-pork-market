"use strict";

const WHATSAPP_NUMBER = "37129174626";
const CART_STORAGE_KEY = "galasGrozsCartV2";
const DELIVERY_STORAGE_KEY = "galasGrozsDeliveryPreferenceV1";
const PAYMENT_STORAGE_KEY = "galasGrozsPaymentPreferenceV1";

const CURRENCY = "€";
const CATALOG = window.GALAS_GROZS_CATALOG || {
  defaultLanguage: "lv",
  categories: [],
  products: []
};

const DEFAULT_DELIVERY = { method: "pickup", details: "" };
const DEFAULT_PAYMENT = { method: "cash" };

const DELIVERY_LABELS = {
  pickup: "Pickup",
  delivery: "Delivery",
  "to-be-confirmed": "To be confirmed"
};

const PAYMENT_LABELS = {
  cash: "Cash",
  "bank-transfer": "Bank transfer",
  card: "Card via Stripe after order confirmation"
};

document.addEventListener("DOMContentLoaded", () => {
  initLanguageSwitcher();
  initMobileNavigation();
  renderSocialLinks();
  renderBusinessContactDetails();
  renderCatalogContent();
  initSmoothLinks();
  initCartSystem();
  applyInterfaceTranslations();
});

function getInterfaceLanguage() {
  const language = localStorage.getItem("galasGrozsLanguage");
  return ["lv", "en", "ru"].includes(language) ? language : "lv";
}

function translateInterfaceText(value) {
  const language = getInterfaceLanguage();
  if (language === "en") return value;
  return window.GALAS_GROZS_I18N?.[language]?.[value] || value;
}

function applyInterfaceTranslations(root = document) {
  const language = getInterfaceLanguage();
  const translations = window.GALAS_GROZS_I18N?.[language];
  if (!translations) return;

  if (translations[document.title]) document.title = translations[document.title];
  const description = document.querySelector('meta[name="description"]');
  if (description?.content && translations[description.content]) {
    description.content = translations[description.content];
  }

  const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    if (["SCRIPT", "STYLE"].includes(node.parentElement?.tagName)) return;
    const original = node.nodeValue.trim();
    const normalized = original.replace(/\s+/g, " ");
    if (!original) return;
    if (translations[normalized]) {
      const leadingSpace = node.nodeValue.match(/^\s*/)?.[0] || "";
      const trailingSpace = node.nodeValue.match(/\s*$/)?.[0] || "";
      node.nodeValue = `${leadingSpace}${translations[normalized]}${trailingSpace}`;
      return;
    }
    if (language === "lv") {
      node.nodeValue = node.nodeValue.replace(/\bservings\b/g, "porcijas");
    } else if (language === "ru") {
      node.nodeValue = node.nodeValue
        .replace(/\bservings\b/g, "порции")
        .replace(/\bmin\b/g, "мин")
        .replace(/\bhr\b/g, "ч");
    }
  });

  root.querySelectorAll?.("[aria-label], [placeholder], [title]").forEach((element) => {
    ["aria-label", "placeholder", "title"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value && translations[value]) element.setAttribute(attribute, translations[value]);
    });
  });
}

function initLanguageSwitcher() {
  const supportedLanguages = ["lv", "en", "ru"];
  const savedLanguage = localStorage.getItem("galasGrozsLanguage");
  const language = supportedLanguages.includes(savedLanguage) ? savedLanguage : "lv";
  document.documentElement.lang = language;

  document.querySelectorAll(".language-switcher").forEach((switcher) => {
    switcher.innerHTML = supportedLanguages.map((code) => `
      <button type="button" data-language="${code}" class="${code === language ? "is-active" : ""}" aria-pressed="${code === language}">
        ${code.toUpperCase()}
      </button>
    `).join("");
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.language;
      if (!supportedLanguages.includes(nextLanguage) || nextLanguage === language) return;
      localStorage.setItem("galasGrozsLanguage", nextLanguage);
      window.location.reload();
    });
  });
}

function renderBusinessContactDetails() {
  const config = window.GALAS_GROZS_SITE || {};
  if (!config.email) return;

  document.querySelectorAll(".footer-contact").forEach((target) => {
    if (target.querySelector("[data-business-email]")) return;
    const email = document.createElement("a");
    email.dataset.businessEmail = "";
    email.href = `mailto:${config.email}`;
    email.textContent = config.email;
    target.appendChild(email);
  });
}

function renderSocialLinks() {
  const config = window.GALAS_GROZS_SITE || {};
  const networks = [
    {
      name: "Instagram",
      url: config.instagramUrl,
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.25"></circle><circle cx="17.4" cy="6.7" r="1"></circle></svg>'
    },
    {
      name: "Facebook",
      url: config.facebookUrl,
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.5-4.3 4.4V10H8v3h2.6v8H14Z"></path></svg>'
    }
  ];

  document.querySelectorAll(".footer-contact").forEach((target) => {
    const socialLinks = document.createElement("div");
    socialLinks.className = "social-links";
    socialLinks.setAttribute("aria-label", "Social media");
    socialLinks.innerHTML = networks.map((network) => {
      const url = typeof network.url === "string" ? network.url.trim() : "";
      if (url) {
        return `
          <a href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="${network.name}">
            ${network.icon}
            <span>${network.name}</span>
          </a>
        `;
      }

      return `
        <span class="social-link is-pending" aria-label="${network.name} coming soon">
          ${network.icon}
          <span>${network.name}</span>
          <small>Coming soon</small>
        </span>
      `;
    }).join("");
    target.appendChild(socialLinks);
  });
}

function getCatalogLanguage() {
  const savedLanguage = localStorage.getItem("galasGrozsLanguage");
  return savedLanguage || document.documentElement.lang?.toLowerCase().split("-")[0] || CATALOG.defaultLanguage || "lv";
}

function getLocalized(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const language = getCatalogLanguage();
  return value[language] || value[CATALOG.defaultLanguage] || value.en || Object.values(value)[0] || "";
}

function getLocalizedUnit(unit = "kg") {
  const language = getCatalogLanguage();
  const labels = {
    en: { kg: "kg", box: "box" },
    lv: { kg: "kg", box: "komplekts" },
    ru: { kg: "кг", box: "набор" }
  };
  return labels[language]?.[unit] || unit;
}

function getActiveCategories() {
  return (CATALOG.categories || [])
    .filter((category) => category.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getActiveProducts() {
  return (CATALOG.products || [])
    .filter((product) => product.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getCatalogProduct(productId) {
  return (CATALOG.products || []).find((product) => product.id === productId);
}

function getCatalogCategory(categoryId) {
  return (CATALOG.categories || []).find((category) => category.id === categoryId);
}

function renderCatalogContent() {
  if (!CATALOG.products?.length) return;

  renderFeaturedProducts();
  renderCategoryNavigation();
  renderProductCatalog();
}

function renderFeaturedProducts() {
  const target = document.querySelector("[data-featured-products]");
  if (!target) return;

  const featuredProducts = getActiveProducts()
    .filter((product) => product.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

  target.innerHTML = featuredProducts
    .map((product) => renderProductCard(product, { featured: true }))
    .join("");
}

function renderCategoryNavigation() {
  const target = document.querySelector("[data-category-navigation]");
  if (!target) return;

  const products = getActiveProducts();
  target.innerHTML = getActiveCategories()
    .filter((category) => products.some((product) => product.category === category.id))
    .map((category) => `
      <a class="category-pill" href="#${escapeHtml(category.id)}">
        ${escapeHtml(getLocalized(category.label))}
      </a>
    `)
    .join("");
}

function renderProductCatalog() {
  const target = document.querySelector("[data-product-catalog]");
  if (!target) return;

  const products = getActiveProducts();
  target.innerHTML = getActiveCategories()
    .map((category) => {
      const categoryProducts = products.filter((product) => product.category === category.id);
      if (!categoryProducts.length) return "";

      return `
        <section class="catalog-category" id="${escapeHtml(category.id)}">
          <div class="container">
            <span class="section-label">${escapeHtml(getLocalized(category.label))}</span>
            <h2>${escapeHtml(getLocalized(category.title))}</h2>
            <p class="section-intro">${escapeHtml(getLocalized(category.description))}</p>

            <div class="catalog-grid">
              ${categoryProducts.map((product) => renderProductCard(product)).join("")}
            </div>
          </div>
        </section>
      `;
    })
    .join("");
}

function renderProductCard(product, options = {}) {
  const category = getCatalogCategory(product.category);
  const isAvailable = product.available !== false;
  const isPromotion = product.promotion === true && parsePrice(product.salePrice) > 0;
  const displayPrice = isPromotion ? parsePrice(product.salePrice) : parsePrice(product.price);
  const categoryLabel = getLocalized(category?.label) || "Products";
  const name = getLocalized(product.name) || "Product";
  const description = options.featured
    ? getLocalized(product.featuredDescription) || getLocalized(product.description)
    : getLocalized(product.description);
  const image = product.image || `assets/products/${product.id}.png`;

  const metaMarkup = options.featured
    ? `
      <div class="product-meta">
        <span><strong>Category:</strong> ${escapeHtml(categoryLabel)}</span>
        <span><strong>Unit:</strong> ${escapeHtml(getLocalizedUnit(product.unit))}</span>
      </div>
    `
    : `<div class="product-meta">${escapeHtml(getLocalized(product.meta))}</div>`;

  return `
    <article
      class="catalog-product${isAvailable ? "" : " is-unavailable"}${isPromotion ? " is-promotion" : ""}"
      data-product-id="${escapeHtml(product.id)}"
      data-product-name="${escapeHtml(name)}"
      data-product-category="${escapeHtml(categoryLabel)}"
      data-product-price="${escapeHtml(displayPrice.toFixed(2))}"
      data-product-unit="${escapeHtml(getLocalizedUnit(product.unit))}"
      data-product-image="${escapeHtml(image)}"
    >
      <div class="product-image-wrap">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" />
        ${isAvailable ? "" : '<span class="product-unavailable-stamp" aria-label="Unavailable">Unavailable</span>'}
        ${isPromotion && isAvailable ? '<span class="product-promotion-stamp" aria-label="Promotion">Promotion</span>' : ""}
      </div>
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(description)}</p>
      ${metaMarkup}
      ${renderProductVariants(product)}
      <button class="catalog-btn" type="button"${isAvailable ? "" : ' disabled aria-disabled="true"'}>${isAvailable ? "Add to cart" : "Unavailable"}</button>
    </article>
  `;
}

function renderProductVariants(product) {
  if (!Array.isArray(product.variants) || product.variants.length === 0) return "";

  return `
    <div class="product-variant-selector" aria-label="Choose package size">
      ${product.variants.map((variant, index) => `
        <button
          class="product-variant-option${index === 0 ? " is-selected" : ""}"
          type="button"
          data-variant-id="${escapeHtml(variant.id)}"
          aria-pressed="${index === 0 ? "true" : "false"}"
        >${escapeHtml(getLocalized(variant.label) || variant.id)}</button>
      `).join("")}
    </div>
  `;
}

function initMobileNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initCartSystem() {
  injectCartUi();
  reconcileCartWithCatalog();
  injectProductImages();
  injectProductPrices();
  bindProductVariants();
  bindProductButtons();
  updateCartUi();
}

function getCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getDeliveryPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(DELIVERY_STORAGE_KEY));
    return { ...DEFAULT_DELIVERY, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_DELIVERY };
  }
}

function saveDeliveryPreference(preference) {
  localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(preference));
}

function getPaymentPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(PAYMENT_STORAGE_KEY));
    return { ...DEFAULT_PAYMENT, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_PAYMENT };
  }
}

function savePaymentPreference(preference) {
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(preference));
}

function parsePrice(value) {
  const price = Number.parseFloat(String(value || "").replace(",", "."));
  return Number.isFinite(price) ? price : 0;
}

function formatPrice(price) {
  return `${price.toFixed(2)} ${CURRENCY}`;
}

function getProductUnitPrice(product) {
  const regularPrice = parsePrice(product.price);
  const salePrice = parsePrice(product.salePrice);
  return product.promotion === true && salePrice > 0 ? salePrice : regularPrice;
}

function getSelectedVariant(card, product) {
  if (!Array.isArray(product.variants) || product.variants.length === 0) return null;
  const selectedId = card.querySelector(".product-variant-option.is-selected")?.dataset.variantId;
  return product.variants.find((variant) => variant.id === selectedId) || product.variants[0];
}

function getProductFromCard(card) {
  const name =
    card.dataset.productName ||
    card.querySelector("h3")?.textContent?.trim() ||
    "Product";

  const id =
    card.dataset.productId ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const catalogProduct = getCatalogProduct(id);
  if (catalogProduct && catalogProduct.active !== false) {
    const catalogCategory = getCatalogCategory(catalogProduct.category);
    const variant = getSelectedVariant(card, catalogProduct);
    const variantMultiplier = variant ? Number(variant.multiplier) || 1 : 1;
    const cartId = variant ? `${catalogProduct.id}::${variant.id}` : catalogProduct.id;

    return {
      id: cartId,
      catalogId: catalogProduct.id,
      variantId: variant?.id || "",
      name: getLocalized(catalogProduct.name),
      category: getLocalized(catalogCategory?.label) || "Products",
      unit: variant ? getLocalized(variant.label) || variant.id : catalogProduct.unit || "kg",
      price: getProductUnitPrice(catalogProduct) * variantMultiplier,
      image: catalogProduct.image || `assets/products/${catalogProduct.id}.png`
    };
  }

  const category =
    card.dataset.productCategory ||
    card.closest(".catalog-category")?.querySelector(".section-label")?.textContent?.trim() ||
    "Products";

  const unit = card.dataset.productUnit || "kg";
  const price = parsePrice(card.dataset.productPrice);
  const image =
    card.dataset.productImage ||
    card.querySelector(".product-image-wrap img")?.getAttribute("src") ||
    `assets/products/${id}.png`;

  return { id, name, category, unit, price, image };
}

function injectProductImages() {
  document.querySelectorAll(".catalog-product").forEach((card) => {
    if (card.querySelector(".product-image-wrap")) return;

    const product = getProductFromCard(card);
    if (!product.id) return;

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";

    const image = document.createElement("img");
    image.src = product.image || `assets/products/${product.id}.png`;
    image.alt = product.name;
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("error", () => {
      imageWrap.remove();
    });

    imageWrap.appendChild(image);
    card.insertAdjacentElement("afterbegin", imageWrap);
  });
}

function injectProductPrices() {
  document.querySelectorAll(".catalog-product").forEach((card) => {
    const existingPrice = card.querySelector(".product-price-js");

    if (existingPrice) {
      updateCardPrice(card, existingPrice);
      return;
    }

    const priceElement = document.createElement("div");
    priceElement.className = "product-price-js";
    updateCardPrice(card, priceElement);

    const meta = card.querySelector(".product-meta");
    if (meta) meta.insertAdjacentElement("afterend", priceElement);
    else card.appendChild(priceElement);
  });
}

function updateCardPrice(card, priceElement = card.querySelector(".product-price-js")) {
  if (!priceElement) return;

  const catalogProduct = getCatalogProduct(card.dataset.productId);
  if (!catalogProduct) {
    const product = getProductFromCard(card);
    priceElement.textContent = product.price > 0
      ? `${formatPrice(product.price)} / ${getLocalizedUnit(product.unit)}`
      : "Price confirmed manually";
    return;
  }

  const variant = getSelectedVariant(card, catalogProduct);
  const multiplier = variant ? Number(variant.multiplier) || 1 : 1;
  const unit = variant ? getLocalized(variant.label) || variant.id : getLocalizedUnit(catalogProduct.unit);
  const regularPrice = parsePrice(catalogProduct.price) * multiplier;
  const salePrice = parsePrice(catalogProduct.salePrice) * multiplier;

  if (catalogProduct.promotion === true && salePrice > 0) {
    priceElement.innerHTML = `
      <span class="product-old-price">${escapeHtml(formatPrice(regularPrice))}</span>
      <strong class="product-sale-price">${escapeHtml(formatPrice(salePrice))} / ${escapeHtml(unit)}</strong>
    `;
  } else {
    priceElement.textContent = regularPrice > 0
      ? `${formatPrice(regularPrice)} / ${unit}`
      : "Price confirmed manually";
  }
}

function bindProductVariants() {
  document.querySelectorAll(".catalog-product").forEach((card) => {
    card.querySelectorAll(".product-variant-option").forEach((button) => {
      button.addEventListener("click", () => {
        card.querySelectorAll(".product-variant-option").forEach((option) => {
          const selected = option === button;
          option.classList.toggle("is-selected", selected);
          option.setAttribute("aria-pressed", String(selected));
        });
        updateCardPrice(card);
      });
    });
  });
}

function bindProductButtons() {
  document.querySelectorAll(".catalog-product").forEach((card) => {
    const button = card.querySelector(".catalog-btn") || card.querySelector("[data-add-to-cart]");
    if (!button) return;
    if (button.disabled || card.classList.contains("is-unavailable")) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();

      const product = getProductFromCard(card);
      addToCart(product);
    });
  });
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) existingItem.quantity += 1;
  else cart.push({ ...product, quantity: 1 });

  saveCart(cart);
  updateCartUi();
}

function reconcileCartWithCatalog() {
  if (!CATALOG.products?.length) return;

  const currentCart = getCart();
  const nextCart = currentCart.flatMap((item) => {
    const catalogId = item.catalogId || String(item.id).split("::")[0];
    const product = getCatalogProduct(catalogId);
    if (!product || product.active === false || product.available === false) return [];

    const category = getCatalogCategory(product.category);
    const variant = Array.isArray(product.variants)
      ? product.variants.find((option) => option.id === item.variantId)
      : null;
    const multiplier = variant ? Number(variant.multiplier) || 1 : 1;
    const cartId = variant ? `${product.id}::${variant.id}` : product.id;
    return [{
      id: cartId,
      catalogId: product.id,
      variantId: variant?.id || "",
      name: getLocalized(product.name),
      category: getLocalized(category?.label) || "Products",
      unit: variant ? getLocalized(variant.label) || variant.id : getLocalizedUnit(product.unit),
      price: getProductUnitPrice(product) * multiplier,
      image: product.image || `assets/products/${product.id}.png`,
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1)
    }];
  });

  if (JSON.stringify(currentCart) !== JSON.stringify(nextCart)) {
    saveCart(nextCart);
  }
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartUi();
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;

  item.quantity = Math.max(1, quantity);
  saveCart(cart);
  updateCartUi();
}

function clearCart() {
  saveCart([]);
  updateCartUi();
}

function getCartTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getCartCount(cart) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function injectCartUi() {
  if (document.querySelector(".cart-drawer")) return;

  const cartMarkup = `
    <button class="floating-cart-btn" type="button" aria-label="Open cart">
      <span class="floating-cart-icon">🛒</span>
      <span class="floating-cart-text">Cart</span>
      <span class="cart-count" data-cart-count>0</span>
    </button>

    <div class="cart-overlay" data-cart-overlay></div>

    <aside class="cart-drawer" aria-label="Shopping cart">
      <div class="cart-drawer-header">
        <div class="cart-drawer-title">
          <strong>Your order</strong>
          <span data-cart-drawer-count>0 items</span>
        </div>
        <button class="cart-close-btn" type="button" aria-label="Close cart">×</button>
      </div>

      <div class="cart-items" data-cart-items></div>

      <section class="cart-preference-section">
        <p class="cart-section-title">Order preferences</p>

        <label class="cart-select-field" for="deliveryMethod">
          <span>Pickup or delivery</span>
          <select id="deliveryMethod" data-delivery-method>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
            <option value="to-be-confirmed">To be confirmed</option>
          </select>
        </label>

        <div class="cart-delivery-details" data-delivery-details>
          <label for="deliveryDetails">Delivery address / details</label>
          <textarea id="deliveryDetails" rows="3" placeholder="Write delivery address, area, preferred time or other details."></textarea>
        </div>

        <label class="cart-select-field" for="paymentMethod">
          <span>Preferred payment method</span>
          <select id="paymentMethod" data-payment-method>
            <option value="cash">Cash</option>
            <option value="bank-transfer">Bank transfer</option>
            <option value="card">Card via Stripe after confirmation</option>
          </select>
        </label>

        <div class="cart-order-information" data-order-information></div>
      </section>

      <div class="cart-summary">
        <div>
          <span>Estimated total</span>
          <strong data-cart-total>0.00 €</strong>
        </div>
        <small>Final total may change after exact weight and availability confirmation.</small>
      </div>

      <div class="cart-actions">
        <button class="cart-whatsapp-btn" type="button" data-cart-whatsapp>
          Send order on WhatsApp
        </button>
        <button class="cart-clear-btn" type="button" data-cart-clear>
          Clear cart
        </button>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML("beforeend", cartMarkup);

  document.querySelector(".floating-cart-btn")?.addEventListener("click", openCart);
  document.querySelector(".cart-close-btn")?.addEventListener("click", closeCart);
  document.querySelector("[data-cart-overlay]")?.addEventListener("click", closeCart);
  document.querySelector("[data-cart-clear]")?.addEventListener("click", clearCart);
  document.querySelector("[data-cart-whatsapp]")?.addEventListener("click", requestCartOrder);

  bindDeliveryPreferenceInputs();
  bindPaymentPreferenceInputs();
  renderOrderInformation();
}

function bindDeliveryPreferenceInputs() {
  const delivery = getDeliveryPreference();
  const deliverySelect = document.querySelector("[data-delivery-method]");
  const detailsTextarea = document.querySelector("#deliveryDetails");

  if (deliverySelect) {
    deliverySelect.value = delivery.method || "to-be-confirmed";

    deliverySelect.addEventListener("change", () => {
      saveDeliveryPreference({ ...getDeliveryPreference(), method: deliverySelect.value });
      updateDeliveryDetailsVisibility();
    });
  }

  if (detailsTextarea) {
    detailsTextarea.value = delivery.details || "";

    detailsTextarea.addEventListener("input", () => {
      saveDeliveryPreference({ ...getDeliveryPreference(), details: detailsTextarea.value.trim() });
    });
  }

  updateDeliveryDetailsVisibility();
}

function renderOrderInformation() {
  const target = document.querySelector("[data-order-information]");
  if (!target) return;
  const config = window.GALAS_GROZS_SITE || {};
  target.innerHTML = `
    <p><strong>Order days:</strong> ${escapeHtml(config.orderDays || "Monday and Tuesday")}</p>
    <p><strong>Delivery:</strong> ${escapeHtml(config.deliveryDays || "Thursday and Friday")}</p>
    <p><strong>Pickup:</strong> ${escapeHtml(config.pickupLocation || "Rīgas Centrāltirgus")}</p>
    <p>Free delivery within Riga for orders over ${formatPrice(config.freeDeliveryThreshold || 50)}. For delivery outside Riga, contact us on WhatsApp.</p>
  `;
}

function bindPaymentPreferenceInputs() {
  const payment = getPaymentPreference();
  const paymentSelect = document.querySelector("[data-payment-method]");
  if (!paymentSelect) return;
  paymentSelect.value = payment.method || "cash";
  paymentSelect.addEventListener("change", () => {
    savePaymentPreference({ method: paymentSelect.value });
  });
}

function updateDeliveryDetailsVisibility() {
  const delivery = getDeliveryPreference();
  const detailsWrapper = document.querySelector("[data-delivery-details]");
  if (!detailsWrapper) return;

  detailsWrapper.classList.toggle("open", delivery.method === "delivery");
}

function updateCartUi() {
  const cart = getCart();
  const cartItems = document.querySelector("[data-cart-items]");
  const cartTotal = document.querySelector("[data-cart-total]");
  const cartCountElements = document.querySelectorAll("[data-cart-count]");
  const cartDrawerCount = document.querySelector("[data-cart-drawer-count]");
  const count = getCartCount(cart);
  const total = getCartTotal(cart);

  cartCountElements.forEach((element) => {
    element.textContent = String(count);
  });

  if (cartDrawerCount) {
    cartDrawerCount.textContent = count === 1 ? "1 item" : `${count} items`;
  }

  if (cartTotal) cartTotal.textContent = formatPrice(total);
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <strong>Your cart is empty.</strong>
        <span>Add products and send an order request on WhatsApp.</span>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map((item) => {
    const lineTotal = item.price * item.quantity;

    return `
      <article class="cart-item cart-item-compact">
        <div class="cart-item-image">
          <img src="${escapeHtml(item.image || `assets/products/${item.id}.png`)}" alt="${escapeHtml(item.name)}" />
        </div>

        <div class="cart-item-content">
          <div class="cart-item-top">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.category)} · ${formatPrice(item.price)} / ${escapeHtml(item.unit)}</p>
            </div>
            <button class="cart-remove-icon" type="button" data-cart-remove="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}">×</button>
          </div>

          <div class="cart-item-bottom">
            <div class="cart-item-controls">
              <button type="button" data-cart-decrease="${escapeHtml(item.id)}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-increase="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
            </div>
            <strong class="cart-line-total">${formatPrice(lineTotal)}</strong>
          </div>
        </div>
      </article>
    `;
  }).join("");

  cartItems.querySelectorAll(".cart-item-image img").forEach((image) => {
    image.addEventListener("error", () => {
      image.closest(".cart-item")?.classList.add("cart-item-no-image");
      image.closest(".cart-item-image")?.remove();
    });
  });

  bindCartItemButtons();
}

function bindCartItemButtons() {
  document.querySelectorAll("[data-cart-increase]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.cartIncrease;
      const item = getCart().find((cartItem) => cartItem.id === productId);
      if (!item) return;

      updateCartQuantity(productId, item.quantity + 1);
    });
  });

  document.querySelectorAll("[data-cart-decrease]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.cartDecrease;
      const item = getCart().find((cartItem) => cartItem.id === productId);
      if (!item) return;

      updateCartQuantity(productId, item.quantity - 1);
    });
  });

  document.querySelectorAll("[data-cart-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.cartRemove));
  });
}

function openCart() {
  document.body.classList.add("cart-open");
}

function closeCart() {
  document.body.classList.remove("cart-open");
}

function requestCartOrder() {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const delivery = getDeliveryPreference();
  const payment = getPaymentPreference();
  const total = getCartTotal(cart);

  const orderLines = cart.map((item, index) => {
    const lineTotal = item.price * item.quantity;

    return [
      `${index + 1}. ${item.name}`,
      `   Category: ${item.category}`,
      `   Quantity: ${item.quantity} ${item.unit}`,
      `   Indicative price: ${formatPrice(item.price)} / ${item.unit}`,
      `   Estimated line total: ${formatPrice(lineTotal)}`
    ].join("\n");
  });

  const messageParts = [
    "Hello, I would like to place an order request from Gaļas grozs.",
    "",
    "Products:",
    orderLines.join("\n\n"),
    "",
    `Estimated total: ${formatPrice(total)}`,
    "",
    `Delivery preference: ${DELIVERY_LABELS[delivery.method] || "To be confirmed"}`,
    delivery.method === "delivery" && delivery.details ? `Delivery address / details: ${delivery.details}` : null,
    `Payment preference: ${PAYMENT_LABELS[payment.method] || "Cash"}`,
    "",
    "I understand that final weight, availability and total price are confirmed manually before payment."
  ].filter(Boolean);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageParts.join("\n"))}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
