import { storageService } from "./async-storage.service.js"
import { utilService } from "./util.service.js"

export const placeService = {
	getPlaces,
	removePlace,
	addPlace,
	getPlaceById,
	_createPlace,
	_createPlaces,
    getPlacesAsCSV,
    getLocation,
    saveLocation

}

const STORAGE_KEY_PLACES = 'places'
const STORAGE_KEY_LOCATION = 'location'

_createPlaces()

async function getPlaces(){
    return await storageService.query(STORAGE_KEY_PLACES)
}

function removePlace(placeId){
    storageService.remove(STORAGE_KEY_PLACES, placeId)
}

function addPlace(name, lat, lng, zoom){
    const placeToAdd = _createPlace(name, lat, lng, zoom)
    return storageService.post(STORAGE_KEY_PLACES, placeToAdd)
}

function getPlaceById(placeId){
    return storageService.get(STORAGE_KEY_PLACES, placeId)
}

function _createPlace(name, lat, lng, zoom){
    return {lat, lng, name, zoom}

}

async function _createPlaces(){
    let places = utilService.loadFromStorage(STORAGE_KEY_PLACES) || null
    if (!places || !places.length) {
        places = [
            {"id" : "sdg", "lat" : 31.79, "lng" : 34.63, "name" : "Ashdod", "zoom": 12},
            {"id" : "sdfs", "lat" : 31.81, "lng" : 34.773, "name" : "Gedera", "zoom": 12},
            {"id" : "fgh", "lat" : 31.86, "lng" : 34.73, "name" : "Yavne", "zoom": 12},
            {"id" : "jkl", "lat" : 31.89, "lng" : 34.81, "name" : "Rehovot", "zoom": 12}]
            
    }

    utilService.saveToStorage(STORAGE_KEY_PLACES, places)
    console.log("_createPlaces() saved await ", await getPlaces())
}

function getLocation(){
    const defaultLocation = { lat: 31.79, lng: 34.63 } 
    return utilService.loadFromStorage(STORAGE_KEY_LOCATION) || defaultLocation

}

function saveLocation(lat, lng){
    utilService.saveToStorage(STORAGE_KEY_LOCATION, { lat, lng })
}

async function getPlacesAsCSV() {
    try {
        const places = await getPlaces()
        if (!places.length) throw 'No Places'
        const csvLines = places.map(({ id, lat, lng, name }) =>{
            const safeName = `"${name.replace(/"/g, '""')}"`;
            return `${id},${lat},${lng},${safeName}\n`
        });
        csvLines.unshift('Id,Lat,Long,Name\n')
        return csvLines.join('')
    } catch (error) {
        console.log('error:', error)
        throw 'Problem converting to csv'
    }
}
