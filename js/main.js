const WHATSAPP_NUMBER = "37129174626";
const CART_STORAGE_KEY = "galasGrozsCart";

const PRODUCT_PRICE_MAP = {
  "Cūkgaļas karbonāde bez ribas, bez ādas": {
    category: "Cūkgaļa",
    price: 7.5,
    unit: "kg"
  },
  "Cūkgaļas karbonāde ar speķi un ādu": {
    category: "Cūkgaļa",
    price: 6.5,
    unit: "kg"
  },
  "Cūkgaļas kakla karbonāde": {
    category: "Cūkgaļa",
    price: 7.5,
    unit: "kg"
  },
  "Cūkgaļas fileja": {
    category: "Cūkgaļa",
    price: 8.5,
    unit: "kg"
  },
  "Cūkgaļas gurna gabals bez ādas": {
    category: "Cūkgaļa",
    price: 6.5,
    unit: "kg"
  },
  "Cūkgaļas gurna gabals ar ādu": {
    category: "Cūkgaļa",
    price: 6.0,
    unit: "kg"
  },
  "Cūkgaļas šķiņķis bez kaula ar ādu": {
    category: "Cūkgaļa",
    price: 5.5,
    unit: "kg"
  },
  "Cūkgaļas šķiņķis bez kaula, bez ādas": {
    category: "Cūkgaļa",
    price: 5.7,
    unit: "kg"
  },
  "Cūkgaļas krūtiņa ar ribu": {
    category: "Cūkgaļa",
    price: 6.5,
    unit: "kg"
  },
  "Cūkgaļas pavēdere": {
    category: "Cūkgaļa",
    price: 5.8,
    unit: "kg"
  },
  "Cūkgaļas ribas ar ādu, ar treknumu": {
    category: "Cūkgaļa",
    price: 7.0,
    unit: "kg"
  },
  "Cūkgaļas plecs/lāpstiņa ar kaulu, ar ādu": {
    category: "Cūkgaļa",
    price: 4.8,
    unit: "kg"
  },
  "Cūkgaļas plecs bez kaula, bez ādas": {
    category: "Cūkgaļa",
    price: 5.5,
    unit: "kg"
  },
  "Cūkgaļas stilbi": {
    category: "Cūkgaļa",
    price: 2.5,
    unit: "kg"
  },
  "Cūkgaļas ribas": {
    category: "Cūkgaļa",
    price: 1.5,
    unit: "kg"
  },
  "Cūkgaļas maltā gaļa": {
    category: "Cūkgaļa",
    price: 5.5,
    unit: "kg"
  }
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
  const delivery = getValue(formData, "delivery");
  const message = getValue(formData, "message");
  const cart = getCart();

  const cartText = cart.length > 0 ? buildCartMessageSection(cart) : "";

  return `
Labdien, Gaļas grozs!

Vēlos veikt pasūtījuma pieprasījumu.

Vārds: ${name || "Nav norādīts"}
Telefons / WhatsApp: ${phone || "Nav norādīts"}
E-pasts: ${email || "Nav norādīts"}

Pasūtījums:
${cartText || message || "Nav norādīts"}

Saņemšana / piegāde: ${delivery || "Jāprecizē"}

Lūdzu, apstipriniet pieejamību, gala svaru, gala cenu un saņemšanas vai piegādes iespējas.

Paldies!
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
    <p>Pasūtījuma pieprasījums ir sagatavots.</p>
    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">
      Nosūtīt WhatsApp
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
    <span>Grozs</span>
    <strong data-cart-count>0</strong>
  `;

  const cartOverlay = document.createElement("div");
  cartOverlay.className = "cart-overlay";
  cartOverlay.setAttribute("data-cart-overlay", "");
  cartOverlay.innerHTML = `
    <aside class="cart-drawer" aria-label="Pirkumu grozs">
      <div class="cart-header">
        <div>
          <p class="cart-kicker">Pasūtījums</p>
          <h2>Jūsu grozs</h2>
        </div>

        <button class="cart-close" type="button" data-cart-close aria-label="Aizvērt grozu">
          ×
        </button>
      </div>

      <div class="cart-items" data-cart-items></div>

      <div class="cart-footer">
        <div class="cart-summary-line">
          <span>Aptuvenā summa</span>
          <strong data-cart-total>0,00 €</strong>
        </div>

        <p class="cart-note">
          Cenas ir informatīvas. Gala svars, pieejamība un gala cena tiek apstiprināta manuāli.
        </p>

        <button class="cart-request-btn" type="button" data-cart-request>
          Nosūtīt pieprasījumu WhatsApp
        </button>

        <button class="cart-clear-btn" type="button" data-cart-clear>
          Iztīrīt grozu
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
        <span>Cena</span>
        <strong>${formatCurrency(productData.price)} / ${productData.unit}</strong>
      `;

      titleElement.insertAdjacentElement("afterend", priceBadge);
    }

    button.textContent = "Pievienot grozam";
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
        <p>Grozs ir tukšs.</p>
        <span>Pievienojiet produktus no kataloga, lai sagatavotu pasūtījumu.</span>
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
            Noņemt
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
Labdien, Gaļas grozs!

Vēlos veikt pasūtījuma pieprasījumu:

${buildCartMessageSection(cart)}

Aptuvenā summa: ${formatCurrency(calculateCartTotal(cart))}

Saprotu, ka cenas ir informatīvas un gala pieejamība, gala svars un gala cena tiek apstiprināta manuāli.

Lūdzu, apstipriniet saņemšanas vai piegādes iespējas.

Paldies!
  `.trim();

  window.open(buildWhatsappUrl(message), "_blank", "noopener,noreferrer");
}

function buildCartMessageSection(cart) {
  return cart
    .map((item, index) => {
      const itemTotal = item.price * item.quantity;

      return `${index + 1}. ${item.name} — ${item.quantity} ${item.unit} × ${formatCurrency(item.price)} / ${item.unit} = aptuveni ${formatCurrency(itemTotal)}`;
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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("lv-LV", {
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
