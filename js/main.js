const WHATSAPP_NUMBER = "371XXXXXXXX"; // Replace with real Latvian WhatsApp number
const CART_STORAGE_KEY = "balticMeatMarketCart";

const PRODUCT_PRICE_MAP = {
  "Pork Neck": { category: "Pork", price: 6.5, unit: "kg" },
  "Pork Shoulder": { category: "Pork", price: 5.5, unit: "kg" },
  "Pork Belly": { category: "Pork", price: 6.9, unit: "kg" },
  "Pork Ribs": { category: "Pork", price: 6.95, unit: "kg" },
  "Pork Loin": { category: "Pork", price: 7.2, unit: "kg" },
  "Minced Pork": { category: "Pork", price: 5.99, unit: "kg" },

  "Beef Steak Cuts": { category: "Beef", price: 16.9, unit: "kg" },
  "Beef Ribs": { category: "Beef", price: 12.9, unit: "kg" },
  "Minced Beef": { category: "Beef", price: 10.9, unit: "kg" },
  "Beef Stew Meat": { category: "Beef", price: 11.9, unit: "kg" },
  "Beef Roast": { category: "Beef", price: 15.5, unit: "kg" },
  "Beef Burger Patties": { category: "Beef / BBQ", price: 11.9, unit: "kg" },

  "Lamb Leg": { category: "Lamb", price: 18.9, unit: "kg" },
  "Lamb Shoulder": { category: "Lamb", price: 14.9, unit: "kg" },
  "Lamb Chops": { category: "Lamb", price: 24.9, unit: "kg" },
  "Lamb Ribs": { category: "Lamb", price: 18.9, unit: "kg" },
  "Minced Lamb": { category: "Lamb", price: 16.9, unit: "kg" },
  "Lamb Stew Meat": { category: "Lamb", price: 15.9, unit: "kg" },

  "Chicken Breast": { category: "Chicken", price: 7.9, unit: "kg" },
  "Chicken Thighs": { category: "Chicken", price: 5.9, unit: "kg" },
  "Chicken Wings": { category: "Chicken", price: 3.9, unit: "kg" },
  "Chicken Drumsticks": { category: "Chicken", price: 4.5, unit: "kg" },
  "Whole Chicken": { category: "Chicken", price: 3.9, unit: "kg" },
  "Marinated Chicken": { category: "Chicken", price: 6.9, unit: "kg" },

  "Marinated Pork Neck": { category: "BBQ & Grill", price: 7.9, unit: "kg" },
  "BBQ Ribs": { category: "BBQ & Grill", price: 8.9, unit: "kg" },
  "Chicken Skewers": { category: "BBQ & Grill", price: 7.9, unit: "kg" },
  "Lamb Skewers": { category: "BBQ & Grill", price: 17.9, unit: "kg" },
  "Grill Sausages": { category: "BBQ & Grill", price: 7.99, unit: "kg" },

  "Smoked Bacon": { category: "Smoked Products", price: 10.9, unit: "kg" },
  "Smoked Pork Ribs": { category: "Smoked Products", price: 9.9, unit: "kg" },
  "Smoked Sausages": { category: "Smoked Products", price: 8.9, unit: "kg" },
  "Smoked Pork Loin": { category: "Smoked Products", price: 12.9, unit: "kg" },

  "Family Meat Box": { category: "Meat Boxes", price: 49, unit: "box" },
  "BBQ Box": { category: "Meat Boxes", price: 45, unit: "box" },
  "Pork Box": { category: "Meat Boxes", price: 35, unit: "box" },
  "Beef Box": { category: "Meat Boxes", price: 55, unit: "box" },
  "Lamb Box": { category: "Meat Boxes", price: 59, unit: "box" },
  "Chicken Box": { category: "Meat Boxes", price: 29, unit: "box" }
};

document.addEventListener("DOMContentLoaded", () => {
  initForms();
  initDropdownNavigation();
  initCart();
});

function initForms() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const message = buildOrderMessage(formData);
      const whatsappUrl = buildWhatsappUrl(message);

      showFormMessage(form, whatsappUrl);
    });
  });
}

function buildOrderMessage(formData) {
  const name = getValue(formData, "name");
  const phone = getValue(formData, "phone");
  const email = getValue(formData, "email");
  const products = getValue(formData, "products") || getValue(formData, "message");
  const delivery = getValue(formData, "delivery");
  const cart = getCart();

  const cartText = cart.length > 0 ? buildCartMessageSection(cart) : "";

  return `
Hello Baltic Meat Market,

I would like to request an order.

Name: ${name || "Not provided"}
Phone/WhatsApp: ${phone || "Not provided"}
Email: ${email || "Not provided"}

Products requested:
${cartText || products || "Not provided"}

Pickup or delivery preference: ${delivery || "Not provided"}

Please confirm availability, final weight, final price and pickup or delivery details.

Thank you.
  `.trim();
}

function getValue(formData, key) {
  const value = formData.get(key);
  return value ? value.toString().trim() : "";
}

function showFormMessage(form, whatsappUrl) {
  let message = form.querySelector(".form-status");

  if (!message) {
    message = document.createElement("div");
    message.className = "form-status";
    form.appendChild(message);
  }

  message.innerHTML = `
    <p>Your order request is ready.</p>
    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">
      Send on WhatsApp
    </a>
  `;
}

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

    const links = dropdown.querySelectorAll(".nav-dropdown-menu a");

    links.forEach((link) => {
      link.addEventListener("click", () => {
        closeAllDropdowns();
      });
    });
  });

  document.addEventListener("click", () => {
    closeAllDropdowns();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllDropdowns();
      closeCart();
    }
  });
}

function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll(".nav-dropdown");

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");

    dropdown.classList.remove("open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

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
          Request Order on WhatsApp
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

    const productName = titleElement.textContent.trim();
    const productData = PRODUCT_PRICE_MAP[productName];

    if (!productData) return;

    if (!card.querySelector(".cart-product-price")) {
      const priceBadge = document.createElement("div");
      priceBadge.className = "cart-product-price";
      priceBadge.innerHTML = `
        <span>Approx. price</span>
        <strong>${formatCurrency(productData.price)} / ${productData.unit}</strong>
      `;

      titleElement.insertAdjacentElement("afterend", priceBadge);
    }

    button.textContent = "Add to Cart";
    button.setAttribute("href", "#");
    button.setAttribute("data-add-to-cart", productName);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      addToCart(productName);
      openCart();
    });
  });
}

function bindCartEvents() {
  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-cart-open]");
    const closeButton = event.target.closest("[data-cart-close]");
    const overlay = event.target.matches("[data-cart-overlay]");
    const increaseButton = event.target.closest("[data-cart-increase]");
    const decreaseButton = event.target.closest("[data-cart-decrease]");
    const removeButton = event.target.closest("[data-cart-remove]");
    const requestButton = event.target.closest("[data-cart-request]");
    const clearButton = event.target.closest("[data-cart-clear]");

    if (openButton) {
      openCart();
      return;
    }

    if (closeButton || overlay) {
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

function addToCart(productName) {
  const productData = PRODUCT_PRICE_MAP[productName];

  if (!productData) return;

  const cart = getCart();
  const productId = createProductId(productName);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      category: productData.category,
      price: productData.price,
      unit: productData.unit,
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
    const filteredCart = cart.filter((cartItem) => cartItem.id !== productId);
    saveCart(filteredCart);
  } else {
    saveCart(cart);
  }

  renderCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
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
      const itemTotal = item.price * item.quantity;

      return `
        <article class="cart-item">
          <div class="cart-item-main">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.category)} · ${formatCurrency(item.price)} / ${escapeHtml(item.unit)}</p>
            <strong>${formatCurrency(itemTotal)}</strong>
          </div>

          <div class="cart-item-controls">
            <button type="button" data-cart-decrease="${escapeHtml(item.id)}">−</button>
            <span>${item.quantity} ${escapeHtml(item.unit)}</span>
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
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function requestCartOrder() {
  const cart = getCart();

  if (cart.length === 0) {
    openCart();
    return;
  }

  const message = `
Hello Baltic Meat Market,

I would like to request an order based on my cart:

${buildCartMessageSection(cart)}

Estimated total: ${formatCurrency(calculateCartTotal(cart))}

I understand that prices are informative and that final availability, final weight and final price must be confirmed manually.

Please confirm pickup or local delivery options.

Thank you.
  `.trim();

  window.open(buildWhatsappUrl(message), "_blank", "noopener,noreferrer");
}

function buildCartMessageSection(cart) {
  return cart
    .map((item, index) => {
      const itemTotal = item.price * item.quantity;

      return `${index + 1}. ${item.name} — ${item.quantity} ${item.unit} × approx. ${formatCurrency(item.price)} / ${item.unit} = approx. ${formatCurrency(itemTotal)}`;
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

function createProductId(productName) {
  return productName
    .toLowerCase()
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
