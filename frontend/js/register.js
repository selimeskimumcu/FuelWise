document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) window.lucide.createIcons();

    const form = document.getElementById("register-form");
    const password = document.getElementById("register-password");
    const confirmation = document.getElementById("confirm-password");
    const capsWarning = document.querySelector(".register-caps");
    const message = document.getElementById("register-message");
    const submitButton = form.querySelector(".register-submit");
    const rules = {
        length: document.querySelector('[data-rule="length"]'),
        upper: document.querySelector('[data-rule="upper"]'),
        number: document.querySelector('[data-rule="number"]')
    };

    function passwordState() {
        const value = password.value;
        const state = { length: value.length >= 8, upper: /[A-Z]/.test(value), number: /\d/.test(value) };
        Object.entries(state).forEach(([name, valid]) => rules[name].classList.toggle("valid", valid));
        return Object.values(state).every(Boolean);
    }

    password.addEventListener("input", passwordState);

    [password, confirmation].forEach(input => {
        const updateCapsLock = event => capsWarning.classList.toggle("visible", event.getModifierState("CapsLock"));
        input.addEventListener("keydown", updateCapsLock);
        input.addEventListener("keyup", updateCapsLock);
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        message.style.color = "";
        message.textContent = "";

        if (!form.checkValidity()) {
            message.textContent = "Please complete every required field correctly.";
            form.reportValidity();
            return;
        }
        if (!passwordState()) {
            message.textContent = "Your password does not meet the security requirements.";
            return;
        }
        if (password.value !== confirmation.value) {
            message.textContent = "Passwords do not match.";
            confirmation.focus();
            return;
        }

        submitButton.disabled = true;

        try {
            const registerResponse = await fetch("/api/v1/auth/register", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: document.getElementById("full-name").value.trim(),
                    username: document.getElementById("username").value.trim(),
                    email: document.getElementById("email").value.trim(),
                    password: password.value,
                }),
            });
            const registerBody = await registerResponse.json();
            if (!registerResponse.ok) {
                const detail = Array.isArray(registerBody.detail)
                    ? registerBody.detail.map(item => item.msg).join(" ")
                    : registerBody.detail;
                throw new Error(detail || "Registration failed. Please try again.");
            }

            const loginResponse = await fetch("/api/v1/auth/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: document.getElementById("email").value.trim(),
                    password: password.value,
                }),
            });
            if (!loginResponse.ok) throw new Error("Account created, but automatic login failed.");

            message.style.color = "#86efac";
            message.textContent = "Account created successfully. Redirecting…";
            window.setTimeout(() => { window.location.href = "../index.html"; }, 900);
        } catch (error) {
            message.textContent = error.message;
            submitButton.disabled = false;
        }
    });

    document.getElementById("open-login").addEventListener("click", () => {
        window.location.href = "../index.html";
    });
});
