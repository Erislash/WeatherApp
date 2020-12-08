import {UI} from './classes.js';

//UI management
let ui = new UI();

const weatherKey = 'nHUDMWo392zM7IFTmnHDLA6UyZpcVfjE';
let cityKey = 0;

//Country searcher input
const countryInput = document.querySelector('#countryInput');
//Country selected box
const countrySelected = document.querySelector('#countrySelected');


//City searcher input
const cityInput = document.querySelector('#cityInput');
//City selected box
const citySelected = document.querySelector('#citySelected');



const getWeatherBtn = document.querySelector('#getWeatherBtn');


const changeSystemBtn = document.querySelector('#changeSystem');

//Countries list. Requested in GetAllCountries
let countries = [];
//Cities list. Requested in GetAllCities function after select a country
let cities = [];

let tempCelcius = 0;
let tempFahrenheit = 0;
let tempSystem = 'C';
let weatherText = '';

GetAllCountries();
function GetAllCountries(){
    /*
        GetAllCountries: none -> none
        Make a GET request to https://restcountries.eu/rest/v2/all API in order to get all the countries and fill the 'countries' array with all 
    */
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://countriesnow.space/api/v0.1/countries/iso', true);
    
    xhr.onreadystatechange = function(){
        if(this.readyState == 3){
            console.log('Loading....')
        }
        if(this.status == 200 && this.readyState == 4){
            const data = JSON.parse(this.responseText).data;
            for(let i = 0; i < data.length; i++){
                countries.push(data[i].name);
            }
        }
        if(this.status == 404){
            console.error(new Error('Imposible conseguir la lista de paises'));
        }
    };
    xhr.send();
}

function GetAllCities(){
    /*
        GetAllCities: none -> none
        Make a POST request to https://countriesnow.space/api/v0.1/countries/cities API in order to get all the countries
    */
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://countriesnow.space/api/v0.1/countries/cities', true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function(){
        if(this.readyState == 3){
            console.log('Loading....')
        }
        if(this.status == 200 && this.readyState == 4){
            cities = JSON.parse(this.responseText).data;
            console.log(cities);
            ActiveCities();
        }
    };
    //Send with data as 'countriesnow' site requests
    xhr.send(JSON.stringify({
        country:`${countrySelected.dataset.country}`
    }));
}

function GetElementInListByName(p_name, p_object){
    /*
        GetElementInListByName: String Array|Object String(Optional) -> Array

        This function return an array with all the values of the original array (p_object parameter) whose first letters match with the p_name parameter

        Args:
            p_name: First letters of the words you want to match
            p_object: Array or Object where you have all the Strings you want to match
    */

    let output = [];
    const regEx = new RegExp(`^${p_name}`, 'i');

    output = p_object.filter(e => {
        return regEx.test(e);
    });
    console.log(output);
    return output
}

function UpdateEvents(p_objects, p_event, p_callback){
    p_objects.forEach(object => {
        object.addEventListener(`${p_event}`, p_callback);
    });
}

function ActiveCities(){
    document.querySelector('#citySelected').classList.add('active');
}

countryInput.addEventListener('input', LookForCountries);
function LookForCountries(e){
    /*
        LookForCountries: event -> none
        It's an event that must be used in a text input element. It will search in countries list for those countries whose names begin with the first (at least) three letters introduced in that input
    */
    let input = e.target.value;
    if(input.length >= 3 ){
        ResetData();
        const countriesList = GetElementInListByName(input, countries);
        ui.PaintCountries(countriesList, 'countriesResult');

        UpdateEvents(document.querySelectorAll('.country'), 'click', (e) => {
            countrySelected.textContent = e.target.textContent;
            countrySelected.dataset.country = e.target.dataset.name;
            countrySelected.dataset.iso = e.target.dataset.iso;
            document.querySelector('#countrySearcher').classList.remove('active');
            GetAllCities();
        });
    }
}

cityInput.addEventListener('input', LookForCities);
function LookForCities(e){
    /*
        LookForCities: event -> none

        It will search all the cities in 'cities' array which match with the input's value. You should introduce at least three letters to start the search
    */
    let input = e.target.value;
    if(input.length >= 3 ){
        const citiesList = GetElementInListByName(input, cities);
        console.log(citiesList);
        ui.PaintCities(citiesList, 'citiesResult');

        UpdateEvents(document.querySelectorAll('.city'), 'click', (e) => {
            citySelected.textContent = e.target.textContent;
            citySelected.dataset.city = e.target.textContent.toLowerCase();
            getWeatherBtn.classList.add('active');
            document.querySelector('#citySearcher').classList.remove('active');
        });
    }
}

function ResetData(){
    citySelected.classList.remove('active');
    citySelected.textContent = 'Search your city...';
    citySelected.dataset.city = '';
    getWeatherBtn.classList.remove('active');
    const citiesList = document.querySelector('#citiesResult');
    citySearcher.classList.remove('active');

    while(citiesList.firstChild){
        citiesList.removeChild(citiesList.firstChild);
    }
}


countrySelected.addEventListener('click', () => {
    document.querySelector('#countrySearcher').classList.toggle('active');
});
citySelected.addEventListener('click', () => {
    document.querySelector('#citySearcher').classList.toggle('active');
});

getWeatherBtn.addEventListener('click', GetWeather);

changeSystemBtn.addEventListener('click', ChangeSystem);

function ChangeSystem(e){
    const btn = e.target;

    if(btn.dataset.system == 'Celcius'){
        btn.textContent = '°F';
        btn.dataset.system = 'Fahrenheit';
        tempSystem = 'F';
        ui.PaintWeatherInfo(tempFahrenheit, weatherText, 'info');
    }else{
        btn.textContent = '°C';
        btn.dataset.system = 'Celcius';
        tempSystem = 'C';
        ui.PaintWeatherInfo(tempCelcius, weatherText, 'info');
    }
}

function GetWeather(e){
    e.preventDefault();
    if(!citySelected.dataset.city 
        || !countrySelected.dataset.country
        ){
        console.error(new Error('Faltan datos'));
        return;
    }


    let url = 'https://dataservice.accuweather.com/locations/v1/search';
        url += `?apikey=${weatherKey}&q=${countrySelected.dataset.country} ${citySelected.dataset.city}`;

    GetLocationCode(url)
    .then((key) => {
        console.log('desde then:', key)
        let url = 'http://dataservice.accuweather.com/currentconditions/v1/';
        GetForecast(key, url)
        .then((forecast) => {
            console.log(forecast);
            tempCelcius = forecast[0].Temperature.Metric.Value;
            tempFahrenheit = forecast[0].Temperature.Imperial.Value;
            weatherText = forecast[0].WeatherText;
            ui.PaintWeatherInfo((tempSystem == 'C') ? tempCelcius : tempFahrenheit, weatherText, 'info');
        });
    });


}

function GetLocationCode(p_url){
    return new Promise(function(resolve, reject){
        const xhr = new XMLHttpRequest();
        xhr.open('GET', p_url, true);
    
        xhr.onload = function(){
            if(this.status == 200) resolve(JSON.parse(this.responseText)[0].Key);
        };
        xhr.send();
    });
}

function GetForecast(p_key, p_url){
    return new Promise(function(resolve, reject){
        const url = `${p_url}${p_key}?apikey=${weatherKey}`;


        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        console.log(url);
        xhr.onload = function(){
            if(this.status == 200) resolve(JSON.parse(this.responseText));
        };
        xhr.send();
    });
}