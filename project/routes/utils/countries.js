const COUNTRIES_URL = 'https://restcountries.eu/rest/v2/all';
const axios = require('axios');
const { response } = require('express');


async function getCountries() {
    let countries_withFlags_list = [];
    let response = await axios.get(COUNTRIES_URL);
    for (let i = 0; i < response.data.length; i++) {
        let country_obj = new Object();
        country_obj.name = response.data[i].name;
        country_obj.flag = response.data[i].flag;
        countries_withFlags_list.push(country_obj);
    }

    // console.log(countries_withFlags_list);
    return countries_withFlags_list;
}
getCountries();
