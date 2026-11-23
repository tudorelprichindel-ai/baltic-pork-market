/* GA4 basic consent mode: no Google requests before analytics consent. */
(() => {
  "use strict";
  const id = "G-CKDVENGG9D";
  const key = "galasGrozsAnalyticsConsent";
  const maxAge = 180 * 86400000;
  const copy = {
    lv: ["Vietnes statistika", "Ar jūsu piekrišanu izmantojam Google Analytics, lai uzzinātu, kā tiek izmantota mūsu vietne. Google saņem apmeklējuma datus un pārlūkprogrammas informāciju; analītikas sīkdatnes glabājas līdz 180 dienām. Izvēle neietekmē pasūtīšanu. Piekrišanu var atsaukt sadaļā “Sīkdatņu iestatījumi”.", "Atļaut analītiku", "Noraidīt", "Sīkdatņu iestatījumi", "Google privātuma politika"],
    en: ["Website statistics", "With your permission, we use Google Analytics to understand how our website is used. Google receives visit data and browser information; analytics cookies last up to 180 days. Your choice does not affect ordering. You can withdraw consent in Cookie settings.", "Allow analytics", "Reject", "Cookie settings", "Google privacy policy"],
    ru: ["Статистика сайта", "С вашего согласия мы используем Google Analytics для анализа посещений сайта. Google получает данные о посещениях и браузере; аналитические cookie хранятся до 180 дней. Ваш выбор не влияет на оформление заказа. Согласие можно отозвать в настройках cookie.", "Разрешить аналитику", "Отклонить", "Настройки cookie", "Политика конфиденциальности Google"]
  };
  let language;
  try { language = localStorage.getItem("galasGrozsLanguage"); } catch {}
  const text = copy[language] || copy.lv;
  let choice = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && ["granted", "denied"].includes(saved.value) && Date.now() - saved.time < maxAge) choice = saved.value;
  } catch {}
  const preview = location.hostname !== "www.galasgrozs.lv";
  let started = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  function enable() {
    window["ga-disable-" + id] = false;
    gtag("consent", "update", { analytics_storage: "granted" });
    if (started || preview) return;
    started = true;
    gtag("js", new Date());
    // Exclude query strings and fragments, which can contain order details.
    gtag("config", id, { page_location: location.origin + location.pathname, page_referrer: document.referrer.split(/[?#]/)[0], allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, cookie_update: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.append(script);
  }
  function clearCookies() {
    for (const item of document.cookie.split(";")) {
      const name = item.trim().split("=")[0];
      if (name !== "_ga" && !name.startsWith("_ga_")) continue;
      for (const domain of ["", location.hostname, ".galasgrozs.lv"]) {
        document.cookie = name + "=; Max-Age=0; Path=/" + (domain ? "; Domain=" + domain : "");
      }
    }
  }
  const style = document.createElement("style");
  style.textContent = ".gg-consent{position:fixed;inset:auto 12px 12px;z-index:10000;max-width:660px;margin:auto;padding:20px;background:#fffaf3;color:#321b1e;border:1px solid #7d1824;border-radius:12px;box-shadow:0 4px 24px #0003;font:14px/1.5 system-ui}.gg-consent[hidden]{display:none}.gg-consent h2{margin:0 0 8px;font-size:19px}.gg-consent p{margin:0 0 12px}.gg-consent a{color:#7d1824;text-decoration:underline}.gg-consent-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}.gg-consent button,.gg-cookie-settings{font:inherit;cursor:pointer;padding:10px 18px;border:1px solid #7d1824;border-radius:6px;background:#fffaf3;color:#7d1824}.gg-consent button:focus-visible,.gg-cookie-settings:focus-visible{outline:3px solid #2367c9;outline-offset:3px}.gg-cookie-settings{display:block;margin:16px auto;font:13px system-ui}";
  document.head.append(style);
  const panel = document.createElement("section");
  panel.className = "gg-consent";
  panel.setAttribute("aria-label", text[0]);
  panel.hidden = choice !== null;
  const title = document.createElement("h2"); title.textContent = text[0];
  const description = document.createElement("p"); description.textContent = text[1];
  const privacy = document.createElement("a"); privacy.href = "https://policies.google.com/privacy"; privacy.textContent = text[5]; privacy.target = "_blank"; privacy.rel = "noopener noreferrer";
  const actions = document.createElement("div"); actions.className = "gg-consent-actions";
  const settings = document.createElement("button"); settings.type = "button"; settings.className = "gg-cookie-settings"; settings.textContent = text[4];
  let openedBySettings = false;
  for (const [value, label] of [["granted", text[2]], ["denied", text[3]]]) {
    const button = document.createElement("button"); button.type = "button"; button.textContent = label;
    button.addEventListener("click", () => {
      choice = value;
      try { localStorage.setItem(key, JSON.stringify({value, time: Date.now()})); } catch {}
      panel.hidden = true;
      if (value === "granted") enable();
      else {
        window["ga-disable-" + id] = true;
        if (started) gtag("consent", "update", { analytics_storage: "denied" });
        clearCookies();
        if (started) location.reload();
      }
      if (openedBySettings) settings.focus();
    });
    actions.append(button);
  }
  panel.append(title, description, privacy, actions);
  document.body.append(panel);
  (document.querySelector("footer") || document.body).append(settings);
  settings.addEventListener("click", () => { openedBySettings = true; panel.hidden = false; actions.querySelector("button").focus(); });
  if (choice === "granted") enable();
  else { window["ga-disable-" + id] = true; clearCookies(); }
})();
