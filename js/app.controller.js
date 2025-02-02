import { placeService } from './services/place.service.js'
import { userService } from './services/user.service.js'


// setInterval(() => console.log('Hi'), 800)
const GOOGLE_MAPS_API ='AIzaSyC2qR31ToybK5fqeCdn_ugxo-1a65GlMUY'
let gMap
let gMarkers = []

window.app = {
	onInit,
	renderPlaces,
	onPanToPlace,
	onRemovePlace,
	renderMarkers,
	onGetPlacesCSV,
	onNavigateTo,
	onSaveUser,
	updateAgeDisplay
	
}


function onInit() {
	renderUserPref()
	initMap()
	renderPlaces()
	onNavigateTo("MainPageSection")
	console.log('initMap()');
	
}

function onNavigateTo(sectionClass){
	document.querySelectorAll(".Main > section").forEach(section => {
		section.style.display = "none";
	});
	//console.log("onNavigateTo sectionClass:",sectionClass)

	const elSections = document.querySelectorAll(`.${sectionClass}`)
	if (elSections) {
		elSections.forEach(section => {
			section.style.display = "block";
		});
	}
}
async function renderPlaces(){
	const places = await placeService.getPlaces()
	//console.log('renderPlaces places loaded', places);
	document.querySelector('.places-container').innerHTML = ""
	
	var strHtmls = places.map(place => `<li class="place"><span >${place.name}</span><button class ="deleteButton" onclick="app.onRemovePlace('${place.id}')">x</button>
	<button class ="goButton" onclick="app.onPanToPlace('${place.id}')">go</button></li>`
    )

    document.querySelector('.places-container').innerHTML = strHtmls.join('')
	renderMarkers()
}

async function renderMarkers() {
	const places = await placeService.getPlaces()
	// remove previous markers
	gMarkers.forEach(marker => marker.setMap(null))
	// every place is creating a marker
	gMarkers = places.map(place => {
		return new google.maps.Marker({
			position: { lat:place.lat, lng:place.lng },
			map: gMap,
			title: place.name
		})
	})
}

async function onRemovePlace(placeId){
	try {
		await placeService.removePlace(placeId)
		//console.log("onRemovePlace clicked id ", placeId)
		setTimeout(renderPlaces, 100);
		//renderPlaces()
	} catch (error) {
		console.log(`on placeService.removePlace('${placeId}')`,error)
		alert('Cannot remove place!')
	}
	
}

async function onPanToPlace(placeId) {
	const place = await placeService.getPlaceById(placeId)
	gMap.setCenter({ lat: place.lat, lng: place.lng})
	gMap.setZoom(place.zoom)
}

async function initMap(){

	const position = { lat: 31.79, lng: 34.63 };
	const { Map } = await google.maps.importLibrary("maps");
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

	// The map
	gMap = new Map(document.getElementById("GoogleMap"), {
		zoom: 12,
		center: position,
		mapId: "DEMO_MAP_ID",
  	});
	//document.getElementById("GoogleMap").style.display = "block";
	//console.log("initMap gMap element", document.getElementById("GoogleMap"))
	gMap.addListener('click',async ev => {
		const lat = ev.latLng.lat();
		const lng = ev.latLng.lng();
		const placeName = await getPlaceName(ev, lat , lng)
		// console.log("placeName", placeName)
		const name = prompt('Place name?', placeName || 'Unnamed Place');
		if (!name) return; // User canceled

		await placeService.addPlace(name, lat, lng, gMap.getZoom());
		renderPlaces();
	})

	renderLocationBtn()
}

async function getPlaceName(ev, lat, lng) {

	var placeName = 'Place (' + lat.toPrecision(6) + ' , ' + lng.toPrecision(6) + ' )'

	const geocoder = new google.maps.Geocoder();

	try {
        const results = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: ev.latLng }, (results, status) => {
                if (status === "OK" && results[0]) {
                    resolve(results);
                } else {
                    reject(new Error("Geocoder failed due to: " + status));
                }
            });
        });

        placeName = results[0].formatted_address; // Get place name/address
        //console.log("placeName", placeName);
    } catch (error) {
        console.error(error);
    }
	// console.log("placeName", placeName)
	return placeName
}

function renderLocationBtn() { 
    const elLocBtn = document.createElement('button')
    elLocBtn.classList.add('my-location')
    elLocBtn.innerHTML = `<img src="img/my-location.png" />`
    gMap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(elLocBtn)
    elLocBtn.addEventListener('click', onPanToUserLoc)
}

function onPanToUserLoc(){
	navigator.geolocation.getCurrentPosition(setCenterToUserLoc)
}

function setCenterToUserLoc(position){
	const pos = {
		lat: position.coords.latitude,
		lng: position.coords.longitude,
	  };
	gMap.setCenter({ lat: pos.lat, lng: pos.lng})
}

function onGetPlacesCSV(){
	DownloadCSV()
}
async function DownloadCSV() {
    try {
        const csvContent = await placeService.getPlacesAsCSV();
		console.log('DownloadCSV csvContent', csvContent)
        const elLink = document.getElementById('csvLink')

        elLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        elLink.click()
    } catch (err) {
        console.log('Had issues downloading CSV', err);
    }
}

function updateAgeDisplay(value) {
    document.getElementById('ageDisplay').textContent = value;
}

function onSaveUser(event){
	event.preventDefault()
	const email = document.getElementById('email').value;
	const txtColor = document.getElementById('txtColor').value;
	const bgColor = document.getElementById('bgColor').value;
	const age = document.getElementById('age').value;
	const birthDate = document.getElementById('birthDate').value;
	const birthTime = document.getElementById('birthTime').value;

	const userData = {
		email,
		txtColor,
		bgColor,
		age,
		birthDate,
		birthTime
	};
	//console.log('onSaveUser user', userData)
	userService.saveUser(userData)
    renderUserPref()
	onNavigateTo("MapSection")
}

function renderUserPref() {
    const user = userService.getUser()
	//console.log('renderUserPref user', user)
    if (!user) return
    const { bgColor, txtColor} = user
    const elBody = document.getElementById('Head')
	//console.log('renderUserPref elBody', elBody)
    elBody.style.backgroundColor = bgColor
    elBody.style.color = txtColor
    populateUserPrefForm(user)
}

function populateUserPrefForm(user) {
     
	document.getElementById('email').value = user.email || '';
    document.getElementById('txtColor').value = user.txtColor || '#000000';
    document.getElementById('bgColor').value = user.bgColor || '#ffffff';
    document.getElementById('age').value = user.age || '18';
    document.getElementById('ageDisplay').innerText = user.age || '18';
    document.getElementById('birthDate').value = user.birthDate || '';
    document.getElementById('birthTime').value = user.birthTime || '';
}
