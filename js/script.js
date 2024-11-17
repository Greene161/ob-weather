document.addEventListener("DOMContentLoaded", () => {
    const apiKey = '72126186cdab736c8f43e38b04878c08';
    const defaultIcon = "images/icons/icon-1.svg"; // Use a default icon if needed

    // Elements for current weather
    const currentDay = document.querySelector(".today .day");
    const currentDate = document.querySelector(".today .date");
    const currentLocation = document.querySelector(".today .location");
    const currentTemp = document.querySelector(".today .num");
    const currentIcon = document.querySelector(".today .forecast-icon img");
    const currentHumidity = document.querySelector(".today span:nth-of-type(1)");
    const currentWindSpeed = document.querySelector(".today span:nth-of-type(2)");
    const currentWindDirection = document.querySelector(".today span:nth-of-type(3)");
    const heroDiv = document.querySelector(".hero");

    // Form and input elements
    const searchForm = document.querySelector(".find-location");
    const searchInput = searchForm.querySelector("input[type='text']");
    const useDeviceLocationBtn = document.getElementById("use-device-location");

    // Fetch weather data by location or city
    function fetchWeatherData(location) {
        const endpoint = typeof location === "string" 
            ? `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
            : `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`;

        fetch(endpoint)
            .then(response => response.json())
            .then(data => updateCurrentWeather(data))
            .catch(error => {
                console.error('Error getting location', error);
                alert('Could not retrieve that location.');
            });
    }

    // Use device location button click handler
    useDeviceLocationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => fetchWeatherData({ 
                    lat: position.coords.latitude, 
                    lon: position.coords.longitude 
                }),
                () => alert("Could not access your location. Please enable location services.")
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });

    // Handle search form submission
    searchForm.addEventListener("submit", event => {
        event.preventDefault();
        const city = searchInput.value.trim();
        if (city) {
            fetchWeatherData(city);
            searchInput.value = ""; // Clear the input field
        }
    });

    // Update current weather
    function updateCurrentWeather(data) {
        document.querySelector('.forecast-table').style.display = "block";
        const date = new Date();
        currentDay.textContent = date.toLocaleDateString("en-US", { weekday: "long" });
        currentDate.textContent = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
        const timezoneOffset = data.timezone; // in seconds
        const utcTime = Date.now() + new Date().getTimezoneOffset() * 60000; // Get UTC time in ms
        const localTime = new Date(utcTime + timezoneOffset * 1000); // Apply the city's timezone offset

        currentLocation.innerHTML = `
            ${data.name}, ${data.sys.country} 
            <span class="local-time"> | ${localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        `;
        currentLocation.innerHTML = `${data.name}, ${data.sys.country} <span class="local-time">${localTime.toLocaleTimeString()}</span>`;
        currentTemp.innerHTML = `${Math.round(data.main.temp)}<sup>o</sup>C`;
        currentHumidity.innerHTML = `<img src="images/icon-umberella.png" alt="">${data.main.humidity}%`;
        currentWindSpeed.innerHTML = `<img src="images/icon-wind.png" alt="">${data.wind.speed} km/h`;
        currentWindDirection.innerHTML = `<img src="images/icon-compass.png" alt="">${getWindDirection(data.wind.deg)}`;
        
        
        // Update icon
        const iconCode = data.weather[0].icon;
        currentIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        console.log("Weather condition:", data.weather[0].main);
        console.log("Weather icon:", data.weather[0].icon);

        // Update hero background
        const condition = data.weather[0].main.toLowerCase();
        updateHeroBackground(condition);
    }

    // Update the hero background class
    function updateHeroBackground(condition) {
        const conditionClasses = {
            "snow": "snowy",
            "clouds": "cloudy",
            "clear": "clear-sky",
            "rain": "rainy",
            "thunderstorm": "thunderstorm"
        };

        // Remove existing background classes
        heroDiv.classList.remove("bg-image", "snowy", "cloudy", "clear-sky", "rainy", "thunderstorm");

        // Add the new background class if it matches a condition
        const newClass = conditionClasses[condition] || "clear-sky"; // Default to clear-sky
        heroDiv.classList.add(newClass);
    }

    // Get wind direction from degrees
    function getWindDirection(deg) {
        const directions = ["North", "NE", "East", "SE", "South", "SW", "West", "NW"];
        return directions[Math.round(deg / 45) % 8];
    }

    // Get current location weather on page load
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => fetchWeatherData({ lat: position.coords.latitude, lon: position.coords.longitude }),
            () => fetchWeatherData("Kabwe") // Fallback city if location access is denied
        );
    } else {
        fetchWeatherData("Kabwe");
    }

    function fetchCitySuggestions(query) {
        const endpoint = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
        return fetch(endpoint)
            .then(response => response.json())
            .catch(error => console.error("Error fetching city suggestions:", error));
    }
    

    document.querySelector(".suggestions").addEventListener("click", (e) => {
        if (e.target.classList.contains("suggestion")) {
            const lat = e.target.dataset.lat;
            const lon = e.target.dataset.lon;
    
            fetchWeatherData({ lat, lon });
    
            // Hide suggestions and clear input
            document.querySelector(".suggestions").style.display = "none";
            searchInput.value = e.target.textContent;
        }
    });      
    

    // Handle search form submission
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        if (query.length > 2) {
            fetchCitySuggestions(query).then(data => {
                if (data && data.length) {
                    const suggestions = data.map(city => `
                        <div class="suggestion" data-lat="${city.lat}" data-lon="${city.lon}">
                            ${city.name}, ${city.country}
                        </div>
                    `).join("");
                    document.querySelector(".suggestions").innerHTML = suggestions;
                    document.querySelector(".suggestions").style.display = "block";
                } else {
                    document.querySelector(".suggestions").innerHTML = "<div>No results found</div>";
                    document.querySelector(".suggestions").style.display = "block";
                }
            });
        } else {
            document.querySelector(".suggestions").style.display = "none";
        }
    });
        
});
