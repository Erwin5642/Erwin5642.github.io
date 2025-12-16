function celsiusToFahrenheit() {
    const c = document.getElementById("celsius").value;
    document.getElementById("fahrenheit").value = (c * 9 / 5) + 32;
}

function kgToPound() {
    const kg = document.getElementById("kg").value;
    document.getElementById("lb").value = kg * 2.205;
}

function kmToMiles() {
    const km = document.getElementById("km").value;
    document.getElementById("miles").value = km / 1.609;
}