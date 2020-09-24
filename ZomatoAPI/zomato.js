const mymap = L.map('mapid').setView([40.17887331434698, -99.40429687500001], 4);
let marker;

const title = document.querySelector('#title');
const main = document.querySelector('#main');

const pageJumper = document.querySelector('#pageJumper');
const bottom = document.querySelector('.bottom');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidWxpc21hbiIsImEiOiJjazh2bnZnZTAwazhpM2dva2JrZHVyaWNvIn0.qcXs_ZhwRa8OlqkDkoqXGw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

let latlngValues = mymap.on('click', function(e) {
    if (marker) { 
        mymap.removeLayer(marker);
    }
    marker = new L.Marker(e.latlng).addTo(mymap);

    getPlace(e.latlng.lat, e.latlng.lng)
})



let sortArray = []; 
let placeName = "";

let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'user-key': '99285658a6f9fb3c4c2f0b66b7164951'
    }
}

async function getPlace(lat, lng){
    const response = await fetch(`https://developers.zomato.com/api/v2.1/cities?lat=${lat}&lon=${lng}`, options);
    const data = await response.json();

    const{id, name} = data.location_suggestions[0]
    placeName = name;
    getResturant(id)
}

async function getResturant(id){
    const response = await fetch(`https://developers.zomato.com/api/v2.1/search?entity_id=${id}&entity_type=city&q=*RESTAURANT_URL*&category=7%2C9`, options);
    const data = await response.json()
    sortArray = data.restaurants;
    display(name)
}

let idCounter = 0; 
let displayCounter = 0;

function display() {
    title.innerHTML = ""
    title.innerHTML = `
            <h2>Available restaurants in: ${placeName}</h2>
            <select id="selectBox" onChange="selectSort()">
                <option disabled selected>Sort by:</option>
                <option value="rating">Rating (High to low)</option>
                <option value="price">Price range (Low to High)</option>
                <option value="name">Name (A-Z)</option>
            </select>
        `
        
    main.innerHTML = ""
    for (let items of sortArray) {
        idCounter++

        const{name, cuisines, timings, price_range, user_rating, phone_numbers} = items.restaurant
    
        main.innerHTML += `
            <div class="container">
                <p>${name}</p>
                <img onclick="editDiv2(${idCounter})" id="imageid${idCounter}" class="imgAdd" src="btn.png">
            </div>
    
            <div id="divid${idCounter}" class="container2">
                <p>Cuisines: ${cuisines}</p>
                <p>Open from: ${timings}</p>
                <p>Price range: ${price_range}</p>
                <p>User rating: ${user_rating.aggregate_rating}</p>
                <p>Phone number: ${phone_numbers}</p>
                <button onclick="viewBookings('${name}')">Book</button>
            </div>
        `    
    }

    let leftSpace = document.querySelector('#mapid').offsetLeft;
    main.style.marginLeft = leftSpace + "px"
}

function editDiv2(id) {
    displayCounter++;
    const div2 = document.querySelector(`#divid${id}`)
    const imageid = document.querySelector(`#imageid${id}`)

    if(displayCounter % 2 !== 0){
        div2.style.display = "grid";
        div2.style.transitionDelay = "1s"
        imageid.animate([
            {
                transform: "rotate(0)",
            },{
                transform: "rotate(45deg)",
            }
        ],{
            duration: 500,
            iterations: 1,
            fill: "forwards",
        })
    } else{
        div2.style.display = "none";
        imageid.animate([
            {
                transform: "rotate(45deg)",
            },{
                transform: "rotate(0)",
            }
        ],{
            duration: 500,
            iterations: 1,
            fill: "forwards",
        })
    }

}

function selectSort(){
    const selectBox = document.querySelector("#selectBox");
    let selectedValue = selectBox.options[selectBox.selectedIndex].value;
    
    if(selectedValue === "rating"){
        sortByRating()
    } else if(selectedValue === "price"){
        sortByPrice();
    } else{
        sortByName();
    }   
}

function sortByRating(){
    sortArray.sort(function (a,b) {
        return b.restaurant.user_rating.aggregate_rating - a.restaurant.user_rating.aggregate_rating;
    });
    display()
}

function sortByPrice(){
    sortArray.sort(function(a, b){
        return a.restaurant.price_range - b.restaurant.price_range;
    })
    display()
}

function sortByName(){
    sortArray.sort(function(a, b) {
        var textA = a.restaurant.name.toUpperCase(); //case insensitive sort
        var textB = b.restaurant.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    display()
}


pageJumper.onclick = ()=>{
    bottom.style.display = "block"
    bottom.style.marginTop = "140px"
}

function viewBookings(item){
    window.location.href=`bookings.html?val=${item}`
}

