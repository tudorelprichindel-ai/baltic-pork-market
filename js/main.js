document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      showFormMessage(form);
    });
  });
});

function showFormMessage(form) {
  let message = form.querySelector(".form-status");

  if (!message) {
    message = document.createElement("p");
    message.className = "form-status";
    form.appendChild(message);
  }

  message.textContent =
    "This demo form is not connected yet. The next step is to connect it to email or WhatsApp.";
}
