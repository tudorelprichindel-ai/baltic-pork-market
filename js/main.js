const WHATSAPP_NUMBER = "37129174626";
const CART_STORAGE_KEY = "galasGrozsCartV2";

document.addEventListener("DOMContentLoaded", () => {
  initDropdownNavigation();
  initForms();
  initCart();
});

/* Navigation */

function initDropdownNavigation() {
  const dropdowns = document.querySelectorAll(".nav-dropdown");

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");

    if (!toggle) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen = dropdown.classList.contains("open");
      closeAllDropdowns();

      if (!isOpen) {
        dropdown.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });

    dropdown.querySelectorAll(".nav-dropdown-menu a").forEach((link) => {
      link.addEventListener("click", closeAllDropdowns);
    });
  });

  document.addEventListener("click", closeAllDropdowns);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllDropdowns();
      closeCart();
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");

    dropdown.classList.remove("open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* Forms */

function initForms() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const message = buildFormOrderMessage(formData);
      const whatsappUrl = buildWhatsappUrl(message);

      showFormMessage(form, whatsappUrl);
    });
  });
}

function buildFormOrderMessage(formData) {
  const name = getFormValue(formData, "name");
  const phone = getFormValue(formData, "phone");
  const email = getFormValue(formData, "email");
  const delivery = getFormValue(formData, "delivery");
  const note = getFormValue(formData, "message") || getFormValue(formData, "products");
  const cart = getCart();

  const cartText = cart.length > 0 ? buildCartMessageSection(cart) : "";

  return `
Hello Gaļas grozs,

I would like to place an order request.

Name: ${name || "Not provided"}
Phone / WhatsApp: ${phone || "Not provided"}
Email: ${email || "Not provided"}

Order:
${cartText || note || "Not provided"}

Pickup / delivery preference: ${delivery || "To be confirmed"}

Please confirm availability, final weight, final price and pickup or delivery options.

Thank you.
  `.trim();
}

function getFormValue(formData, key) {
  const value = formData.get(key);
  return value ? value.toString().trim() : "";
}

function showFormMessage(form, whatsappUrl) {
  let status = form.querySelector(".form-status");

  if (!status) {
    status = document.createElement("div");
    status.className = "form-status";
    form.appendChild(status);
  }

  status.innerHTML = `
    <p>Your order request is ready.</p>
    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">
      Send order on WhatsApp
    </a>
  `;
}

/* Cart */

function initCart() {
  injectCartUi();
  enhanceProductCards();
  renderCart();
  bindCartEvents();
}

function injectCartUi() {
  if (document.querySelector("[data-cart-overlay]")) return;

  const cartButton = document.createElement("button");
  cartButton.className = "floating-cart-button";
  cartButton.type = "button";
  cartButton.setAttribute("data-cart-open", "");
  cartButton.innerHTML = `
    <span>Cart</span>
    <strong data-cart-count>0</strong>
  `;

  const cartOverlay = document.createElement("div");
  cartOverlay.className = "cart-overlay";
  cartOverlay.setAttribute("data-cart-overlay", "");
  cartOverlay.innerHTML = `
    <aside class="cart-drawer" aria-label="Shopping cart">
      <div class="cart-header">
        <div>
          <p class="cart-kicker">Order request</p>
          <h2>Your cart</h2>
        </div>

        <button class="cart-close" type="button" data-cart-close aria-label="Close cart">
          ×
        </button>
      </div>

      <div class="cart-items" data-cart-items></div>

      <div class="cart-footer">
        <div class="cart-summary-line">
          <span>Estimated total</span>
          <strong data-cart-total>€0.00</strong>
        </div>

        <p class="cart-note">
          Prices are informative. Final availability, weight and price are confirmed manually.
        </p>

        <button class="cart-request-btn" type="button" data-cart-request>
          Send order on WhatsApp
        </button>

        <button class="cart-clear-btn" type="button" data-cart-clear>
          Clear cart
        </button>
      </div>
    </aside>
  `;

  document.body.appendChild(cartButton);
  document.body.appendChild(cartOverlay);
}

function enhanceProductCards() {
  const productCards = document.querySelectorAll(".catalog-product");

  productCards.forEach((card) => {
    const titleElement = card.querySelector("h3");
    const button = card.querySelector(".catalog-btn");

    if (!titleElement || !button) return;

    const productData = getProductDataFromCard(card, titleElement);

    if (!card.querySelector(".cart-product-price")) {
      const priceBadge = document.createElement("div");
      priceBadge.className = "cart-product-price";

      if (hasValidPrice(productData)) {
        priceBadge.innerHTML = `
          <span>Price</span>
          <strong>${formatCurrency(productData.price)} / ${productData.unit}</strong>
        `;
      } else {
        priceBadge.innerHTML = `
          <span>Price</span>
          <strong>On request</strong>
        `;
      }

      titleElement.insertAdjacentElement("afterend", priceBadge);
    }

    button.textContent = "Add to Cart";
    button.setAttribute("href", "#");

    button.addEventListener("click", (event) => {
      event.preventDefault();
      addToCart(productData);
      openCart();
    });
  });
}

function getProductDataFromCard(card, titleElement) {
  const fallbackName = titleElement.textContent.trim();
  const rawPrice = card.dataset.productPrice;
  const parsedPrice = rawPrice !== undefined && rawPrice !== "" ? Number(rawPrice) : null;

  return {
    id: card.dataset.productId || createProductId(card.dataset.productName || fallbackName),
    name: card.dataset.productName || fallbackName,
    category: card.dataset.productCategory || detectProductCategory(card),
    price: Number.isFinite(parsedPrice) ? parsedPrice : null,
    unit: card.dataset.productUnit || "kg"
  };
}

function detectProductCategory(card) {
  const section = card.closest(".catalog-category");

  if (!section) return "Product";

  const label = section.querySelector(".section-label");
  const heading = section.querySelector("h2");

  if (label && label.textContent.trim()) return label.textContent.trim();
  if (heading && heading.textContent.trim()) return heading.textContent.trim();

  return "Product";
}

function bindCartEvents() {
  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-cart-open]");
    const closeButton = event.target.closest("[data-cart-close]");
    const clickedOverlay = event.target.matches("[data-cart-overlay]");
    const increaseButton = event.target.closest("[data-cart-increase]");
    const decreaseButton = event.target.closest("[data-cart-decrease]");
    const removeButton = event.target.closest("[data-cart-remove]");
    const requestButton = event.target.closest("[data-cart-request]");
    const clearButton = event.target.closest("[data-cart-clear]");

    if (openButton) {
      openCart();
      return;
    }

    if (closeButton || clickedOverlay) {
      closeCart();
      return;
    }

    if (increaseButton) {
      updateCartQuantity(increaseButton.dataset.cartIncrease, 1);
      return;
    }

    if (decreaseButton) {
      updateCartQuantity(decreaseButton.dataset.cartDecrease, -1);
      return;
    }

    if (removeButton) {
      removeFromCart(removeButton.dataset.cartRemove);
      return;
    }

    if (requestButton) {
      requestCartOrder();
      return;
    }

    if (clearButton) {
      clearCart();
    }
  });
}

function addToCart(productData) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productData.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productData.id,
      name: productData.name,
      category: productData.category,
      price: hasValidPrice(productData) ? productData.price : null,
      unit: productData.unit || "kg",
      quantity: 1
    });
  }

  saveCart(cart);
  renderCart();
}

function updateCartQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    saveCart(cart.filter((cartItem) => cartItem.id !== productId));
  } else {
    saveCart(cart);
  }

  renderCart();
}

function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function renderCart() {
  const cart = getCart();
  const cartItems = document.querySelector("[data-cart-items]");
  const cartTotal = document.querySelector("[data-cart-total]");
  const cartCount = document.querySelector("[data-cart-count]");

  if (!cartItems || !cartTotal || !cartCount) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = calculateCartTotal(cart);

  cartCount.textContent = totalItems.toString();
  cartTotal.textContent = formatCurrency(totalPrice);

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty.</p>
        <span>Add products from the catalogue to prepare an order request.</span>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      const itemHasPrice = typeof item.price === "number" && !Number.isNaN(item.price);
      const itemTotal = itemHasPrice ? item.price * item.quantity : null;

      return `
        <article class="cart-item">
          <div class="cart-item-main">
            <h3>${escapeHtml(item.name)}</h3>
            <p>
              ${escapeHtml(item.category || "Product")}
              ${
                itemHasPrice
                  ? ` · ${formatCurrency(item.price)} / ${escapeHtml(item.unit || "kg")}`
                  : " · Price on request"
              }
            </p>
            <strong>${itemHasPrice ? formatCurrency(itemTotal) : "Price on request"}</strong>
          </div>

          <div class="cart-item-controls">
            <button type="button" data-cart-decrease="${escapeHtml(item.id)}">−</button>
            <span>${item.quantity} ${escapeHtml(item.unit || "kg")}</span>
            <button type="button" data-cart-increase="${escapeHtml(item.id)}">+</button>
          </div>

          <button class="cart-remove" type="button" data-cart-remove="${escapeHtml(item.id)}">
            Remove
          </button>
        </article>
      `;
    })
    .join("");
}

function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => {
    if (typeof item.price !== "number" || Number.isNaN(item.price)) {
      return sum;
    }

    return sum + item.price * item.quantity;
  }, 0);
}

function requestCartOrder() {
  const cart = getCart();

  if (cart.length === 0) {
    openCart();
    return;
  }

  const message = `
Hello Gaļas grozs,

I would like to place an order request:

${buildCartMessageSection(cart)}

Estimated total for priced products: ${formatCurrency(calculateCartTotal(cart))}

I understand that prices are informative and that final availability, final weight and final price must be confirmed manually.

Please confirm pickup or delivery options.

Thank you.
  `.trim();

  window.open(buildWhatsappUrl(message), "_blank", "noopener,noreferrer");
}

function buildCartMessageSection(cart) {
  return cart
    .map((item, index) => {
      const itemHasPrice = typeof item.price === "number" && !Number.isNaN(item.price);

      if (!itemHasPrice) {
        return `${index + 1}. ${item.name} — ${item.quantity} ${item.unit || "kg"} — price on request`;
      }

      const itemTotal = item.price * item.quantity;

      return `${index + 1}. ${item.name} — ${item.quantity} ${item.unit || "kg"} × ${formatCurrency(item.price)} / ${item.unit || "kg"} = approx. ${formatCurrency(itemTotal)}`;
    })
    .join("\n");
}

function buildWhatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openCart() {
  const overlay = document.querySelector("[data-cart-overlay]");
  if (overlay) overlay.classList.add("open");
}

function closeCart() {
  const overlay = document.querySelector("[data-cart-overlay]");
  if (overlay) overlay.classList.remove("open");
}

/* Helpers */

function hasValidPrice(productData) {
  return productData && typeof productData.price === "number" && !Number.isNaN(productData.price);
}

function createProductId(productName) {
  return productName
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-LV", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function escapeHtml(value) {
  return value
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
