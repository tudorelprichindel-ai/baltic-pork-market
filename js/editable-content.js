"use strict";
function applyEditableContent() {
  const file = location.pathname.split("/").pop() || "index.html";
  const page = window.GALAS_GROZS_PAGE_CONTENT?.find((p) => p.file === file);
  if (!page) return;
  const lang = getInterfaceLanguage();
  for (const field of page.fields) {
    const text = field.business ? businessText(field.business, window.GALAS_GROZS_SITE, lang) : field.text[lang];
    if (field.id === "seo-title") document.title = text;
    else if (field.id === "seo-description") document.querySelector('meta[name="description"]').content = text;
    else document.querySelectorAll(`[data-content-id="${field.id}"]`).forEach((el) => { el.textContent = text; });
  }
}
export function businessText(kind, site, lang) {
  const s = (key) => site[key]?.[lang] || site[key]?.lv || "";
  const texts = {
    lv: {
      orderDays: `Pasūtījumu dienas: ${s("orderDays")}.`,
      deliveryInfo: `Saņemšana: ${s("pickupLocation")}. Piegādes dienas: ${s("deliveryDays")}. Piegāde Rīgā pasūtījumiem virs ${site.freeDeliveryThreshold} € ir bez maksas. Piegādi ārpus Rīgas saskaņojiet WhatsApp.`,
      pickupPayment: `Izvēlieties saņemšanu (${s("pickupLocation")}) vai piegādi. Pēc apstiprinājuma maksājiet skaidrā naudā vai ar bankas pārskaitījumu.`,
      confirmationInfo: `Apstiprinām pieejamību, precīzu svaru, galīgo cenu un saņemšanu vai piegādi (${s("deliveryDays")}).`,
      orderInfo: `Pasūtījumu dienas: ${s("orderDays")}. Pievienojiet produktus grozam, izvēlieties saņemšanu vai piegādi un nosūtiet pieprasījumu WhatsApp. Pieejamību, precīzu svaru un galīgo summu apstiprinām pirms apmaksas.`
    },
    en: {
      orderDays: `Order days: ${s("orderDays")}.`,
      deliveryInfo: `Pickup: ${s("pickupLocation")}. Delivery days: ${s("deliveryDays")}. Free delivery in Riga for orders over €${site.freeDeliveryThreshold}. For delivery outside Riga, contact us on WhatsApp.`,
      pickupPayment: `Choose pickup (${s("pickupLocation")}) or delivery. Pay in cash or by bank transfer after confirmation.`,
      confirmationInfo: `We confirm availability, exact weight, final price and pickup or delivery (${s("deliveryDays")}).`,
      orderInfo: `Order days: ${s("orderDays")}. Add products to the cart, choose pickup or delivery and send the request on WhatsApp. Availability, exact weight and the final total are confirmed before payment.`
    },
    ru: {
      orderDays: `Дни приёма заказов: ${s("orderDays")}.`,
      deliveryInfo: `Самовывоз: ${s("pickupLocation")}. Дни доставки: ${s("deliveryDays")}. Доставка по Риге для заказов свыше ${site.freeDeliveryThreshold} € бесплатна. Доставку за пределы Риги согласуйте в WhatsApp.`,
      pickupPayment: `Выберите самовывоз (${s("pickupLocation")}) или доставку. Оплата наличными или банковским переводом после подтверждения.`,
      confirmationInfo: `Мы подтверждаем наличие, точный вес, итоговую цену и самовывоз или доставку (${s("deliveryDays")}).`,
      orderInfo: `Дни приёма заказов: ${s("orderDays")}. Добавьте товары в корзину, выберите самовывоз или доставку и отправьте запрос в WhatsApp. Наличие, точный вес и итоговая сумма подтверждаются до оплаты.`
    }
  };
  return texts[lang][kind];
}
if (typeof window !== "undefined") window.applyEditableContent = applyEditableContent;
