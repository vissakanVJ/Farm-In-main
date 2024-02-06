document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const loadingOverlay = document.querySelector('.loading-overlay');

    getLocation();
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.querySelector('#location-info').textContent = 'Geolocation is not supported by your browser';
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    handleLocation(latitude, longitude);
}

function showError(error) {
    let message = '';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = 'User denied the request for Geolocation';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
        case error.TIMEOUT:
            message = 'The request to get user location timed out';
            break;
        case error.UNKNOWN_ERROR:
            message = 'An unknown error occurred';
            break;
    }

    document.querySelector('#location-info').textContent = `Error: ${message}`;
}

function handleLocation(latitude, longitude) {
    const reverseGeocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    fetch(reverseGeocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data.address && data.address.city) {
                const city = data.address.city;
                document.querySelector('#location-info').textContent = `Current City : ${city}, India.`;
                getSoilType(city);
                getClimate(city);
                getSeason(city);
                getCrops(city);
            } else {
                document.querySelector('#location-info').textContent = 'Could not retrieve location details';
            }
        })
        .catch(error => {
            console.log('Error:', error);
            document.querySelector('#location-info').textContent = 'An error occurred while fetching location details';
        });
}

function getSoilType(city) {
    fetch('assets/soilTypes.json')
        .then(response => response.json())
        .then(data => {
            const soilType = data[city];

            if (soilType) {
                const soilTypeElement = document.querySelector('#soil-type');
                soilTypeElement.innerHTML = `Soil Type : ${soilType}`;
            } else {
                document.querySelector('#soil-type').textContent = 'Soil type not found for the location';
            }
        })
        .catch(error => {
            console.error('Error fetching soil types:', error);
        });
}



function getSeason(city) {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const season = getSeasonByMonth(month, day, city);
    document.querySelector('#season').textContent = `Current Season : ${season}`;
}

function getSeasonByMonth(month, day, city) {
    const seasonDates = {
        Winter: {
            startMonth: 12,
            startDay: 15,
            endMonth: 3,
            endDay: 15
        },
        Summer: {
            startMonth: 3,
            startDay: 16,
            endMonth: 6,
            endDay: 15
        },
        Monsoon: {
            startMonth: 6,
            startDay: 16,
            endMonth: 9,
            endDay: 15
        },
        Autumn: {
            startMonth: 9,
            startDay: 16,
            endMonth: 12,
            endDay: 14
        }
    };

    let season;
    for (const [seasonName, dates] of Object.entries(seasonDates)) {
        if ((month > dates.startMonth || (month === dates.startMonth && day >= dates.startDay)) &&
            (month < dates.endMonth || (month === dates.endMonth && day <= dates.endDay))) {
            season = seasonName;
            break;
        }
    }
    return season;
}


function getClimate(city) {
    const apiKey = '64a1a838ea1e3efb658634ef708680ac';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.weather && data.weather.length > 0) {
                const climate = data.weather[0].description;
                const temperature = data.main.temp;
                const windSpeed = data.wind.speed;
                const humidity = data.main.humidity;

                document.querySelector('#climate-info').innerHTML = `
                <p>Climate : ${capitalize(climate)}</p>
                <p>Temperature : ${temperature} °C</p>
                <p>Wind Speed : ${windSpeed} m/s</p>
                <p>Humidity : ${humidity}%</p>`;
                getCrops(city, temperature, humidity);

                function capitalize(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }
            } else {
                document.querySelector('#climate-info').textContent = 'Climate information not found for the location';
            }
        })
        .catch(error => {
            console.error('Error fetching climate information:', error);
            document.querySelector('#climate-info').textContent = 'An error occurred while fetching climate information';
        });
}

function getCrops(city) {
    Promise.all([fetch('assets/soilTypes.json'), fetch('assets/crops.json')])
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(data => {
            const soilTypes = data[0];
            const crops = data[1];
            const citySoilTypes = soilTypes[city];

            if (citySoilTypes) {
                document.querySelector('#soil-type').textContent = `Soil Type: ${citySoilTypes}`;
                const recommendedCrops = crops.filter(crop => crop.soilTypes.some(type => citySoilTypes.includes(type)));

                if (recommendedCrops.length > 0) {
                    const cropList = recommendedCrops.map(crop => `<li><a href="assets/crop.html?crop=${encodeURIComponent(crop.name)}">${crop.name}</a></li>`).join('');
                    document.querySelector('#crop-recommendation').innerHTML = `Recommended Crops: <ul>${cropList}</ul>`;
                } else {
                    document.querySelector('#crop-recommendation').textContent = 'No crops found for the given soil type';
                }
            } else {
                document.querySelector('#soil-type').textContent = 'Soil type not found for the location';
            }
        })
        .catch(error => {
            console.error('Error fetching soil types and crop data:', error);
        });
}