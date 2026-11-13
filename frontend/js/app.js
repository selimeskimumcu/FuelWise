document.addEventListener("DOMContentLoaded", () => {

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const fuelForm =
        document.getElementById("fuel-form");

    const vehicleSelect =
        document.getElementById("vehicle");

    const distanceInput =
        document.getElementById("distance");

    const consumptionInput =
        document.getElementById("consumption");

    const tankCapacityInput =
        document.getElementById("tank-capacity");

    const fuelPriceInput =
        document.getElementById("fuel-price");

    const fuelTypeInput =
        document.getElementById("fuel-type");

    const fuelPriceStatus =
        document.getElementById("fuel-price-status");

    const startLabel =
        document.getElementById("route-start-label");

    const epdkLoader =
        document.getElementById("epdk-loader");

    let fuelPriceRequestVersion = 0;

    const trafficConditionInput =
        document.getElementById("traffic-condition");

    const distanceResult =
        document.getElementById("distance-result");

    const fuelResult =
        document.getElementById("fuel-result");

    const costResult =
        document.getElementById("cost-result");

    const rangeResult =
        document.getElementById("range-result");

    const stopResult =
        document.getElementById("stop-result");

    const errorMessage =
        document.getElementById("error-message");

    const successMessage =
        document.getElementById("success-message");

    // Catalogue: lets anyone pick a make, model and engine without knowing the consumption.
    const CATALOG_OPTION = "__catalog";
    const catalogHolder = document.getElementById("planner-catalog");
    let catalogVehicle = null;
    let catalogPicker = null;

    function flashField(input) {
        const wrapper = input.closest(".field-wrapper") || input;
        wrapper.classList.remove("catalog-filled");
        void wrapper.offsetWidth;
        wrapper.classList.add("catalog-filled");
    }

    function applyCatalogVehicle(vehicle) {
        catalogVehicle = vehicle;
        consumptionInput.value = vehicle.consumption;
        tankCapacityInput.value = vehicle.tank;
        [consumptionInput, tankCapacityInput].forEach(flashField);
        if (fuelTypeInput.value !== vehicle.fuel) {
            fuelTypeInput.value = vehicle.fuel;
            loadOfficialFuelPrice();
        }
    }

    function showCatalog(visible) {
        if (!catalogHolder) return;
        catalogHolder.hidden = !visible;
        if (visible && !catalogPicker && window.FuelWiseCatalog) {
            catalogPicker = window.FuelWiseCatalog.mount(catalogHolder, {
                onSelect: applyCatalogVehicle,
                onClear: () => { catalogVehicle = null; }
            });
        }
    }

    vehicleSelect.addEventListener("change", () => {

        showCatalog(vehicleSelect.value === CATALOG_OPTION);

        if (vehicleSelect.value === CATALOG_OPTION) {
            if (catalogVehicle) applyCatalogVehicle(catalogVehicle);
            return;
        }

        const selectedOption = vehicleSelect.selectedOptions[0];
        const consumption = Number(selectedOption?.dataset.consumption);
        const tankCapacity = Number(selectedOption?.dataset.tankCapacity);
        const fuelType = selectedOption?.dataset.fuelType;

        if (!vehicleSelect.value || !consumption || !tankCapacity) {

            consumptionInput.value = "";

            tankCapacityInput.value = "";

            return;

        }

        consumptionInput.value = consumption;

        tankCapacityInput.value = tankCapacity;

        if (fuelType && ["gasoline", "diesel", "lpg"].includes(fuelType)) {
            fuelTypeInput.value = fuelType;
            loadOfficialFuelPrice();
        }

    });

    function populateVehicleOptions(userVehicles = []) {
        const currentValue = vehicleSelect.value;
        vehicleSelect.innerHTML = '<option value="__catalog">Choose from catalogue</option><option value="">Manual entry</option>';
        userVehicles.forEach(vehicle => {
            const option = document.createElement("option");
            option.value = vehicle.id;
            option.textContent = vehicle.name;
            option.dataset.consumption = vehicle.consumption;
            option.dataset.tankCapacity = vehicle.tank_capacity;
            option.dataset.fuelType = vehicle.fuel_type;
            option.selected = vehicle.id === currentValue || (!currentValue && vehicle.is_default);
            vehicleSelect.append(option);
        });
        // With no saved vehicle the catalogue is the easiest way in; a saved default still wins.
        if (currentValue === CATALOG_OPTION || (!userVehicles.length && !manualChosen)) vehicleSelect.value = CATALOG_OPTION;
        else if (manualChosen && currentValue === "") vehicleSelect.value = "";
        if (vehicleSelect.value) vehicleSelect.dispatchEvent(new Event("change"));
        else showCatalog(false);
        // The options were just rebuilt in English; put them back in the active language.
        const activeLanguage = localStorage.getItem("fuelwise-language");
        if (activeLanguage && activeLanguage !== "en") window.FuelWiseI18n?.translate(activeLanguage);
    }

    let manualChosen = false;
    vehicleSelect.addEventListener("change", event => {
        if (event.isTrusted) manualChosen = vehicleSelect.value === "";
    });

    async function loadSavedVehicles() {
        try {
            const user = await window.FuelWiseAuth?.getCurrentUser();
            if (!user) {
                populateVehicleOptions();
                return;
            }
            const response = await fetch("/api/v1/vehicles", { credentials: "include" });
            populateVehicleOptions(response.ok ? await response.json() : []);
        } catch (error) {
            console.error("Saved vehicles could not be loaded:", error);
            populateVehicleOptions();
        }
    }

    document.addEventListener("fuelwise:vehicles-updated", event => populateVehicleOptions(event.detail));
    document.addEventListener("fuelwise:authenticated", loadSavedVehicles);
    loadSavedVehicles();

    function routeProvince() {
        const label = startLabel?.textContent.trim();
        if (!label || label.includes(",")) return "İstanbul";
        return label.split("/").at(-1)?.trim() || "İstanbul";
    }

    const fuelPricePhrases = {
        loading: { en: "Loading official EPDK price...", tr: "Resmî EPDK fiyatı yükleniyor...", ru: "Загрузка официальной цены EPDK...", zh: "正在加载 EPDK 官方价格..." },
        stale: { en: "last known official price", tr: "son bilinen resmî fiyat", ru: "последняя доступная официальная цена", zh: "最近的官方价格" },
        unavailable: { en: "EPDK is temporarily unavailable. You can enter the litre price manually.", tr: "EPDK'ye geçici olarak ulaşılamıyor. Litre fiyatını elle girebilirsiniz.", ru: "EPDK временно недоступна. Введите цену за литр вручную.", zh: "EPDK 暂时不可用，您可以手动输入每升价格。" },
        manual: { en: "Manual litre price", tr: "Manuel litre fiyatı", ru: "Цена за литр введена вручную", zh: "手动输入每升价格" }
        ,wait: { en: "Please wait", tr: "Lütfen bekleyin", ru: "Пожалуйста, подождите", zh: "请稍候" }
    };
    const fuelPhrase = key => fuelPricePhrases[key][localStorage.getItem("fuelwise-language") || "en"];

    async function loadOfficialFuelPrice() {
        const requestVersion = ++fuelPriceRequestVersion;
        fuelPriceStatus.textContent = fuelPhrase("loading");
        epdkLoader.querySelector("strong").textContent = fuelPhrase("loading");
        epdkLoader.querySelector("small").textContent = fuelPhrase("wait");
        epdkLoader.setAttribute("aria-hidden", "false");
        document.body.classList.add("epdk-loading");
        try {
            const query = new URLSearchParams({ province: routeProvince(), fuel_type: fuelTypeInput.value });
            let response = await fetch(`/api/v1/fuel-prices?${query}`);
            if (response.status === 422 && routeProvince() !== "İstanbul") {
                query.set("province", "İstanbul");
                response = await fetch(`/api/v1/fuel-prices?${query}`);
            }
            const body = await response.json();
            if (!response.ok || !body.prices?.length) throw new Error(body.detail || "Price unavailable");
            const price = body.prices[0];
            fuelPriceInput.value = Number(price.average_price).toFixed(2);
            fuelPriceInput.dataset.minimumPrice = price.minimum_price;
            fuelPriceInput.dataset.maximumPrice = price.maximum_price;
            const officialPrice = Number(price.minimum_price) === Number(price.maximum_price)
                ? `₺${Number(price.average_price).toFixed(2)}/L`
                : `₺${Number(price.minimum_price).toFixed(2)}–₺${Number(price.maximum_price).toFixed(2)}/L`;
            fuelPriceStatus.textContent = `${price.province_name} · EPDK ${price.observed_at} · ${officialPrice}${price.stale ? ` · ${fuelPhrase("stale")}` : ""}`;
        } catch (error) {
            delete fuelPriceInput.dataset.minimumPrice;
            delete fuelPriceInput.dataset.maximumPrice;
            fuelPriceStatus.textContent = fuelPhrase("unavailable");
        } finally {
            if (requestVersion === fuelPriceRequestVersion) {
                document.body.classList.remove("epdk-loading");
                epdkLoader.setAttribute("aria-hidden", "true");
            }
        }
    }

    fuelTypeInput.addEventListener("change", loadOfficialFuelPrice);
    fuelPriceInput.addEventListener("input", () => {
        fuelPriceInput.dataset.minimumPrice = fuelPriceInput.value;
        fuelPriceInput.dataset.maximumPrice = fuelPriceInput.value;
        fuelPriceStatus.textContent = fuelPhrase("manual");
    });
    if (startLabel) new MutationObserver(loadOfficialFuelPrice).observe(startLabel, { childList: true, characterData: true, subtree: true });
    loadOfficialFuelPrice();

    function isValidTripInput({ distance, consumption, tankCapacity, fuelPrice, tripType }) {
        return [distance, consumption, tankCapacity, fuelPrice].every(value => Number.isFinite(value) && value > 0)
            && ["one-way", "round-trip"].includes(tripType);
    }

    fuelForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const tripInput = {

            distance:
                Number(distanceInput.value),

            consumption:
                Number(consumptionInput.value),

            tankCapacity:
                Number(tankCapacityInput.value),

            fuelPrice:
                Number(fuelPriceInput.value),

            tripType:
                document.querySelector(
                    'input[name="trip-type"]:checked'
                )?.value,

            trafficCondition:
                trafficConditionInput.value

        };

        if (!isValidTripInput(tripInput)) {

            errorMessage.textContent =
                "Please enter values greater than zero in all fields.";

            successMessage.textContent = "";

            resetResults();

            return;

        }

        errorMessage.textContent = "";

        successMessage.textContent =
            "✅ Trip calculated successfully.";

        try {
            const result = await requestTripCalculation(tripInput);
            updateResults(result);
            successMessage.textContent = result.saved
                ? "✅ Trip calculated and saved to your history."
                : "✅ Trip calculated successfully.";
        } catch (error) {
            successMessage.textContent = "";
            errorMessage.textContent = error.message;
            resetResults();
        }

    });

    async function requestTripCalculation(tripInput) {
        const selectedVehicle = vehicleSelect.selectedOptions[0];
        const response = await fetch("/api/v1/trips/calculate", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                distance: tripInput.distance,
                consumption: tripInput.consumption,
                tank_capacity: tripInput.tankCapacity,
                fuel_price: tripInput.fuelPrice,
                minimum_fuel_price: Number(fuelPriceInput.dataset.minimumPrice) || tripInput.fuelPrice,
                maximum_fuel_price: Number(fuelPriceInput.dataset.maximumPrice) || tripInput.fuelPrice,
                trip_type: tripInput.tripType,
                traffic_condition: tripInput.trafficCondition,
                vehicle_name: vehicleSelect.value === CATALOG_OPTION
                    ? (catalogVehicle?.name.slice(0, 100) || "Manual entry")
                    : (vehicleSelect.value ? selectedVehicle?.textContent.trim() : "Manual entry"),
                origin: document.getElementById("route-start-label")?.textContent.trim() || null,
                destination: document.getElementById("route-end-label")?.textContent.trim() || null
            })
        });
        const body = await response.json();
        if (!response.ok) {
            const detail = Array.isArray(body.detail) ? body.detail.map(item => item.msg).join(" ") : body.detail;
            throw new Error(detail || "Trip could not be calculated.");
        }
        return {
            totalDistance: body.total_distance,
            fuelRequired: body.fuel_required,
            totalCost: body.total_cost,
            estimatedRange: body.estimated_range,
            fuelStops: body.fuel_stops,
            minFuelRequired: body.min_fuel_required,
            maxFuelRequired: body.max_fuel_required,
            minTotalCost: body.min_total_cost,
            maxTotalCost: body.max_total_cost,
            minFuelStops: body.min_fuel_stops,
            maxFuelStops: body.max_fuel_stops,
            saved: body.saved
        };
    }

    function animateValue(
        element,
        start,
        end,
        duration,
        formatter
    ) {

        const startTime = performance.now();

        function frame(currentTime) {

            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const value =
                start + (end - start) * progress;

            element.textContent =
                formatter(value);

            if (progress < 1) {

                requestAnimationFrame(frame);

            }

        }

        requestAnimationFrame(frame);

    }

    function updateResults(result) {

        animateValue(
            distanceResult,
            0,
            result.totalDistance,
            700,
            value => `${value.toFixed(1)} km`
        );

        fuelResult.textContent = `${result.minFuelRequired.toFixed(2)} – ${result.maxFuelRequired.toFixed(2)} L`;

        const formatCurrency = value => value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
        costResult.textContent = `${formatCurrency(result.minTotalCost)} – ${formatCurrency(result.maxTotalCost)}`;

        animateValue(
            rangeResult,
            0,
            result.estimatedRange,
            700,
            value => `${value.toFixed(0)} km`
        );

        stopResult.textContent = result.minFuelStops === result.maxFuelStops
            ? String(result.minFuelStops)
            : `${result.minFuelStops} – ${result.maxFuelStops}`;

    }

    function resetResults() {

        distanceResult.textContent =
            "0 km";

        fuelResult.textContent =
            "0.00 L";

        costResult.textContent =
            "₺0.00";

        rangeResult.textContent =
            "0 km";

        stopResult.textContent =
            "0";

    }

    console.log("🚀 FuelWise Started");

});

import "./vehicle-manager.js";
