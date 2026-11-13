/* FuelWise — home page animations. Needs motion.js; loaded before i18n.js so cloned text gets translated. */
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const formatNumber = (value, digits = 0) => Number(value).toLocaleString("tr-TR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });

    /* ---------- Marquee: duplicate the group for a seamless loop ---------- */
    const marqueeGroup = document.querySelector(".marquee-group");
    if (marqueeGroup) {
        const clone = marqueeGroup.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        marqueeGroup.after(clone);
    }

    /* ---------- Live trip card ---------- */
    const card = document.querySelector(".trip-live");
    let fuelPrice = 55; // ₺/L sample value; replaced by the official average when it loads

    if (card) {
        const routes = [
            { from: "Istanbul", to: "Izmir", km: 483, path: "M52 58 C 120 40, 168 92, 128 128 S 150 196, 250 178 S 330 168, 352 150" },
            { from: "Ankara", to: "Antalya", km: 480, path: "M330 44 C 270 52, 300 108, 236 112 S 150 100, 132 148 S 96 182, 58 176" },
            { from: "Istanbul", to: "Ankara", km: 450, path: "M48 150 C 92 96, 138 168, 190 122 S 250 54, 296 86 S 340 78, 356 56" }
        ];
        const consumption = 6.4; // L/100 km sample vehicle
        const routePath = card.querySelector(".route");
        const routeBase = card.querySelector(".route-base");
        const car = card.querySelector(".car");
        const startPins = card.querySelectorAll(".pin.start, .pin-pulse.start");
        const endPins = card.querySelectorAll(".pin.end, .pin-pulse.end");
        const fields = {
            from: card.querySelector("[data-trip='from']"),
            to: card.querySelector("[data-trip='to']"),
            km: card.querySelector("[data-trip='km']"),
            fuel: card.querySelector("[data-trip='fuel']"),
            cost: card.querySelector("[data-trip='cost']"),
            progress: card.querySelector(".trip-progress")
        };
        let index = 0;
        let length = 0;
        let active = false;
        let timer = 0;
        let frame = 0;

        function render(progress) {
            const route = routes[index];
            const eased = easeInOut(progress);
            const point = routePath.getPointAtLength(length * eased);
            const km = route.km * eased;
            const fuel = km * consumption / 100;
            routePath.style.strokeDashoffset = length * (1 - eased);
            car.setAttribute("cx", point.x);
            car.setAttribute("cy", point.y);
            fields.km.textContent = `${formatNumber(Math.round(km))} km`;
            fields.fuel.textContent = `${formatNumber(fuel, 1)} L`;
            fields.cost.textContent = `₺${formatNumber(Math.round(fuel * fuelPrice))}`;
            fields.progress.style.setProperty("--p", eased.toFixed(4));
        }

        function load(routeIndex) {
            index = routeIndex;
            const route = routes[index];
            routePath.setAttribute("d", route.path);
            routeBase.setAttribute("d", route.path);
            length = routePath.getTotalLength();
            routePath.style.strokeDasharray = length;
            const start = routePath.getPointAtLength(0);
            const end = routePath.getPointAtLength(length);
            startPins.forEach(pin => { pin.setAttribute("cx", start.x); pin.setAttribute("cy", start.y); });
            endPins.forEach(pin => { pin.setAttribute("cx", end.x); pin.setAttribute("cy", end.y); });
            fields.from.textContent = route.from;
            fields.to.textContent = route.to;
        }

        function play() {
            const started = performance.now();
            const duration = 3200;

            function step(now) {
                if (!active) return;
                const progress = Math.min((now - started) / duration, 1);
                render(progress);
                if (progress < 1) {
                    frame = requestAnimationFrame(step);
                    return;
                }
                timer = window.setTimeout(() => {
                    card.classList.add("is-switching");
                    timer = window.setTimeout(() => {
                        load((index + 1) % routes.length);
                        render(0);
                        card.classList.remove("is-switching");
                        play();
                    }, 480);
                }, 2600);
            }

            frame = requestAnimationFrame(step);
        }

        function setActive(next) {
            if (next === active) return;
            active = next;
            window.clearTimeout(timer);
            cancelAnimationFrame(frame);
            card.classList.remove("is-switching");
            if (active) {
                render(0);
                play();
            }
        }

        load(0);

        if (reduceMotion) {
            render(1);
        } else {
            render(0);
            let visible = false;
            new IntersectionObserver(entries => {
                visible = entries[0].isIntersecting;
                setActive(visible && !document.hidden);
            }, { threshold: .2 }).observe(card);
            document.addEventListener("visibilitychange", () => setActive(visible && !document.hidden));

            // Gentle 3D tilt that follows the pointer
            const wrap = card.closest(".trip-live-wrap");
            if (wrap && window.matchMedia("(hover: hover)").matches) {
                wrap.addEventListener("pointermove", event => {
                    const rect = wrap.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width - .5;
                    const y = (event.clientY - rect.top) / rect.height - .5;
                    card.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
                    card.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
                });
                wrap.addEventListener("pointerleave", () => {
                    card.style.setProperty("--ry", "0deg");
                    card.style.setProperty("--rx", "0deg");
                });
            }
        }
    }

    /* ---------- Count-up numbers ---------- */
    const { countWhenVisible } = window.FuelWiseMotion;

    document.querySelectorAll("[data-count]").forEach(element => {
        countWhenVisible(element, Number(element.dataset.count));
    });

    /* ---------- Steps connector line ---------- */
    const stepsGrid = document.querySelector(".steps-grid");
    if (stepsGrid) {
        if (!("IntersectionObserver" in window)) {
            stepsGrid.classList.add("is-in");
        } else {
            const observer = new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting) return;
                observer.disconnect();
                stepsGrid.classList.add("is-in");
            }, { threshold: .35 });
            observer.observe(stepsGrid);
        }
    }

    /* ---------- Official pump prices (section stays hidden if the API is unreachable) ---------- */
    const pricesSection = document.querySelector(".home-prices");
    if (pricesSection) {
        fetch(`/api/v1/fuel-prices?${new URLSearchParams({ province: "İstanbul" })}`)
            .then(response => (response.ok ? response.json() : Promise.reject(new Error("Prices unavailable"))))
            .then(body => {
                let shown = 0;
                (body.prices || []).forEach(price => {
                    const value = Number(price.average_price);
                    const tile = pricesSection.querySelector(`[data-home-price="${price.fuel_type}"]`);
                    if (!tile || !Number.isFinite(value)) return;
                    shown++;
                    if (price.fuel_type === "gasoline") fuelPrice = value;
                    const output = tile.querySelector("strong");
                    output.textContent = `₺${formatNumber(value, 2)}`;
                    countWhenVisible(output, value, { digits: 2, prefix: "₺", duration: 1400 });
                });
                if (shown) pricesSection.hidden = false;
            })
            .catch(() => { /* keep the section hidden */ });
    }
})();
