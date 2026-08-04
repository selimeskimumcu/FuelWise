import {
    getVehicleById
} from "./vehicles.js";

import {
    calculateTrip,
    isValidTripInput
} from "./calculator.js";

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

    vehicleSelect.addEventListener("change", () => {

        const vehicle =
            getVehicleById(vehicleSelect.value);

        if (!vehicle) {

            consumptionInput.value = "";

            tankCapacityInput.value = "";

            return;

        }

        consumptionInput.value =
            vehicle.consumption;

        tankCapacityInput.value =
            vehicle.tankCapacity;

    });

    fuelForm.addEventListener("submit", (event) => {

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
                )?.value

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

        const result =
            calculateTrip(tripInput);
        updateResults(result);

    });

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

        animateValue(
            fuelResult,
            0,
            result.fuelRequired,
            700,
            value => `${value.toFixed(2)} L`
        );

        animateValue(
            costResult,
            0,
            result.totalCost,
            900,
            value =>
                value.toLocaleString(
                    "tr-TR",
                    {
                        style: "currency",
                        currency: "TRY"
                    }
                )
        );

        animateValue(
            rangeResult,
            0,
            result.estimatedRange,
            700,
            value => `${value.toFixed(0)} km`
        );

        animateValue(
            stopResult,
            0,
            result.fuelStops,
            500,
            value => {

                const stops =
                    Math.round(value);

                if (stops === 0) {

                    return "No stop needed";

                }

                return `${stops} ${stops === 1
                    ? "stop"
                    : "stops"
                    }`;

            }
        );

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