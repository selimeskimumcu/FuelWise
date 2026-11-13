/* FuelWise cookie consent.
   Necessary storage (sign-in cookies, language, this choice) is always on.
   Optional categories stay off until the visitor allows them; read the choice with
   FuelWiseConsent.allows("analytics") or listen for the "fuelwise:consent" event. */
(() => {
    const STORAGE_KEY = "fuelwise-consent";
    const VERSION = 1;
    const inPages = location.pathname.includes("/pages/");
    const privacyHref = `${inPages ? "" : "pages/"}privacy.html#cookies`;

    const copy = {
        en: {
            title: "Your cookie preferences",
            text: "FuelWise uses necessary cookies to keep you signed in and remember your language. We do not use advertising cookies. Optional cookies stay off unless you allow them.",
            policy: "Cookie details",
            accept: "Accept all",
            reject: "Reject optional",
            options: "Preferences",
            save: "Save choices",
            necessary: "Necessary",
            necessaryText: "Sign-in session, language choice and this preference. The site cannot work without them.",
            analytics: "Analytics",
            analyticsText: "Anonymous usage statistics. FuelWise does not use any today; if we add them, they will only run with this switch on."
        },
        tr: {
            title: "Çerez tercihleriniz",
            text: "FuelWise, oturumunuzu açık tutmak ve dil seçiminizi hatırlamak için zorunlu çerezler kullanır. Reklam çerezi kullanmıyoruz. İsteğe bağlı çerezler siz izin vermedikçe kapalı kalır.",
            policy: "Çerez ayrıntıları",
            accept: "Tümünü kabul et",
            reject: "İsteğe bağlıları reddet",
            options: "Tercihler",
            save: "Seçimleri kaydet",
            necessary: "Zorunlu",
            necessaryText: "Oturum, dil seçimi ve bu tercih. Site bunlar olmadan çalışamaz.",
            analytics: "Analitik",
            analyticsText: "Anonim kullanım istatistikleri. FuelWise şu anda hiç kullanmıyor; eklersek yalnızca bu anahtar açıkken çalışır."
        },
        ru: {
            title: "Настройки cookie",
            text: "FuelWise использует необходимые cookie, чтобы сохранять вход и язык. Рекламных cookie нет. Необязательные cookie выключены, пока вы их не разрешите.",
            policy: "Подробнее о cookie",
            accept: "Принять все",
            reject: "Отклонить необязательные",
            options: "Настройки",
            save: "Сохранить выбор",
            necessary: "Необходимые",
            necessaryText: "Сессия входа, выбор языка и эта настройка. Без них сайт не работает.",
            analytics: "Аналитика",
            analyticsText: "Анонимная статистика использования. Сейчас FuelWise её не использует; если добавим, она будет работать только при включённом переключателе."
        },
        zh: {
            title: "您的 Cookie 偏好",
            text: "FuelWise 使用必要的 Cookie 来保持登录状态并记住您的语言。我们不使用广告 Cookie。可选 Cookie 在您允许之前保持关闭。",
            policy: "Cookie 详情",
            accept: "全部接受",
            reject: "拒绝可选项",
            options: "偏好设置",
            save: "保存选择",
            necessary: "必要",
            necessaryText: "登录会话、语言选择和此偏好。网站运行离不开它们。",
            analytics: "分析",
            analyticsText: "匿名使用统计。FuelWise 目前未使用；若日后添加，仅在此开关打开时运行。"
        }
    };

    function read() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return stored && stored.version === VERSION ? stored : null;
        } catch {
            return null;
        }
    }

    function currentLanguage() {
        const saved = localStorage.getItem("fuelwise-language");
        const browser = navigator.language?.slice(0, 2);
        return copy[saved] ? saved : (copy[browser] ? browser : "en");
    }

    let consent = read();
    let language = currentLanguage();
    let banner = null;

    function save(analytics) {
        consent = { version: VERSION, analytics: Boolean(analytics), decidedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        close();
        document.dispatchEvent(new CustomEvent("fuelwise:consent", { detail: consent }));
    }

    function render() {
        const text = copy[language];
        const showOptions = banner.classList.contains("show-options");
        const analyticsOn = banner.querySelector("[data-cookie='analytics']")?.checked ?? Boolean(consent?.analytics);

        banner.innerHTML = `
            <h2 id="cookie-consent-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>
                ${text.title}
            </h2>
            <p>${text.text} <a href="${privacyHref}">${text.policy}</a></p>
            <div class="cookie-options"><div>
                <div class="cookie-option">
                    <div><strong>${text.necessary}</strong><span>${text.necessaryText}</span></div>
                    <label class="cookie-switch"><input type="checkbox" checked disabled aria-label="${text.necessary}"><i></i></label>
                </div>
                <div class="cookie-option">
                    <div><strong>${text.analytics}</strong><span>${text.analyticsText}</span></div>
                    <label class="cookie-switch"><input type="checkbox" data-cookie="analytics" aria-label="${text.analytics}" ${analyticsOn ? "checked" : ""}><i></i></label>
                </div>
            </div></div>
            <div class="cookie-actions">
                <button type="button" class="cookie-accept" data-cookie-action="accept">${text.accept}</button>
                <button type="button" data-cookie-action="reject">${text.reject}</button>
                <button type="button" data-cookie-action="options" aria-expanded="${showOptions}">${showOptions ? text.save : text.options}</button>
            </div>`;
    }

    function build() {
        banner = document.createElement("section");
        banner.className = "cookie-consent";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-labelledby", "cookie-consent-title");
        banner.addEventListener("click", event => {
            const action = event.target.closest("[data-cookie-action]")?.dataset.cookieAction;
            if (action === "accept") save(true);
            if (action === "reject") save(false);
            if (action === "options") {
                if (banner.classList.contains("show-options")) {
                    save(banner.querySelector("[data-cookie='analytics']").checked);
                } else {
                    banner.classList.add("show-options");
                    render();
                }
            }
        });
        document.body.append(banner);
        render();
    }

    function open(withOptions = false) {
        if (!banner) build();
        banner.classList.toggle("show-options", withOptions);
        render();
        // Next frame so the slide-up transition runs.
        requestAnimationFrame(() => banner.classList.add("is-open"));
        window.setTimeout(() => banner.classList.add("is-open"), 60);
    }

    function close() {
        banner?.classList.remove("is-open");
    }

    // "Cookie Preferences" links anywhere on the site reopen the panel.
    document.addEventListener("click", event => {
        if (!event.target.closest("[data-cookie-settings]")) return;
        event.preventDefault();
        open(true);
    });

    document.addEventListener("fuelwise:language", event => {
        if (!copy[event.detail]) return;
        language = event.detail;
        if (banner) render();
    });

    window.FuelWiseConsent = {
        get: () => consent,
        allows: category => category === "necessary" || Boolean(consent?.[category]),
        open: () => open(true)
    };

    if (!consent) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => window.setTimeout(open, 700));
        } else {
            window.setTimeout(open, 700);
        }
    }
})();
