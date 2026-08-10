(() => {
    let currentUser = null;
    let currentUserPromise = null;
    let refreshPromise = null;

    async function request(path, options = {}) {
        return fetch(`/api/v1/auth${path}`, {
            credentials: "include",
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
            ...options,
        });
    }

    async function getCurrentUser(force = false) {
        if (currentUser && !force) return currentUser;
        if (currentUserPromise) return currentUserPromise;

        currentUserPromise = (async () => {
            let response = await request("/me");
            if (response.ok) {
                currentUser = await response.json();
                return currentUser;
            }
            if (response.status !== 401) return null;

            if (!refreshPromise) {
                refreshPromise = request("/refresh", { method: "POST" }).finally(() => { refreshPromise = null; });
            }
            const refreshed = await refreshPromise;
            if (!refreshed.ok) return null;
            response = await request("/me");
            currentUser = response.ok ? await response.json() : null;
            return currentUser;
        })().finally(() => { currentUserPromise = null; });

        return currentUserPromise;
    }

    async function authenticatedRequest(path, options = {}) {
        let response = await request(path, options);
        if (response.status !== 401) return response;

        if (!refreshPromise) {
            refreshPromise = request("/refresh", { method: "POST" }).finally(() => { refreshPromise = null; });
        }
        const refreshed = await refreshPromise;
        if (!refreshed.ok) return response;
        return request(path, options);
    }

    function updateNavbar(user) {
        document.querySelectorAll(".nav-buttons").forEach(container => {
            const loginButton = container.querySelector(".login-btn");
            const registerButton = container.querySelector('a[href$="register.html"], [data-auth-action="logout"]');
            if (!loginButton || !registerButton) return;

            if (user) {
                loginButton.textContent = user.username;
                loginButton.dataset.authenticated = "true";
                loginButton.dataset.profileHref = location.pathname.includes("/pages/") ? "profile.html" : "pages/profile.html";
                loginButton.setAttribute("aria-label", `Signed in as ${user.username}`);
                registerButton.textContent = "Logout";
                registerButton.href = "#";
                registerButton.dataset.authAction = "logout";
            } else {
                loginButton.textContent = "Login";
                delete loginButton.dataset.authenticated;
                delete loginButton.dataset.profileHref;
                loginButton.removeAttribute("aria-label");
                registerButton.textContent = "Register";
                registerButton.href = location.pathname.includes("/pages/") ? "register.html" : "pages/register.html";
                delete registerButton.dataset.authAction;
            }
        });

        const savedLanguage = localStorage.getItem("fuelwise-language") || "en";
        window.FuelWiseI18n?.translate(savedLanguage);
    }

    async function logout() {
        await request("/logout", { method: "POST" });
        currentUser = null;
        updateNavbar(null);
        window.location.href = location.pathname.includes("/pages/") ? "../index.html" : "index.html";
    }

    document.addEventListener("click", event => {
        const profileButton = event.target.closest('.login-btn[data-authenticated="true"]');
        if (profileButton) {
            event.preventDefault();
            window.location.href = profileButton.dataset.profileHref;
            return;
        }
        const logoutButton = event.target.closest('[data-auth-action="logout"]');
        if (!logoutButton) return;
        event.preventDefault();
        logout();
    });

    document.addEventListener("fuelwise:authenticated", event => {
        currentUser = event.detail;
        updateNavbar(currentUser);
    });
    document.addEventListener("DOMContentLoaded", async () => updateNavbar(await getCurrentUser()));

    window.FuelWiseAuth = { request, authenticatedRequest, getCurrentUser, updateNavbar, logout };
})();
