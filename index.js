const input = document.querySelector('input');
const button = document.querySelector('button');
const body = document.querySelector('body');
const INVALID = 0;
const VALID = 1;
const temperature = body.querySelector('.temperature > h1');
const conditionIcon = body.querySelector('.temperature > img');
const condition = body.querySelector('.condition > h4');
const feelsLike = body.querySelector('.condition > h5');
const city = body.querySelector('.city');
const country = body.querySelector('.country');
const time = body.querySelector('.location > :first-child');
const date = body.querySelector('.time > :first-child');
const lastUpdate = body.querySelector('.time > .fade');
const wind = document.querySelector('#wind > h4');
const rain = document.querySelector('#rain > h4');
const visibility = document.querySelector('#visibility > h4');
const aqi = document.querySelector('#aqi > h4');
const humidity = document.querySelector('#humidity > h4');
const UVIndex = document.querySelector('#uv > h4');

input.addEventListener('focus', (e) => {
    input.placeholder = '';
});
input.addEventListener('blur', () => {
    input.placeholder = 'City, Country';
})

function recommendOutdoor(currentData) { 
    
    let recommendations = [];
    if(currentData.current.aqi > 300 || currentData.current.temp < 0
        || currentData.current.temp > 40) {
        return 'Avoid outdoor activities';
    }
    if(currentData.current.aqi > 200 || currentData.current.temp > 30 || currentData.current.uv >= 9) {
        return 'Limit outdoor activities';
    }
    if(currentData.current.wind_speed > 30) {
        recommendations.push('Avoid activities that could be affected by wind');
    }
    if(currentData.current.visibility < 5) {
        recommendations.push('Limit outdoor activities that require good visibility');
    }
    if(recommendations.length > 0) {
        if(recommendations.length > 1) {
            // convert the first letter of the second item to lowercase
            recommendations[1] = recommendations[1].charAt(0).toLowerCase() + recommendations[1].slice(1);
            return recommendations.join(', and ');
        } else {
            return recommendations[0];
        }
    }
    return 'Ideal for outdoor activities';
}

function recommendClothing(currentData) {

    let temperature = currentData.current.temp;
    let wind = currentData.current.wind_speed;

    // Warm to Hot Temperatures (above 24°C) 
    if(temperature > 24) {
        if(wind < 30) {
            return 'Light clothing, such as T-shirts, shorts, and dresses';
        } else {
            return 'Might need a light windbreaker or long-sleeve shirt to counteract the wind\'s cooling effect';
        }
    }
    // Mild Temperatures (16°C to 24°C)
    if(temperature > 16) {
        if(wind < 15) {
            return 'Long-sleeve shirts, light sweaters, and jeans or similar';
        } else {
            return 'Add a wind-resistant jacket or layer with a scarf to protect against wind chill';
        }
    }
    // Cool to Cold Temperatures (0°C to 16°C)
    if(temperature > 0) {
        if(wind < 15) {
            return 'Medium layers, such as a sweater and a light jacket';
        } else {
            return 'Heavy jacket, gloves, and a hat to protect against the wind chill effect';
        }
    }
    // Very Cold Temperatures (below 0°C)
    return 'Thermal layers, a heavy insulated jacket, gloves, a hat, and a scarf. If the wind is strong, ensure that outerwear is windproof to provide additional protection';
}

function recommendSunProtection(currentData) {
    let uv = currentData.current.uv;
    if(uv > 11) {
        return 'Avoid sun exposure between 10 a.m. and 4 p.m., seek shade, and use maximum protection';
    }
    if(uv > 8) {
        return 'Minimize outdoor activities during midday, seek shade, and protect yourself';
    }
    if(uv > 6) {
        return 'Reduce exposure between 10 a.m. and 4 p.m., wear protective clothing, and use sunscreen';
    }
    if(uv > 3) {
        return 'Wear sunglasses and apply sunscreen';
    }
    return 'Safe for outdoor activities';
}

function recommendDriving(currentData) {
    let visibility = currentData.current.visibility;

    if(visibility < 5) {
        return 'Poor for driving, and activities that require good visibility should be limited';
    } else if (visibility < 10) {
        return 'Moderate for driving, be cautious while driving or biking';
    } else {
        return 'Good for driving';
    }
}

function recommendUmbrella(currentData) {
    let rainChance = currentData.current.rain_chance;
    let willRain = currentData.current.will_rain;
    if(willRain) {
        return 'Must carry an umbrella or raincoat today';
    }
    if(rainChance > 50) {
        return 'High chance of rain. Consider indoor alternatives or wear appropriate rain gear';
    } else if (rainChance > 20) {
        return 'May need an umbrella or raincoat today';
    } else {
        return 'No umbrella needed today';
    }
}

function recommendMask(currentData) {
    let aqi = currentData.current.aqi;
    if(aqi > 200) {
        return 'Wear a mask if you need to go outside';
    }
    if(aqi > 150) {
        return 'Sensitive individuals should wear a mask if you need to go outside';
    }
    return 'No need to wear a mask today';
}

function recommendHydration(currentData) {

    let humidity = currentData.current.humidity;
    let temperature = currentData.current.temp;

    if(temperature > 30 || humidity < 30 ) {
        return 'Stay hydrated';
    }
    if(humidity > 60) {
        return 'High humidity. Can feel hotter, stay hydrated, and consider shorter or less intense activities';
    }
    return 'No risk of heat stroke';
}


document.addEventListener('DOMContentLoaded', async () => {

    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=06c48910ce8449d7ab7184401242701&q=Melbourne&days=3&aqi=yes`, {
    mode: 'cors'});
    // convert to json format
    const data = await response.json();
    console.log(data);
    let currentData = getCurrentData(data);
    let forecastData = getForecastData(data);
    displayData(currentData, forecastData);
});

button.addEventListener('click', async () => {

    let data = await fetchData();
    let currentData = getCurrentData(data);
    let forecastData = getForecastData(data);
    console.log(currentData);
    console.log(forecastData);

    // Display the data
    displayData(currentData, forecastData);
});

// Request and fetch the api response
async function fetchData() {
    if(validateInput(input) === INVALID) {
        return INVALID;
    };
    // get the response
    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=06c48910ce8449d7ab7184401242701&q=${input.value}&days=3&aqi=yes`, {
        mode: 'cors'});
    // convert to json format
    const data = await response.json();
    console.log(data);

    // reset the input box 
    input.value = '';
    return data;
}

function validateInput(input) {
    // Check if the user input any data
    if(input.value === '') {
        alert('Please enter a city');
        return INVALID;
    }
    return VALID;
}

function getCurrentData(data) {
    return {

        current: {
            location: data.location.name,
            country: data.location.country,
            time: data.location.localtime,
            temp: data.current.temp_c,
            date: data.forecast.forecastday[0].date,
            day: getDayName(data.forecast.forecastday[0].date),
            max_temp: data.forecast.forecastday[0].day.maxtemp_c,
            min_temp: data.forecast.forecastday[0].day.mintemp_c,
            condition: data.current.condition.text,
            icon: data.current.condition.icon,
            is_day: data.current.is_day,
            rain_chance: data.forecast.forecastday[0].day.daily_chance_of_rain,
            will_rain: data.forecast.forecastday[0].day.daily_will_it_rain,
            uv: data.current.uv,
            aqi: data.current.air_quality['pm2_5'],
            visibility: data.current.vis_km,
            wind_speed: data.current.wind_kph,
            last_updated: data.current.last_updated,
            humidity: data.current.humidity
        }
    }
}

function getForecastData(data) {

    return {
            day1: forecastDay(data.forecast.forecastday[1]),
            day2: forecastDay(data.forecast.forecastday[2]),
        }
}

function forecastDay(forecastday) {
    return {
        date: forecastday.date,
        day: getDayName(forecastday.date),
        max_temp: forecastday.day.maxtemp_c,
        min_temp: forecastday.day.mintemp_c,
        condition: forecastday.day.condition.text,
        icon: forecastday.day.condition.icon,
        rain_chance: forecastday.day.daily_chance_of_rain,
        will_rain: forecastday.day.daily_will_it_rain,
        uv: forecastday.day.uv,
        visibility: forecastday.day.avgvis_km,
        wind_speed: forecastday.day.maxwind_kph
    }
}
/*

  <section id="recommendations">
    <div class="title">
      <h2> Recommendations </h2>
      <img src="./icons8-general-mandatory-action-100.png"> 
    </div>

    <div class="recommendations-container">
    
      <div id="clothing">
        <img src="./icons8-jacket-100.png" class="icon">
        <p></p>
      </div>
      <div id="sun-protection">
        <img src="./icons8-sun-cream-64.png" class="icon">
        <p></p>
      </div>
      <div id="outdoor">
        <img src="./icons8-skiing-80.png" class="icon">
        <p></p>
      </div>
      <div id="mask">
        <img src="./icons8-face-mask-64.png" class="icon">
        <p></p>
      </div>
      <div id="rain">
        <img src="./icons8-umbrella-96.png" class="icon">
        <p></p>
      </div>
      <div id="driving">
        <img src="./icons8-steering-wheel-64.png" class="icon">
        <p></p>
      </div>
      <div id="hydration">
        <img src="./icons8-heat-64.png" class="icon">
        <p></p>
      </div>
    </div>
  </section>

*/

const recommendations = document.querySelector('#recommendations');
const clothing = document.querySelector('#clothing > p');
const sunProtection = document.querySelector('#sun-protection > p');
const outdoor = document.querySelector('#outdoor > p');
const mask = document.querySelector('#mask > p');
const umbrella = document.querySelector('#rain > p');
const driving = document.querySelector('#driving > p');
const hydration = document.querySelector('#hydration > p');



function displayData(currentData, forecastData) {
/*


 */
    conditionIcon.src = currentData.current.icon;
    temperature.textContent = `${currentData.current.temp}°C`;
    condition.textContent = currentData.current.condition;
    feelsLike.textContent = `Feels like ${currentData.current.temp}°C`;
    city.textContent = currentData.current.location;
    country.textContent = currentData.current.country;
    time.textContent = convertTo12Hour(currentData.current.time.split(' ')[1]);
    date.textContent = `${currentData.current.day}, ${currentData.current.date}`;
    lastUpdate.textContent = `Last updated: ${gettimeDifference(currentData.current.last_updated, currentData.current.time)} minutes ago`;
    wind.textContent = `${currentData.current.wind_speed} km/h`;
    rain.textContent = `${currentData.current.rain_chance}%`;
    visibility.textContent = `${currentData.current.visibility} km`;
    aqi.textContent = `${currentData.current.aqi}`;
    humidity.textContent = `${currentData.current.humidity}%`;
    UVIndex.textContent = `${currentData.current.uv}`;


    clothing.textContent = recommendClothing(currentData);
    sunProtection.textContent = recommendSunProtection(currentData);
    outdoor.textContent = recommendOutdoor(currentData);
    mask.textContent = recommendMask(currentData);
    umbrella.textContent = recommendUmbrella(currentData);
    driving.textContent = recommendDriving(currentData);
    hydration.textContent = recommendHydration(currentData);

    console.log(recommendOutdoor(currentData));
    console.log(recommendClothing(currentData));
    console.log(recommendSunProtection(currentData));
    console.log(recommendDriving(currentData));
    console.log(recommendUmbrella(currentData));
    console.log(recommendMask(currentData));
    console.log(recommendHydration(currentData));

}

function getDayName(dateData) {
    let date = new Date(dateData);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

function interpretAQI(defraIndex) {

    if(defraIndex <= 3) {
        return 'Low';
    } else if(defraIndex <= 6) {
        return 'Moderate';
    } else if(defraIndex <= 9) {
        return 'High';
    } else {
        return 'Very High';
    }
}

function convertTo12Hour(time) {
    let hours = time.split(':')[0];
    let minutes = time.split(':')[1];

    hours = parseInt(hours);
    if(hours == 0) {
        return `12:${minutes} AM`;
    }
    if(hours == 24) {
        return `12:${minutes} AM`;
    }
    if(hours == 12) {
        return `12:${minutes} PM`;
    
    }
    if(hours > 12) {
        return `${hours - 12}:${minutes} PM`;
    } else {
        return `${hours}:${minutes} AM`;
    }
}

function gettimeDifference(time1, time2) {
    let date1 = new Date(time1);
    let date2 = new Date(time2);
    let difference = date2 - date1;
    return millisecondsToMinutes(difference);
}

function millisecondsToMinutes(milliseconds) {
    return Math.floor(milliseconds / 60000);
}



