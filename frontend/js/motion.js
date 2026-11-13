/* FuelWise motion layer — shared by every page. */
(() => {
    document.documentElement.classList.add("js");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const hasObserver = "IntersectionObserver" in window;
    const navbar = document.querySelector(".navbar");
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    /* ---------- Scroll progress + navbar state ---------- */
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.prepend(progress);

    let ticking = false;

    function updateScroll() {
        ticking = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty("--scroll", max > 0 ? Math.min(window.scrollY / max, 1).toFixed(4) : 0);
        navbar?.classList.toggle("navbar-scrolled", window.scrollY > 12);
    }

    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateScroll);
    }, { passive: true });
    window.addEventListener("resize", updateScroll);
    updateScroll();

    /* ---------- Mobile menu ---------- */
    const navButtons = navbar?.querySelector(".nav-buttons");
    const navLinks = navbar?.querySelector(".nav-links");

    if (navButtons && navLinks) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "nav-toggle";
        toggle.setAttribute("aria-label", "Menu");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "<span></span><span></span><span></span>";
        navButtons.append(toggle);

        const setOpen = open => {
            navbar.classList.toggle("nav-open", open);
            toggle.setAttribute("aria-expanded", String(open));
        };

        toggle.addEventListener("click", event => {
            event.stopPropagation();
            setOpen(!navbar.classList.contains("nav-open"));
        });
        document.addEventListener("click", event => {
            if (!navLinks.contains(event.target)) setOpen(false);
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") setOpen(false);
        });
    }

    /* ---------- Animated road background ---------- */
    const roadLayouts = {
        wide: [
            { points: [[-.05, .78], [.28, .5], [.5, 1.02], [1.05, .58]], speed: .055, offsets: [0, .52] },
            { points: [[-.05, .2], [.3, .46], [.62, -.08], [1.05, .3]], speed: .042, offsets: [.25, .8] },
            { points: [[.34, -.05], [.5, .35], [.2, .62], [.46, 1.05]], speed: .05, offsets: [.1] },
            { points: [[.7, -.05], [.56, .4], [.98, .55], [.78, 1.05]], speed: .047, offsets: [.4, .9] }
        ],
        band: [
            { points: [[-.05, .7], [.25, .2], [.55, 1.1], [1.05, .45]], speed: .05, offsets: [0, .5] },
            { points: [[-.05, .25], [.35, .75], [.7, -.1], [1.05, .8]], speed: .04, offsets: [.3, .75] }
        ]
    };

    function startRoads(canvas) {
        const context = canvas.getContext("2d");
        const roads = roadLayouts[canvas.dataset.roads] || roadLayouts.wide;
        let width = 0;
        let height = 0;
        let running = false;
        let frame = 0;

        const pointAt = (road, t) => {
            const [a, b, c, d] = road.points;
            const u = 1 - t;
            return [
                (u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0]) * width,
                (u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]) * height
            ];
        };

        function resize() {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function draw(time) {
            context.clearRect(0, 0, width, height);
            context.lineCap = "round";

            roads.forEach(road => {
                const [a, b, c, d] = road.points;
                context.beginPath();
                context.moveTo(a[0] * width, a[1] * height);
                context.bezierCurveTo(b[0] * width, b[1] * height, c[0] * width, c[1] * height, d[0] * width, d[1] * height);
                context.strokeStyle = "rgba(125, 211, 252, 0.07)";
                context.lineWidth = 1.5;
                context.stroke();

                road.offsets.forEach(offset => {
                    const head = (time / 1000 * road.speed + offset) % 1;
                    for (let step = 0; step < 18; step++) {
                        const t1 = head - step * .006;
                        const t2 = t1 - .006;
                        if (t2 < 0) break;
                        const [x1, y1] = pointAt(road, t1);
                        const [x2, y2] = pointAt(road, t2);
                        context.beginPath();
                        context.moveTo(x1, y1);
                        context.lineTo(x2, y2);
                        context.strokeStyle = `rgba(125, 211, 252, ${(.55 * (1 - step / 18)).toFixed(3)})`;
                        context.lineWidth = 2;
                        context.stroke();
                    }
                    const [x, y] = pointAt(road, head);
                    const glow = context.createRadialGradient(x, y, 0, x, y, 12);
                    glow.addColorStop(0, "rgba(186, 230, 253, 0.9)");
                    glow.addColorStop(1, "rgba(56, 189, 248, 0)");
                    context.fillStyle = glow;
                    context.beginPath();
                    context.arc(x, y, 12, 0, Math.PI * 2);
                    context.fill();
                });
            });
        }

        function loop(time) {
            if (!running) return;
            draw(time);
            frame = requestAnimationFrame(loop);
        }

        function setRunning(next) {
            if (next === running) return;
            running = next;
            cancelAnimationFrame(frame);
            if (running) frame = requestAnimationFrame(loop);
        }

        resize();
        window.addEventListener("resize", () => { resize(); if (!running) draw(4000); });

        if (reduceMotion || !hasObserver) {
            draw(4000);
            return;
        }

        let visible = true;
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            setRunning(visible && !document.hidden);
        }).observe(canvas);
        document.addEventListener("visibilitychange", () => setRunning(visible && !document.hidden));
    }

    function addBackdrop(host, layout, className) {
        const canvas = document.createElement("canvas");
        canvas.className = className;
        canvas.dataset.roads = layout;
        canvas.setAttribute("aria-hidden", "true");
        host.prepend(canvas);
        ["b1", "b2"].forEach(name => {
            const blob = document.createElement("div");
            blob.className = `fw-blob ${name}`;
            blob.setAttribute("aria-hidden", "true");
            host.prepend(blob);
        });
    }

    // Inner page heroes and the standalone account pages get the same living backdrop as the home page.
    document.querySelectorAll(".page-hero").forEach(hero => addBackdrop(hero, "band", "fw-roads"));
    if (document.body.classList.contains("register-page")) {
        const layer = document.createElement("div");
        layer.className = "fw-page-backdrop";
        layer.setAttribute("aria-hidden", "true");
        document.body.prepend(layer);
        addBackdrop(layer, "wide", "fw-roads");
    }
    const profileSection = document.querySelector(".profile-section");
    if (profileSection) addBackdrop(profileSection, "wide", "fw-roads");

    document.querySelectorAll("canvas[data-roads]").forEach(startRoads);

    /* ---------- Scroll reveal ---------- */
    // Sections on inner pages opt in automatically; the home page marks its own elements.
    const autoReveal = [
        [".content-section .section-heading", 0],
        [".content-section .split-layout > *", 1],
        [".glass-grid .glass-card", 1],
        [".empty-action", 0],
        [".fuel-price-search", 0],
        [".vehicle-layout", 0],
        [".route-map-card", 0],
        [".planner-form", 0],
        [".results-panel", 1],
        [".legal-toc", 0],
        [".legal-section", 0],
        [".site-footer .footer-container > *", 1]
    ];

    autoReveal.forEach(([selector, stagger]) => {
        document.querySelectorAll(selector).forEach(element => {
            if (element.hasAttribute("data-reveal")) return;
            element.setAttribute("data-reveal", "");
            if (stagger) {
                const index = Array.prototype.indexOf.call(element.parentElement.children, element);
                element.dataset.delay = String(Math.min(index, 5));
            }
        });
    });

    function reveal(item) {
        const delay = Number(item.dataset.delay || 0) * 90;
        item.style.transitionDelay = `${delay}ms`;
        item.classList.add("is-in");
        // Hand the element back to its own hover transitions once revealed.
        window.setTimeout(() => {
            item.style.transitionDelay = "";
            item.removeAttribute("data-reveal");
        }, delay + 900);
    }

    let revealObserver = null;

    function watchReveal(items) {
        if (reduceMotion || !hasObserver) {
            items.forEach(item => item.classList.add("is-in"));
            return;
        }
        revealObserver ||= new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                revealObserver.unobserve(entry.target);
                reveal(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
        items.forEach(item => revealObserver.observe(item));
    }

    watchReveal(document.querySelectorAll("[data-reveal]"));

    /* ---------- Cursor spotlight on cards ---------- */
    if (canHover) {
        const spotlightSelector = "[data-spotlight], .glass-card, .vehicle-card, .history-card, .result-card, .legal-section";
        document.addEventListener("pointermove", event => {
            const card = event.target.closest?.(spotlightSelector);
            if (!card) return;
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
            card.style.setProperty("--my", `${event.clientY - rect.top}px`);
        }, { passive: true });
    }

    /* ---------- Count-up numbers ---------- */
    function countUp(element, target, { digits = 0, prefix = "", suffix = "", duration = 1600, locale = "tr-TR" } = {}) {
        const format = value => prefix + Number(value).toLocaleString(locale, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }) + suffix;
        if (reduceMotion) {
            element.textContent = format(target);
            return;
        }
        const started = performance.now();
        function step(now) {
            const ratio = Math.min((now - started) / duration, 1);
            element.textContent = format(target * easeOut(ratio));
            if (ratio < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function countWhenVisible(element, target, options) {
        if (!hasObserver) {
            countUp(element, target, options);
            return;
        }
        const observer = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            countUp(element, target, options);
        }, { threshold: .5 });
        observer.observe(element);
    }

    // Static figures such as "2.5K+" or "98%" count up the first time they scroll into view.
    document.querySelectorAll(".metric strong, .footer-stat strong").forEach(element => {
        const match = element.textContent.trim().match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
        if (!match) return;
        const digits = (match[2].split(".")[1] || "").length;
        countWhenVisible(element, Number(match[2]), { digits, prefix: match[1], suffix: match[3], locale: "en-US" });
    });

    /* ---------- Highlight values when they change ---------- */
    const popTargets = document.querySelectorAll(".result-card strong, .price-value, [data-price-range], .route-distance-badge");

    if (popTargets.length && !reduceMotion && "MutationObserver" in window) {
        const popObserver = new MutationObserver(mutations => {
            const seen = new Set();
            mutations.forEach(mutation => {
                const element = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
                const target = element?.closest(".result-card strong, .price-value, [data-price-range], .route-distance-badge");
                if (!target || seen.has(target)) return;
                seen.add(target);
                target.classList.remove("fw-pop");
                void target.offsetWidth;
                target.classList.add("fw-pop");
            });
        });
        popTargets.forEach(target => popObserver.observe(target, { childList: true, characterData: true, subtree: true }));
    }

    window.FuelWiseMotion = { reduceMotion, countUp, countWhenVisible, watchReveal };
})();
