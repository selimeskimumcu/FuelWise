export const vehicles = {
    forza: {
        name: "Honda Forza 250",
        consumption: 3.4,
        tankCapacity: 11.7
    },

    cl250: {
        name: "Honda CL250",
        consumption: 3.2,
        tankCapacity: 12
    },

    pcx: {
        name: "Honda PCX 125",
        consumption: 2.2,
        tankCapacity: 8.1
    }
};

export function getVehicleById(vehicleId) {
    return vehicles[vehicleId] ?? null;
}