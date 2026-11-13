/* Renders the Privacy Policy / Terms of Service page in the active language.
   Needs legal-content.js; runs before motion.js so the sections join the scroll reveal. */
(() => {
    const { updated, labels, documents } = window.FuelWiseLegal;
    const documentKey = document.body.dataset.legal;
    const versions = documents[documentKey];
    const hero = document.getElementById("legal-hero");
    const toc = document.getElementById("legal-toc");
    const body = document.getElementById("legal-body");
    if (!versions || !hero || !toc || !body) return;

    let rendered = null;
    let spy = null;

    function detectLanguage() {
        const saved = localStorage.getItem("fuelwise-language");
        const browser = navigator.language?.slice(0, 2);
        return versions[saved] ? saved : (versions[browser] ? browser : "en");
    }

    function render(language) {
        if (!versions[language] || language === rendered) return;
        rendered = language;
        const text = versions[language];
        const label = labels[language];
        const date = new Date(`${updated}T00:00:00`).toLocaleDateString(language === "zh" ? "zh-CN" : language, {
            year: "numeric", month: "long", day: "numeric"
        });

        document.title = text.pageTitle;

        hero.innerHTML = `
            <p class="section-badge"><i data-lucide="${documentKey === "privacy" ? "shield-check" : "scroll-text"}" aria-hidden="true"></i>${text.badge}</p>
            <h1>${text.title}<span>${text.accent}</span></h1>
            <p>${text.lead}</p>
            <div class="legal-updated"><i data-lucide="calendar-days" aria-hidden="true"></i>${label.updated}: ${date}</div>`;

        toc.innerHTML = `<h2>${label.toc}</h2><ol>${text.sections.map(([id, heading]) => `<li><a href="#${id}">${heading}</a></li>`).join("")}</ol>`;

        body.innerHTML = text.sections.map(([id, heading, blocks], index) => `
            <section class="legal-section" id="${id}">
                <h2><small>${String(index + 1).padStart(2, "0")}</small>${heading}</h2>
                ${blocks.map(block => Array.isArray(block)
                    ? `<ul>${block.map(item => `<li>${item}</li>`).join("")}</ul>`
                    : `<p>${block}</p>`).join("")}
            </section>`).join("") + `<p class="legal-note">${text.note}</p>`;

        window.lucide?.createIcons();
        watchSections();
    }

    // Highlight the section being read in the table of contents.
    function watchSections() {
        spy?.disconnect();
        if (!("IntersectionObserver" in window)) return;
        const links = new Map([...toc.querySelectorAll("a")].map(link => [link.getAttribute("href").slice(1), link]));
        spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(link => link.classList.remove("active"));
                links.get(entry.target.id)?.classList.add("active");
            });
        }, { rootMargin: "-25% 0px -60% 0px" });
        body.querySelectorAll(".legal-section").forEach(section => spy.observe(section));
    }

    render(detectLanguage());
    document.addEventListener("fuelwise:language", event => render(event.detail));
})();
