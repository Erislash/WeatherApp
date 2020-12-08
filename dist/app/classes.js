export class UI{
    PaintCountries(p_countries, p_containerID){
        let output = '';
        p_countries.forEach(element => {
            output += `<div class="country" data-name="${element}">
                            ${element}
                        </div>`;
        });
        document.querySelector(`#${p_containerID}`).innerHTML = output;
    }
    PaintCities(p_cities, p_containerID){
        let output = '';
        p_cities.forEach(element => {
            output += `<div class="city" data-city="${element.toLowerCase()}">
                            ${element}
                        </div>`;
        });
        document.querySelector(`#${p_containerID}`).innerHTML = output;
    }
    PaintWeatherInfo(p_celciusTemp, p_weatherText, p_containerID){
        let output = '';
        output += `<div class="temperature">${p_celciusTemp}<b>°C</b></div>`;
        output += `<div class="weatherType">${p_weatherText}</div>`;
        document.querySelector(`#${p_containerID}`).innerHTML = output;
    }
}