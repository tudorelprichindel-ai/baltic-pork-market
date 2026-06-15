document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const message = buildOrderMessage(formData);
      const whatsappNumber = "371XXXXXXXX"; // Replace with real Latvian WhatsApp number

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      showFormMessage(form, whatsappUrl);
    });
  });
});

function buildOrderMessage(formData) {
  const name = getValue(formData, "name");
  const phone = getValue(formData, "phone");
  const email = getValue(formData, "email");
  const products = getValue(formData, "products") || getValue(formData, "message");
  const delivery = getValue(formData, "delivery");

  return `
Hello Baltic Pork Market,

I would like to request an order.

Name: ${name || "Not provided"}
Phone/WhatsApp: ${phone || "Not provided"}
Email: ${email || "Not provided"}

Products requested:
${products || "Not provided"}

Pickup or delivery preference: ${delivery || "Not provided"}

Please confirm availability, final weight and price.

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
