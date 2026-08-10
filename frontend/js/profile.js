document.addEventListener("DOMContentLoaded", async () => {
    const user = await window.FuelWiseAuth?.getCurrentUser();
    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    document.getElementById("profile-name").textContent = user.full_name;
    document.getElementById("profile-username").textContent = `@${user.username}`;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-created").textContent = new Intl.DateTimeFormat(document.documentElement.lang || "en", { dateStyle: "long" }).format(new Date(user.created_at));
    document.getElementById("profile-avatar").textContent = user.username.slice(0, 2).toUpperCase();
    setupSecurityActions();

    const history = document.getElementById("trip-history-list");
    try {
        const response = await fetch("/api/v1/trips?limit=3", { credentials: "include" });
        if (!response.ok) throw new Error("History could not be loaded.");
        const trips = await response.json();
        if (!trips.length) {
            history.innerHTML = '<div class="profile-empty"><i data-lucide="route"></i><h3>No trip history yet</h3><p>Your completed Trip Planner calculations will appear here.</p></div>';
        } else {
            history.innerHTML = trips.map(trip => `
                <article class="history-card">
                    <div class="history-route"><span>${escapeHtml(trip.origin || "Starting point")}</span><i data-lucide="arrow-right"></i><span>${escapeHtml(trip.destination || "Destination")}</span></div>
                    <div class="history-meta"><span><i data-lucide="car-front"></i>${escapeHtml(trip.vehicle_name || "Manual entry")} · ${trafficLabel(trip.traffic_condition)}</span><time>${formatDate(trip.created_at)}</time></div>
                    <div class="history-stats"><div><small>Distance</small><strong>${Number(trip.total_distance).toFixed(1)} km</strong></div><div><small>Estimated fuel</small><strong>${Number(trip.min_fuel_required ?? trip.fuel_required).toFixed(2)} – ${Number(trip.max_fuel_required ?? trip.fuel_required).toFixed(2)} L</strong></div><div><small>Estimated cost</small><strong>${formatMoney(trip.min_total_cost ?? trip.total_cost)} – ${formatMoney(trip.max_total_cost ?? trip.total_cost)}</strong></div></div>
                </article>`).join("");
        }
        window.FuelWiseI18n?.translate(localStorage.getItem("fuelwise-language") || "en");
        window.lucide?.createIcons();
    } catch (error) {
        history.innerHTML = `<div class="profile-empty"><p>${escapeHtml(error.message)}</p></div>`;
    }
});

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const formatDate = value => new Intl.DateTimeFormat(document.documentElement.lang || "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const formatMoney = value => Number(value).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
const trafficLabel = value => ({ flowing: "Flowing", normal: "Normal", heavy: "Heavy", "very-heavy": "Very Heavy" }[value] || "Normal");

function setupSecurityActions() {
    const overlay = document.getElementById("security-modal"), title = document.getElementById("security-title"), description = document.getElementById("security-description"), codeInput = document.getElementById("security-code");
    let action = "", actionToken = "";
    const stage = name => document.querySelectorAll(".security-stage").forEach(item => item.classList.toggle("active", item.dataset.securityStage === name));
    const message = (name, text) => { document.querySelector(`[data-security-stage="${name}"] .security-message`).textContent = text; };
    const close = () => { overlay.classList.remove("active"); overlay.setAttribute("aria-hidden", "true"); codeInput.value=""; actionToken=""; };
    const accountRequest = (path, options) => window.FuelWiseAuth.authenticatedRequest(path, options);
    const errorText = (body, fallback) => typeof body?.detail === "string" ? body.detail : fallback;
    async function open(selectedAction) {
        action=selectedAction; title.textContent=action==="delete_account"?"Delete Account":"Renew Password"; description.textContent="A verification code has been sent to your registered email."; stage("code"); message("code",""); overlay.classList.add("active"); overlay.setAttribute("aria-hidden","false");
        try { const response=await accountRequest("/account/action-code/request",{method:"POST",body:JSON.stringify({action})}); const body=await response.json(); if(!response.ok) throw new Error(errorText(body,"Verification code could not be sent.")); codeInput.focus(); } catch(error){ message("code",error.message); }
    }
    document.getElementById("profile-change-password").addEventListener("click",()=>open("change_password")); document.getElementById("profile-delete-account").addEventListener("click",()=>open("delete_account")); overlay.querySelector(".security-close").addEventListener("click",close); overlay.addEventListener("click",event=>{if(event.target===overlay)close();}); codeInput.addEventListener("input",()=>{codeInput.value=codeInput.value.replace(/\D/g,"").slice(0,6);});
    const verifyButton = document.getElementById("verify-security-code");
    verifyButton.addEventListener("click",async ()=>{const code=codeInput.value.trim();message("code","");if(!/^\d{6}$/.test(code)){message("code","Please enter the 6-digit code sent to your email.");codeInput.focus();return;}verifyButton.disabled=true;verifyButton.setAttribute("aria-busy","true");try{const response=await accountRequest("/account/action-code/verify",{method:"POST",body:JSON.stringify({action,code})});const body=await response.json();if(!response.ok)throw new Error(errorText(body,"Verification failed."));actionToken=body.action_token;stage(action==="delete_account"?"delete":"password");}catch(error){message("code",error.message);}finally{verifyButton.disabled=false;verifyButton.removeAttribute("aria-busy");}});
    document.getElementById("save-security-password").addEventListener("click",async event=>{const password=document.getElementById("security-new-password").value,confirmation=document.getElementById("security-confirm-password").value;message("password","");if(password.length<8||!/[A-Z]/.test(password)||!/\d/.test(password))return message("password","Password must contain at least 8 characters, one uppercase letter and one number.");if(password!==confirmation)return message("password","Passwords do not match.");event.currentTarget.disabled=true;try{const response=await fetch("/api/v1/auth/account/change-password",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({action_token:actionToken,password})});const body=await response.json();if(!response.ok)throw new Error(body.detail||"Password could not be changed.");finish(body.message);}catch(error){message("password",error.message);}finally{event.currentTarget.disabled=false;}});
    document.getElementById("confirm-delete-account").addEventListener("click",async event=>{event.currentTarget.disabled=true;message("delete","");try{const response=await fetch("/api/v1/auth/account/delete",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({action_token:actionToken})});const body=await response.json();if(!response.ok)throw new Error(body.detail||"Account could not be deleted.");finish(body.message);}catch(error){message("delete",error.message);event.currentTarget.disabled=false;}});
    function finish(text){overlay.querySelector(".security-modal").innerHTML=`<div class="security-icon"><i data-lucide="circle-check-big"></i></div><h2>${escapeHtml(text)}</h2><p>Returning to the home page...</p>`;window.lucide?.createIcons();window.setTimeout(()=>window.location.href="../index.html",1300);}
}
