document.addEventListener("DOMContentLoaded", () => {
    const mapElement = document.getElementById("trip-map");
    const distanceInput = document.getElementById("distance");

    if (!mapElement || !distanceInput) return;

    const status = document.getElementById("route-map-status");
    const statusText = status.querySelector("span");
    const startLabel = document.getElementById("route-start-label");
    const endLabel = document.getElementById("route-end-label");
    const distanceLabel = document.getElementById("route-distance-label");
    const resetButton = document.getElementById("route-reset");
    const startSearch = document.getElementById("route-start-search");
    const endSearch = document.getElementById("route-end-search");
    const startSuggestions = document.getElementById("route-start-suggestions");
    const endSuggestions = document.getElementById("route-end-suggestions");

    let startPoint = null;
    let endPoint = null;
    let startMarker = null;
    let endMarker = null;
    let routeLine = null;
    let routeRequest = null;
    let selectionVersion = 0;
    let lastGeocodeAt = 0;
    let geocodeQueue = Promise.resolve();

    const messages = {
        "Map could not be loaded. Please check your connection.": ["Harita yüklenemedi. Lütfen internet bağlantınızı kontrol edin.", "Карта не загрузилась. Проверьте подключение.", "地图无法加载，请检查网络连接。"],
        "Calculating road route...": ["Yol rotası hesaplanıyor...", "Расчёт дорожного маршрута...", "正在计算道路路线..."],
        "Route service returned an error.": ["Rota servisi bir hata döndürdü.", "Сервис маршрутов вернул ошибку.", "路线服务返回错误。"],
        "No drivable route was found.": ["Sürüşe uygun bir rota bulunamadı.", "Подходящий автомобильный маршрут не найден.", "未找到可驾车路线。"],
        "Route ready": ["Rota hazır", "Маршрут готов", "路线已就绪"],
        "Route could not be calculated.": ["Rota hesaplanamadı.", "Не удалось рассчитать маршрут.", "无法计算路线。"],
        "Click the map to choose": ["Seçmek için haritaya tıklayın", "Нажмите на карту для выбора", "点击地图进行选择"],
        "Waiting for starting point": ["Başlangıç noktası bekleniyor", "Ожидание точки отправления", "等待选择起点"],
        "Choose your starting point": ["Başlangıç noktanızı seçin", "Выберите точку отправления", "选择您的起点"],
        "Now choose your destination": ["Şimdi varış noktanızı seçin", "Теперь выберите пункт назначения", "现在请选择目的地"]
        ,"Finding address...": ["Adres bulunuyor...", "Определяем адрес...", "正在查找地址..."]
    };
    messages["Neighbourhood, district or city"] = ["Mahalle, ilçe veya şehir", "Район, округ или город", "街区、区县或城市"];
    messages["No address found"] = ["Adres bulunamadı", "Адрес не найден", "未找到地址"];
    const languageIndexes = { tr: 0, ru: 1, zh: 2 };
    const translate = message => {
        const lang = localStorage.getItem("fuelwise-language") || "en";
        return lang === "en" ? message : (messages[message]?.[languageIndexes[lang]] || message);
    };

    if (!window.L) {
        status.classList.add("is-error");
        statusText.textContent = translate("Map could not be loaded. Please check your connection.");
        return;
    }

    const map = L.map(mapElement, { zoomControl: false }).setView([39.0, 35.0], 6);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const markerIcon = (type) => L.divIcon({
        className: `fuelwise-map-marker fuelwise-map-marker-${type}`,
        html: type === "start" ? '<span><i class="fa-solid fa-play"></i></span>' : '<span><i class="fa-solid fa-flag-checkered"></i></span>',
        iconSize: [42, 42],
        iconAnchor: [21, 40]
    });

    const formatCoordinate = point => `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;

    function formatAddress(data, point) {
        const address = data?.address || {};
        const neighbourhood = address.neighbourhood || address.quarter || address.suburb;
        const district = address.town || address.city_district || address.district || address.county;
        const city = address.city || address.municipality || address.province || address.state;
        const parts = [neighbourhood, district, city].filter((part, index, list) => part && list.indexOf(part) === index);

        if (parts.length) return parts.join(" / ");
        if (data?.display_name) return data.display_name.split(",").slice(0, 3).join(" / ");
        return formatCoordinate(point);
    }

    function scheduleNominatim(task) {
        geocodeQueue = geocodeQueue.catch(() => null).then(async () => {
            const waitTime = Math.max(0, 1050 - (Date.now() - lastGeocodeAt));
            if (waitTime) await new Promise(resolve => setTimeout(resolve, waitTime));
            lastGeocodeAt = Date.now();
            return task();
        });
        return geocodeQueue;
    }

    function resolveAddress(point, label, version, input) {
        label.textContent = translate("Finding address...");

        scheduleNominatim(async () => {
            const selectedLanguage = localStorage.getItem("fuelwise-language") || "en";
            const language = selectedLanguage === "zh" ? "zh-CN" : selectedLanguage;
            const query = new URLSearchParams({
                format: "jsonv2",
                lat: point.lat,
                lon: point.lng,
                zoom: "18",
                addressdetails: "1",
                layer: "address",
                "accept-language": language
            });

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`);
                if (!response.ok) throw new Error("Address lookup failed.");
                const data = await response.json();
                if (selectionVersion === version) {
                    const address = formatAddress(data, point);
                    label.textContent = address;
                    if (input) input.value = address;
                }
            } catch {
                if (selectionVersion === version) {
                    label.textContent = formatCoordinate(point);
                    if (input) input.value = formatCoordinate(point);
                }
            }
        });
    }

    function setStatus(message, state = "") {
        status.classList.remove("is-loading", "is-ready", "is-error");
        if (state) status.classList.add(`is-${state}`);
        statusText.textContent = translate(message);
    }

    function clearDestination() {
        endMarker?.remove();
        routeLine?.remove();
        endPoint = endMarker = routeLine = null;
        distanceInput.value = "";
        distanceLabel.textContent = "— km";
    }

    function chooseStart(point, address = null) {
        selectionVersion += 1;
        startMarker?.remove();
        clearDestination();
        startPoint = point;
        startMarker = L.marker(startPoint, { icon: markerIcon("start") }).addTo(map);
        startLabel.textContent = address || formatCoordinate(point);
        startSearch.value = address || formatCoordinate(point);
        endSearch.disabled = false;
        endLabel.textContent = translate("Click the map to choose");
        resetButton.disabled = false;
        setStatus("Now choose your destination");
        if (!address) resolveAddress(startPoint, startLabel, selectionVersion, startSearch);
    }

    function chooseDestination(point, address = null) {
        if (!startPoint) return;
        clearDestination();
        endPoint = point;
        endMarker = L.marker(endPoint, { icon: markerIcon("end") }).addTo(map);
        endLabel.textContent = address || formatCoordinate(point);
        endSearch.value = address || formatCoordinate(point);
        if (!address) resolveAddress(endPoint, endLabel, selectionVersion, endSearch);
        drawRoute();
    }

    function renderSuggestions(container, results, onSelect) {
        container.replaceChildren();
        if (!results.length) {
            const empty = document.createElement("div");
            empty.className = "route-suggestion-empty";
            empty.textContent = translate("No address found");
            container.append(empty);
        } else {
            results.forEach(result => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "route-suggestion";
                button.setAttribute("role", "option");
                const icon = document.createElement("i");
                icon.setAttribute("data-lucide", "map-pin");
                const label = document.createElement("span");
                label.textContent = result.display_name;
                button.append(icon, label);
                button.addEventListener("click", () => onSelect(result));
                container.append(button);
            });
            window.lucide?.createIcons();
        }
        container.classList.add("open");
    }

    function setupAddressSearch(input, container, onSelect) {
        let debounceTimer = null;
        let requestVersion = 0;
        const field = input.closest(".route-search-field");

        input.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            const queryText = input.value.trim();
            requestVersion += 1;
            const version = requestVersion;
            if (queryText.length < 3) {
                container.classList.remove("open");
                container.replaceChildren();
                field.classList.remove("is-loading");
                return;
            }

            debounceTimer = setTimeout(async () => {
                field.classList.add("is-loading");
                const selectedLanguage = localStorage.getItem("fuelwise-language") || "en";
                const language = selectedLanguage === "zh" ? "zh-CN" : selectedLanguage;
                const query = new URLSearchParams({ format: "jsonv2", q: queryText, addressdetails: "1", limit: "5", countrycodes: "tr", "accept-language": language });
                try {
                    const results = await scheduleNominatim(async () => {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`);
                        if (!response.ok) throw new Error("Address search failed.");
                        return response.json();
                    });
                    if (version === requestVersion) renderSuggestions(container, results, result => {
                        container.classList.remove("open");
                        input.value = result.display_name;
                        onSelect(L.latLng(Number(result.lat), Number(result.lon)), formatAddress(result, L.latLng(Number(result.lat), Number(result.lon))));
                    });
                } catch {
                    if (version === requestVersion) renderSuggestions(container, [], () => {});
                } finally {
                    if (version === requestVersion) field.classList.remove("is-loading");
                }
            }, 450);
        });

        input.addEventListener("keydown", event => {
            if (event.key === "Escape") container.classList.remove("open");
        });
    }

    async function drawRoute() {
        routeRequest?.abort();
        routeRequest = new AbortController();
        setStatus("Calculating road route...", "loading");

        const coordinates = `${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}`;

        try {
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`, {
                signal: routeRequest.signal
            });

            if (!response.ok) throw new Error("Route service returned an error.");

            const data = await response.json();
            const route = data.routes?.[0];
            if (!route) throw new Error("No drivable route was found.");

            routeLine?.remove();
            routeLine = L.geoJSON(route.geometry, {
                style: { color: "#38bdf8", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }
            }).addTo(map);

            const distanceKm = route.distance / 1000;
            distanceInput.value = distanceKm.toFixed(1);
            distanceInput.dispatchEvent(new Event("input", { bubbles: true }));
            distanceLabel.textContent = `${distanceKm.toFixed(1)} km`;
            map.fitBounds(routeLine.getBounds(), { padding: [45, 45] });
            setStatus("Route ready", "ready");
        } catch (error) {
            if (error.name === "AbortError") return;
            distanceInput.value = "";
            distanceLabel.textContent = "— km";
            setStatus(messages[error.message] ? error.message : "Route could not be calculated.", "error");
        }
    }

    function resetRoute() {
        selectionVersion += 1;
        routeRequest?.abort();
        startMarker?.remove();
        endMarker?.remove();
        routeLine?.remove();
        startPoint = endPoint = startMarker = endMarker = routeLine = null;
        distanceInput.value = "";
        startLabel.textContent = translate("Click the map to choose");
        endLabel.textContent = translate("Waiting for starting point");
        startSearch.value = "";
        endSearch.value = "";
        endSearch.disabled = true;
        startSuggestions.classList.remove("open");
        endSuggestions.classList.remove("open");
        distanceLabel.textContent = "— km";
        resetButton.disabled = true;
        setStatus("Choose your starting point");
    }

    map.on("click", event => {
        if (startPoint && endPoint) resetRoute();

        if (!startPoint) {
            chooseStart(event.latlng);
            return;
        }

        chooseDestination(event.latlng);
    });

    setupAddressSearch(startSearch, startSuggestions, chooseStart);
    setupAddressSearch(endSearch, endSuggestions, chooseDestination);
    startSearch.placeholder = translate("Neighbourhood, district or city");
    endSearch.placeholder = translate("Neighbourhood, district or city");
    document.addEventListener("click", event => {
        if (!event.target.closest(".route-search-field")) {
            startSuggestions.classList.remove("open");
            endSuggestions.classList.remove("open");
        }
        if (event.target.closest(".language-option")) {
            setTimeout(() => {
                startSearch.placeholder = translate("Neighbourhood, district or city");
                endSearch.placeholder = translate("Neighbourhood, district or city");
            });
        }
    });
    resetButton.addEventListener("click", resetRoute);
    window.addEventListener("resize", () => map.invalidateSize());
});
