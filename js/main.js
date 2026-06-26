"use strict";

const WHATSAPP_NUMBER = "37129174626";
const CART_STORAGE_KEY = "galasGrozsCartV2";
const DELIVERY_STORAGE_KEY = "galasGrozsDeliveryPreferenceV1";
const PAYMENT_STORAGE_KEY = "galasGrozsPaymentPreferenceV1";

const CURRENCY = "€";

const DEFAULT_DELIVERY = {
  method: "to-be-confirmed",
  details: ""
};

const DEFAULT_PAYMENT = {
  method: "to-be-confirmed"
};

const DELIVERY_LABELS = {
  pickup: "Pickup",
  delivery: "Delivery",
  "to-be-confirmed": "To be confirmed"
};

const PAYMENT_LABELS = {
  cash: "Cash",
  "bank-transfer": "Bank transfer",
  "payment-link": "Online payment link if available",
  "to-be-confirmed": "To be confirmed"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initSmoothLinks();
  initCartSystem();
});

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

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}

function initCartSystem() {
  injectCartUi();
  injectProductPrices();
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

    return {
      ...DEFAULT_DELIVERY,
      ...(saved || {})
    };
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

    return {
      ...DEFAULT_PAYMENT,
      ...(saved || {})
    };
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

function getProductFromCard(card) {
  const name =
    card.dataset.productName ||
    card.querySelector("h3")?.textContent?.trim() ||
    "Product";

  const id =
    card.dataset.productId ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const category =
    card.dataset.productCategory ||
    card.closest(".catalog-category")?.querySelector(".section-label")?.textContent?.trim() ||
    "Products";

  const unit = card.dataset.productUnit || "kg";
  const price = parsePrice(card.dataset.productPrice);

  return {
    id,
    name,
    category,
    unit,
    price
  };
}

function injectProductPrices() {
  document.querySelectorAll(".catalog-product").forEach((card) => {
    const product = getProductFromCard(card);
    const existingPrice = card.querySelector(".product-price-js");

    if (existingPrice) {
      existingPrice.textContent = product.price > 0
        ? `${formatPrice(product.price)} / ${product.unit}`
        : "Price confirmed manually";
      return;
    }

    const priceElement = document.createElement("div");
    priceElement.className = "product-price-js";
    priceElement.textContent = product.price > 0
      ? `${formatPrice(product.price)} / ${product.unit}`
      : "Price confirmed manually";

    const meta = card.querySelector(".product-meta");

    if (meta) {
      meta.insertAdjacentElement("afterend", priceElement);
    } else {
      card.appendChild(priceElement);
    }
  });
}

function bindProductButtons() {
  document.querySelectorAll(".catalog-product").forEach((card) => {
    const button =
      card.querySelector(".catalog-btn") ||
      card.querySelector("[data-add-to-cart]");

    if (!button) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();

      const product = getProductFromCard(card);

      addToCart(product);
      openCart();
    });
  });
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartUi();
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
  return cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function getCartCount(cart) {
  return cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
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
        <span></span>
        <button class="cart-close-btn" type="button" aria-label="Close cart">×</button>
      </div>

      <div class="cart-items" data-cart-items></div>

      <section class="cart-preference-section">
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
            <option value="payment-link">Online payment link if available</option>
            <option value="to-be-confirmed">To be confirmed</option>
          </select>
        </label>
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
}

function bindDeliveryPreferenceInputs() {
  const delivery = getDeliveryPreference();
  const deliverySelect = document.querySelector("[data-delivery-method]");
  const detailsTextarea = document.querySelector("#deliveryDetails");

  if (deliverySelect) {
    deliverySelect.value = delivery.method || "to-be-confirmed";

    deliverySelect.addEventListener("change", () => {
      saveDeliveryPreference({
        ...getDeliveryPreference(),
        method: deliverySelect.value
      });

      updateDeliveryDetailsVisibility();
    });
  }

  if (detailsTextarea) {
    detailsTextarea.value = delivery.details || "";

    detailsTextarea.addEventListener("input", () => {
      saveDeliveryPreference({
        ...getDeliveryPreference(),
        details: detailsTextarea.value.trim()
      });
    });
  }

  updateDeliveryDetailsVisibility();
}

function bindPaymentPreferenceInputs() {
  const payment = getPaymentPreference();
  const paymentSelect = document.querySelector("[data-payment-method]");

  if (!paymentSelect) return;

  paymentSelect.value = payment.method || "to-be-confirmed";

  paymentSelect.addEventListener("change", () => {
    savePaymentPreference({
      method: paymentSelect.value
    });
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

  const count = getCartCount(cart);
  const total = getCartTotal(cart);

  cartCountElements.forEach((element) => {
    element.textContent = String(count);
  });

  if (cartTotal) {
    cartTotal.textContent = formatPrice(total);
  }

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

  cartItems.innerHTML = cart
    .map((item) => {
      const lineTotal = item.price * item.quantity;

      return `
        <article class="cart-item cart-item-compact">
          <div class="cart-item-top">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.category)} · ${formatPrice(item.price)} / ${escapeHtml(item.unit)}</p>
            </div>

            <button class="cart-remove-icon" type="button" data-cart-remove="${escapeHtml(item.id)}" aria-label="Remove product">
              ×
            </button>
          </div>

          <div class="cart-item-bottom">
            <div class="cart-item-controls">
              <button type="button" data-cart-decrease="${escapeHtml(item.id)}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-increase="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
            </div>

            <strong class="cart-line-total">${formatPrice(lineTotal)}</strong>
          </div>
        </article>
      `;
    })
    .join("");

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
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.cartRemove);
    });
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
    delivery.method === "delivery" && delivery.details
      ? `Delivery address / details: ${delivery.details}`
      : null,
    `Payment preference: ${PAYMENT_LABELS[payment.method] || "To be confirmed"}`,
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
