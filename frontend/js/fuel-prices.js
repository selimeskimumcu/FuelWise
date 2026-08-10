document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("fuel-price-search");
    const provinceInput = document.getElementById("fuel-price-province");
    const message = document.getElementById("fuel-price-message");
    const loader = document.getElementById("epdk-loader");
    const formatPrice = value => `₺${Number(value).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const phrases = {
        loading: { en: "Loading official EPDK prices...", tr: "Resmî EPDK fiyatları yükleniyor...", ru: "Загрузка официальных цен EPDK...", zh: "正在加载 EPDK 官方价格..." },
        official: { en: "Official EPDK data", tr: "Resmî EPDK verisi", ru: "Официальные данные EPDK", zh: "EPDK 官方数据" },
        stale: { en: "Last known official EPDK data", tr: "Son bilinen resmî EPDK verisi", ru: "Последние доступные данные EPDK", zh: "最近的 EPDK 官方数据" },
        cached: { en: "Cached for", tr: "Önbellek süresi", ru: "Кэш на", zh: "缓存时长" },
        hours: { en: "hours", tr: "saat", ru: "ч.", zh: "小时" }
        ,wait: { en: "Please wait", tr: "Lütfen bekleyin", ru: "Пожалуйста, подождите", zh: "请稍候" }
    };
    const phrase = key => phrases[key][localStorage.getItem("fuelwise-language") || "en"];

    async function loadPrices() {
        const province = provinceInput.value.trim();
        if (!province) return;
        message.textContent = phrase("loading");
        form.classList.add("is-loading");
        loader.querySelector("strong").textContent = phrase("loading");
        loader.querySelector("small").textContent = phrase("wait");
        loader.setAttribute("aria-hidden", "false");
        document.body.classList.add("epdk-loading");
        try {
            const response = await fetch(`/api/v1/fuel-prices?${new URLSearchParams({ province })}`);
            const body = await response.json();
            if (!response.ok) throw new Error(body.detail || "Prices could not be loaded.");
            body.prices.forEach(price => {
                const card = document.querySelector(`[data-fuel-card="${price.fuel_type}"]`);
                if (!card) return;
                card.querySelector(".price-value").textContent = formatPrice(price.average_price);
                card.querySelector("[data-price-range]").textContent = Number(price.minimum_price) === Number(price.maximum_price)
                    ? formatPrice(price.average_price)
                    : `${formatPrice(price.minimum_price)} – ${formatPrice(price.maximum_price)}`;
                card.querySelector("[data-observed]").textContent = price.observed_at;
            });
            const provinceName = body.prices[0]?.province_name || province;
            const stale = body.prices.some(price => price.stale);
            message.textContent = `${provinceName} · ${stale ? phrase("stale") : phrase("official")} · ${phrase("cached")} ${body.cache_hours} ${phrase("hours")}`;
        } catch (error) {
            message.textContent = error.message;
        } finally {
            form.classList.remove("is-loading");
            document.body.classList.remove("epdk-loading");
            loader.setAttribute("aria-hidden", "true");
        }
    }

    form.addEventListener("submit", event => { event.preventDefault(); loadPrices(); });
    loadPrices();
});
