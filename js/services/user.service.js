import { utilService } from './util.service.js'


export const userService = {
    saveUser,
    getUser,
    saveSelectedPlace,
    getSelectedPlace
}


const STORAGE_KEY = 'userData'
const STORAGE_KEY_LOC = 'loc'


function saveUser(user) {
    utilService.saveToStorage(STORAGE_KEY, user)
}


function getUser() {
    return utilService.loadFromStorage(STORAGE_KEY)
}


function saveSelectedPlace(loc) {
    utilService.saveToStorage(STORAGE_KEY_LOC, loc)
}


function getSelectedPlace() {
    return utilService.loadFromStorage(STORAGE_KEY_LOC)
}


