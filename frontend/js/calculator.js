export function calculateTrip({
    distance,
    consumption,
    tankCapacity,
    fuelPrice,
    tripType
}) {
    const tripMultiplier = tripType === "round-trip" ? 2 : 1;

    const totalDistance = distance * tripMultiplier;
    const fuelRequired = (totalDistance * consumption) / 100;
    const totalCost = fuelRequired * fuelPrice;
    const estimatedRange = (tankCapacity / consumption) * 100;

    const fullTanksNeeded = Math.ceil(
        fuelRequired / tankCapacity
    );

    const fuelStops = Math.max(
        fullTanksNeeded - 1,
        0
    );

    return {
        totalDistance,
        fuelRequired,
        totalCost,
        estimatedRange,
        fuelStops
    };
}

export function isValidTripInput({
    distance,
    consumption,
    tankCapacity,
    fuelPrice,
    tripType
}) {
    const validTripTypes = [
        "one-way",
        "round-trip"
    ];

    return (
        Number.isFinite(distance) &&
        Number.isFinite(consumption) &&
        Number.isFinite(tankCapacity) &&
        Number.isFinite(fuelPrice) &&
        distance > 0 &&
        consumption > 0 &&
        tankCapacity > 0 &&
        fuelPrice > 0 &&
        validTripTypes.includes(tripType)
    );
}