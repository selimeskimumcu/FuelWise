const vehicleList = document.getElementById("vehicle-list");
const modal = document.getElementById("vehicle-modal");
const openButton = document.getElementById("add-vehicle-btn");
const closeButton = document.getElementById("close-modal");
const form = document.getElementById("vehicle-form");

let vehicles = [];
let editingVehicleId = null;
let currentUser = null;
let deleteConfirmationResolver = null;

const fields = form ? {
    name: form.querySelector("#vehicle-name"),
    make: form.querySelector("#vehicle-make"),
    model: form.querySelector("#vehicle-model"),
    year: form.querySelector("#vehicle-year"),
    vehicleType: form.querySelector("#vehicle-type"),
    fuelType: form.querySelector("#vehicle-fuel-type"),
    consumption: form.querySelector("#vehicle-consumption"),
    tankCapacity: form.querySelector("#vehicle-tank"),
    isDefault: form.querySelector("#vehicle-default"),
} : null;

const modalTitle = document.getElementById("vehicle-modal-title");
const submitButton = document.getElementById("vehicle-submit");
const formMessage = document.getElementById("vehicle-form-message");

if (vehicleList) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="delete-confirm-overlay" id="vehicle-delete-confirm" aria-hidden="true">
            <section class="delete-confirm-box" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
                <div class="delete-confirm-icon"><i data-lucide="trash-2"></i></div>
                <h3 id="delete-confirm-title">Delete vehicle?</h3>
                <p><span>Are you sure you want to delete</span> <strong id="delete-vehicle-name"></strong>? <span>This action cannot be undone.</span></p>
                <div class="delete-confirm-actions">
                    <button type="button" class="secondary-btn" data-delete-choice="cancel">Cancel</button>
                    <button type="button" class="delete-confirm-button" data-delete-choice="confirm"><i data-lucide="trash-2"></i>Delete</button>
                </div>
            </section>
        </div>
    `);
}

const deleteOverlay = document.getElementById("vehicle-delete-confirm");
const deleteVehicleName = document.getElementById("delete-vehicle-name");

function resolveDeleteConfirmation(confirmed) {
    deleteOverlay?.classList.remove("active");
    deleteOverlay?.setAttribute("aria-hidden", "true");
    deleteConfirmationResolver?.(confirmed);
    deleteConfirmationResolver = null;
}

function confirmVehicleDelete(vehicle) {
    if (!deleteOverlay || !deleteVehicleName) return Promise.resolve(false);
    deleteVehicleName.textContent = vehicle.name;
    deleteOverlay.classList.add("active");
    deleteOverlay.setAttribute("aria-hidden", "false");
    window.lucide?.createIcons();
    window.FuelWiseI18n?.translate(localStorage.getItem("fuelwise-language") || "en");
    return new Promise(resolve => { deleteConfirmationResolver = resolve; });
}

deleteOverlay?.addEventListener("click", event => {
    const choice = event.target.closest("[data-delete-choice]")?.dataset.deleteChoice;
    if (choice) resolveDeleteConfirmation(choice === "confirm");
    else if (event.target === deleteOverlay) resolveDeleteConfirmation(false);
});

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
}

async function api(path = "", options = {}) {
    const response = await fetch(`/api/v1/vehicles${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (response.status === 204) return null;
    const body = await response.json();
    if (!response.ok) {
        const detail = Array.isArray(body.detail) ? body.detail.map(item => item.msg).join(" ") : body.detail;
        throw new Error(detail || "Vehicle operation failed.");
    }
    return body;
}

function vehicleTypeLabel(type) {
    return ({ car: "Car", motorcycle: "Motorcycle", truck: "Truck", bus: "Bus", semi_truck: "Semi Truck" })[type] || type;
}

function vehicleIcon(type) {
    return ({ car: "car-front", motorcycle: "bike", truck: "truck", bus: "bus-front", semi_truck: "container" })[type] || "car-front";
}

function renderVehicles() {
    if (!vehicleList) return;
    if (!currentUser) {
        vehicleList.innerHTML = `<div class="vehicle-empty-state"><i data-lucide="car-front"></i><h4>Please add a vehicle</h4><p>Login to add and securely save your vehicles.</p></div>`;
    } else if (!vehicles.length) {
        vehicleList.innerHTML = `<div class="vehicle-empty-state"><i data-lucide="car-front"></i><h4>Please add a vehicle</h4><p>Add your first vehicle to use it in trip calculations.</p></div>`;
    } else {
        vehicleList.innerHTML = vehicles.map(vehicle => `
            <article class="vehicle-card" data-vehicle-id="${vehicle.id}">
                <div class="vehicle-card-top">
                    <div class="vehicle-icon"><i data-lucide="${vehicleIcon(vehicle.vehicle_type)}"></i></div>
                    <div>
                        <h4>${escapeHtml(vehicle.name)}</h4>
                        <p>${escapeHtml(vehicleTypeLabel(vehicle.vehicle_type))} · ${escapeHtml(vehicle.fuel_type)}</p>
                        ${vehicle.is_default ? '<span class="default-badge">Default</span>' : ""}
                    </div>
                </div>
                <div class="vehicle-specs">
                    <div><span>Consumption</span><strong>${Number(vehicle.consumption).toFixed(1)} L/100km</strong></div>
                    <div><span>Tank</span><strong>${Number(vehicle.tank_capacity).toFixed(1)} L</strong></div>
                </div>
                <div class="vehicle-actions">
                    ${vehicle.is_default ? "" : '<button type="button" class="secondary-btn" data-action="default">Set Default</button>'}
                    <button type="button" class="secondary-btn" data-action="edit">Edit</button>
                    <button type="button" class="delete-btn" data-action="delete">Delete</button>
                </div>
            </article>
        `).join("");
    }
    window.lucide?.createIcons();
    window.FuelWiseI18n?.translate(localStorage.getItem("fuelwise-language") || "en");
    document.dispatchEvent(new CustomEvent("fuelwise:vehicles-updated", { detail: vehicles }));
}

async function loadVehicles() {
    if (!vehicleList) return;
    currentUser = await window.FuelWiseAuth?.getCurrentUser();
    if (!currentUser) {
        vehicles = [];
        renderVehicles();
        return;
    }
    try {
        await refreshVehiclesFromApi();
    } catch (error) {
        vehicleList.innerHTML = `<div class="vehicle-empty-state"><h4>Vehicles could not be loaded</h4><p>${escapeHtml(error.message)}</p></div>`;
        return;
    }
}

async function refreshVehiclesFromApi() {
    vehicles = await api();
    renderVehicles();
}

function resetForm() {
    form?.reset();
    editingVehicleId = null;
    if (modalTitle) modalTitle.textContent = "Add Vehicle";
    if (submitButton) submitButton.textContent = "Save Vehicle";
    if (formMessage) formMessage.textContent = "";
}

function openModal(vehicle = null) {
    if (!modal || !form || !fields) return;
    resetForm();
    if (vehicle) {
        editingVehicleId = vehicle.id;
        modalTitle.textContent = "Edit Vehicle";
        submitButton.textContent = "Update Vehicle";
        fields.name.value = vehicle.name;
        fields.make.value = vehicle.make || "";
        fields.model.value = vehicle.model || "";
        fields.year.value = vehicle.year || "";
        fields.vehicleType.value = vehicle.vehicle_type;
        fields.fuelType.value = vehicle.fuel_type;
        fields.consumption.value = vehicle.consumption;
        fields.tankCapacity.value = vehicle.tank_capacity;
        fields.isDefault.checked = vehicle.is_default;
    }
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    fields.name.focus();
}

function closeModal() {
    modal?.classList.remove("active");
    modal?.setAttribute("aria-hidden", "true");
    resetForm();
}

openButton?.addEventListener("click", async () => {
    currentUser = await window.FuelWiseAuth?.getCurrentUser();
    if (!currentUser) {
        document.querySelector(".login-btn")?.click();
        return;
    }
    openModal();
});

closeButton?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (deleteOverlay?.classList.contains("active")) resolveDeleteConfirmation(false);
    else if (modal?.classList.contains("active")) closeModal();
});

vehicleList?.addEventListener("click", async event => {
    const actionButton = event.target.closest("[data-action]");
    const card = event.target.closest("[data-vehicle-id]");
    if (!actionButton || !card) return;
    const vehicle = vehicles.find(item => item.id === card.dataset.vehicleId);
    if (!vehicle) return;

    try {
        if (actionButton.dataset.action === "edit") openModal(vehicle);
        if (actionButton.dataset.action === "default") {
            await api(`/${vehicle.id}/default`, { method: "PATCH" });
            await refreshVehiclesFromApi();
        }
        if (actionButton.dataset.action === "delete") {
            if (!await confirmVehicleDelete(vehicle)) return;
            await api(`/${vehicle.id}`, { method: "DELETE" });
            await refreshVehiclesFromApi();
        }
    } catch (error) {
        window.alert(error.message);
    }
});

form?.addEventListener("submit", async event => {
    event.preventDefault();
    formMessage.textContent = "";
    submitButton.disabled = true;
    const payload = {
        name: fields.name.value.trim(),
        make: fields.make.value.trim() || null,
        model: fields.model.value.trim() || null,
        year: fields.year.value ? Number(fields.year.value) : null,
        vehicle_type: fields.vehicleType.value,
        fuel_type: fields.fuelType.value,
        consumption: Number(fields.consumption.value),
        tank_capacity: Number(fields.tankCapacity.value),
        is_default: fields.isDefault.checked,
    };
    try {
        await api(editingVehicleId ? `/${editingVehicleId}` : "", {
            method: editingVehicleId ? "PATCH" : "POST",
            body: JSON.stringify(payload),
        });
        formMessage.classList.add("success");
        formMessage.textContent = editingVehicleId ? "Vehicle updated." : "Vehicle saved.";
        await refreshVehiclesFromApi();
        window.setTimeout(closeModal, 450);
    } catch (error) {
        formMessage.classList.remove("success");
        formMessage.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});

document.addEventListener("fuelwise:authenticated", loadVehicles);
loadVehicles();
