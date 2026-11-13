document.addEventListener("DOMContentLoaded", () => {
    const loginButtons = document.querySelectorAll(".login-btn");

    if (!loginButtons.length) return;

    document.body.insertAdjacentHTML("beforeend", `
        <div class="login-modal-overlay" id="login-modal" aria-hidden="true">
            <section class="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
                <button type="button" class="login-close" aria-label="Close login window">&#10005;</button>
                <div class="login-heading">
                    <a href="${location.pathname.includes("/pages/") ? "../index.html" : "index.html"}" class="login-logo">Fuel<span>Wise</span></a>
                    <h2 id="login-title">Welcome</h2>
                    <p>Sign in to continue your smarter journey.</p>
                </div>
                <form class="login-form">
                    <div class="login-field">
                        <label for="login-username">Username</label>
                        <div class="login-input-wrap">
                            <i data-lucide="user" aria-hidden="true"></i>
                            <input id="login-username" name="username" type="text" placeholder="Enter your username" autocomplete="username" required>
                        </div>
                    </div>
                    <div class="login-field">
                        <label for="login-password">Password</label>
                        <div class="login-input-wrap">
                            <i data-lucide="lock-keyhole" aria-hidden="true"></i>
                            <input id="login-password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required>
                        </div>
                    </div>
                    <p class="caps-lock-warning" role="status"><i data-lucide="triangle-alert" aria-hidden="true"></i>Caps Lock is on</p>
                    <p class="login-message" role="alert"></p>
                    <button type="submit" class="primary-btn login-submit"><i data-lucide="log-in" aria-hidden="true"></i>Login</button>
                    <a class="forgot-password-link" href="${location.pathname.includes("/pages/") ? "forgot-password.html" : "pages/forgot-password.html"}">Forgot your password?</a>
                </form>
                <p class="login-motto">Plan smarter. Drive farther. Spend wiser.</p>
            </section>
        </div>
    `);

    const overlay = document.getElementById("login-modal");
    const closeButton = overlay.querySelector(".login-close");
    const usernameInput = overlay.querySelector("#login-username");
    const passwordInput = overlay.querySelector("#login-password");
    const capsWarning = overlay.querySelector(".caps-lock-warning");
    const message = overlay.querySelector(".login-message");
    const submitButton = overlay.querySelector(".login-submit");
    const form = overlay.querySelector(".login-form");
    let lastTrigger = null;

    if (window.lucide) window.lucide.createIcons();

    function openModal(trigger) {
        lastTrigger = trigger;
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("login-modal-open");
        window.setTimeout(() => usernameInput.focus(), 120);
    }

    function closeModal() {
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("login-modal-open");
        capsWarning.classList.remove("visible");
        lastTrigger?.focus();
    }

    loginButtons.forEach(button => button.addEventListener("click", () => {
        if (!button.dataset.authenticated) openModal(button);
    }));

    const loginRequested = new URLSearchParams(window.location.search).get("login") === "1";
    if (loginRequested) {
        openModal(loginButtons[0]);
        const cleanUrl = `${window.location.pathname}${window.location.hash}`;
        window.history.replaceState({}, "", cleanUrl);
    }

    closeButton.addEventListener("click", closeModal);
    overlay.addEventListener("click", event => { if (event.target === overlay) closeModal(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && overlay.classList.contains("active")) closeModal(); });

    [passwordInput, usernameInput].forEach(input => {
        input.addEventListener("keydown", event => capsWarning.classList.toggle("visible", event.getModifierState("CapsLock")));
        input.addEventListener("keyup", event => capsWarning.classList.toggle("visible", event.getModifierState("CapsLock")));
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        message.className = "login-message";
        message.textContent = "";
        submitButton.disabled = true;

        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: usernameInput.value.trim(), password: passwordInput.value }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.detail || "Login failed. Please check your details.");

            message.classList.add("success");
            message.textContent = "Login successful.";
            document.dispatchEvent(new CustomEvent("fuelwise:authenticated", { detail: body.user }));
            form.reset();
            window.setTimeout(closeModal, 650);
        } catch (error) {
            message.textContent = error.message;
        } finally {
            submitButton.disabled = false;
        }
    });
});
