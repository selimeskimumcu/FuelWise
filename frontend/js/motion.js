/* FuelWise motion layer — shared by every page. */
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navbar = document.querySelector(".navbar");

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

    /* ---------- Scroll reveal ---------- */
    const revealItems = document.querySelectorAll("[data-reveal]");

    if (revealItems.length) {
        if (reduceMotion || !("IntersectionObserver" in window)) {
            revealItems.forEach(item => item.classList.add("is-in"));
        } else {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const item = entry.target;
                    const delay = Number(item.dataset.delay || 0) * 90;
                    item.style.transitionDelay = `${delay}ms`;
                    item.classList.add("is-in");
                    observer.unobserve(item);
                    // Hand the element back to its own hover transitions once revealed.
                    window.setTimeout(() => {
                        item.style.transitionDelay = "";
                        item.removeAttribute("data-reveal");
                    }, delay + 900);
                });
            }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });

            revealItems.forEach(item => observer.observe(item));
        }
    }

    /* ---------- Cursor spotlight on cards ---------- */
    if (window.matchMedia("(hover: hover)").matches) {
        document.querySelectorAll("[data-spotlight]").forEach(card => {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                card.style.setProperty("--my", `${event.clientY - rect.top}px`);
            });
        });
    }
})();
