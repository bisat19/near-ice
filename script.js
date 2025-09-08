document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENT SELECTION ===
    const body = document.body;
    const mascotImage = document.getElementById('mascot-image');
    const weatherIconEl = document.getElementById('weather-icon'); // Renamed to avoid conflict
    const temperatureEl = document.getElementById('temperature');
    const conditionEl = document.getElementById('condition');
    
    // === WEATHER API CONFIGURATION ===
    // IMPORTANT: Replace 'YOUR_API_KEY' with your actual free API key from OpenWeatherMap
    // Get it from: https://openweathermap.org/api
    const apiKey = 'adb7b291d91d09514cbe886a14976934'; 

    // Function to map weather conditions to themes, mascots, and icons
    const getWeatherStyle = (weatherMain) => {
        const condition = weatherMain.toLowerCase();
        
        // Conditions for rainy/cloudy theme
        if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm') || condition.includes('clouds')) {
            return {
                theme: 'rainy-theme',
                mascot: 'mascot-2.png', // Mascot with umbrella
                icon: '☁️' // Cloud icon for general cloudy/rainy weather
            };
        }
        
        // Default to sunny theme for clear, sun, etc.
        return {
            theme: 'sunny-theme',
            mascot: 'mascot-1.png', // Mascot sitting
            icon: '☀️' // Sun icon for sunny weather
        };
    };

    // Function to update the UI (theme, mascot, weather icon)
    const applyTheme = (style) => {
        body.className = style.theme; // Sets body class (sunny-theme or rainy-theme)
        mascotImage.src = style.mascot; // Changes mascot image
        weatherIconEl.textContent = style.icon; // Changes weather icon
    };

    // Function to fetch weather data from API
    const getWeatherData = async (lat, lon) => {
        if (apiKey === 'YOUR_API_KEY' || !apiKey || apiKey.length < 30) { // Check if API Key is valid
            conditionEl.textContent = 'API Key is missing or invalid.';
            console.error("Please replace 'YOUR_API_KEY' in script.js with your actual OpenWeatherMap API Key.");
            // Apply default sunny theme if API Key is bad
            applyTheme(getWeatherStyle('clear')); 
            temperatureEl.textContent = '--°C';
            return;
        }

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // Check for common API errors (e.g., 401 Unauthorized for invalid API key)
                const errorData = await response.json();
                throw new Error(`Failed to fetch weather: ${response.status} - ${errorData.message}`);
            }
            
            const data = await response.json();
            
            // Update weather info
            temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
            conditionEl.textContent = data.weather[0].description; // Use description for more detail

            // Get and apply the correct style based on weather condition
            const style = getWeatherStyle(data.weather[0].main); // Use data.weather[0].main for primary condition
            applyTheme(style);

        } catch (error) {
            console.error('Fetch Weather Error:', error);
            conditionEl.textContent = 'Could not fetch weather.';
            temperatureEl.textContent = '--°C';
            applyTheme(getWeatherStyle('clear')); // Apply default sunny theme on error
        }
    };

    // Function to get user's location
    const getUserLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    getWeatherData(latitude, longitude);
                },
                (error) => {
                    console.error('Geolocation Error:', error);
                    conditionEl.textContent = 'Location access denied.';
                    temperatureEl.textContent = '--°C';
                    applyTheme(getWeatherStyle('clear')); // Apply default sunny theme if location is denied
                }
            );
        } else {
            conditionEl.textContent = 'Geolocation not supported.';
            temperatureEl.textContent = '--°C';
            applyTheme(getWeatherStyle('clear')); // Apply default sunny theme if not supported
        }
    };
    
    // === INITIALIZE THE APP ===
    getUserLocation();
});