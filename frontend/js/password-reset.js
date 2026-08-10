document.addEventListener("DOMContentLoaded", () => {
    const requestForm = document.getElementById("request-reset-form");
    const verifyForm = document.getElementById("verify-code-form");
    const confirmForm = document.getElementById("confirm-reset-form");
    const email = document.getElementById("reset-email");
    const code = document.getElementById("verification-code");
    const password = document.getElementById("new-password");
    const confirmation = document.getElementById("confirm-new-password");
    const countdown = document.getElementById("code-countdown");
    const resend = document.getElementById("resend-code");
    const description = document.getElementById("reset-description");
    let resetToken = "";
    let timer = null;

    const setBusy = (form, busy) => { form.querySelector("button[type=submit]").disabled = busy; };
    const setMessage = (form, text, success = false) => { const el=form.querySelector(".register-message"); el.textContent=text; el.style.color=success ? "#86efac" : "#fca5a5"; };

    function showStep(step) {
        document.querySelectorAll(".reset-step").forEach(form => form.classList.toggle("active", Number(form.dataset.step) === step));
        document.querySelectorAll("[data-progress]").forEach(item => item.classList.toggle("active", Number(item.dataset.progress) <= step));
        description.textContent = step === 2 ? "Enter the 6-digit code sent to your email." : step === 3 ? "Create a strong new password for your account." : description.textContent;
    }

    function startCountdown() {
        clearInterval(timer);
        let seconds = 600;
        resend.disabled = true;
        timer = setInterval(() => {
            seconds -= 1;
            countdown.textContent = `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;
            if (seconds <= 540) resend.disabled = false;
            if (seconds <= 0) { clearInterval(timer); countdown.textContent = "Expired"; }
        }, 1000);
    }

    async function requestCode() {
        const response = await fetch("/api/v1/auth/password-reset/request", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:email.value.trim()}) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail || "Verification code could not be sent.");
        showStep(2); startCountdown(); code.focus();
    }

    requestForm.addEventListener("submit", async event => {
        event.preventDefault(); setMessage(requestForm, ""); setBusy(requestForm, true);
        try { await requestCode(); } catch (error) { setMessage(requestForm, error.message); } finally { setBusy(requestForm, false); }
    });

    resend.addEventListener("click", async () => {
        resend.disabled = true;
        try { await requestCode(); setMessage(verifyForm, "A new verification code has been sent.", true); } catch (error) { setMessage(verifyForm, error.message); }
    });

    code.addEventListener("input", () => { code.value = code.value.replace(/\D/g, "").slice(0, 6); });
    verifyForm.addEventListener("submit", async event => {
        event.preventDefault(); setMessage(verifyForm, ""); setBusy(verifyForm, true);
        try {
            const response = await fetch("/api/v1/auth/password-reset/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:email.value.trim(),code:code.value}) });
            const body = await response.json();
            if (!response.ok) throw new Error(body.detail || "Verification failed.");
            resetToken = body.reset_token; clearInterval(timer); showStep(3); password.focus();
        } catch (error) { setMessage(verifyForm, error.message); } finally { setBusy(verifyForm, false); }
    });

    function passwordState() {
        const value=password.value;
        const rules={length:value.length>=8,upper:/[A-Z]/.test(value),number:/\d/.test(value)};
        Object.entries(rules).forEach(([name,valid]) => document.querySelector(`[data-rule="${name}"]`)?.classList.toggle("valid",valid));
        return Object.values(rules).every(Boolean);
    }
    password.addEventListener("input", passwordState);
    [password, confirmation].forEach(input => ["keydown","keyup"].forEach(type => input.addEventListener(type, event => document.querySelector(".register-caps").classList.toggle("visible",event.getModifierState("CapsLock")))));

    confirmForm.addEventListener("submit", async event => {
        event.preventDefault(); setMessage(confirmForm, "");
        if (!passwordState()) return setMessage(confirmForm, "Your password does not meet the security requirements.");
        if (password.value !== confirmation.value) return setMessage(confirmForm, "Passwords do not match.");
        setBusy(confirmForm, true);
        try {
            const response = await fetch("/api/v1/auth/password-reset/confirm", { method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({reset_token:resetToken,password:password.value}) });
            const body=await response.json(); if(!response.ok) throw new Error(body.detail || "Password could not be changed.");
            confirmForm.classList.remove("active"); document.querySelector(".reset-progress").style.display="none"; document.querySelector(".register-heading").style.display="none";
            const success=document.getElementById("reset-success"); success.classList.add("active"); success.setAttribute("aria-hidden","false");
        } catch(error) { setMessage(confirmForm,error.message); } finally { setBusy(confirmForm,false); }
    });
});
