const STORAGE_KEY = "fuelwise_custom_vehicles";

export function getStoredVehicles() {
    const storedVehicles = localStorage.getItem(STORAGE_KEY);

    if (!storedVehicles) {
        return [];
    }

    try {
        const vehicles = JSON.parse(storedVehicles);

        return Array.isArray(vehicles)
            ? vehicles
            : [];
    } catch (error) {
        console.error(
            "Stored vehicles could not be read:",
            error
        );

        return [];
    }
}

export function saveStoredVehicles(vehicles) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(vehicles)
    );
}

export function addStoredVehicle(vehicle) {
    const vehicles = getStoredVehicles();

    vehicles.push(vehicle);

    saveStoredVehicles(vehicles);

    return vehicle;
}

export function deleteStoredVehicle(vehicleId) {
    const vehicles = getStoredVehicles();

    const updatedVehicles = vehicles.filter(
        vehicle => vehicle.id !== vehicleId
    );

    saveStoredVehicles(updatedVehicles);

    return updatedVehicles;
}