export const storageService = {
    post, // Create
    get, // Read
    put, // Update
    remove, // Delete
    query, // List 
}


function query(entityType, delay = 100) {
    let entities = JSON.parse(localStorage.getItem(entityType)) || []
    return new Promise((resolve) => {
        setTimeout(() => resolve(entities), delay)
    })
}


async function get(entityType, entityId) {
    const entities = await query(entityType)
    const entity = entities.find(_entity => _entity.id === entityId)
    if (!entity) throw new Error(`Get failed, cannot find entity with id: ${entityId} in: ${entityType}`)
    return entity
}


async function put(entityType, updatedEntity) {
    updatedEntity = structuredClone(updatedEntity)
    const entities = await query(entityType)
    const idx = entities.findIndex(entity => entity.id === updatedEntity.id)
    if (idx < 0) throw new Error(`Update failed, cannot find entity with id: ${entityId} in: ${entityType}`)
    entities.splice(idx, 1, updatedEntity)
    _save(entityType, entities)
    return updatedEntity
}


async function post(entityType, newEntity) {
    newEntity = structuredClone(newEntity)
    newEntity.id = _makeId()
    const entities = await query(entityType)
    entities.push(newEntity)
    _save(entityType, entities)
    return newEntity
}

async function remove(entityType, entityId) {
    const entities = await query(entityType)
    const idx = entities.findIndex(entity => entity.id === entityId)
    if (idx < 0) throw new Error(`Remove failed, cannot find entity with id: ${entityId} in: ${entityType}`)
    entities.splice(idx, 1)
    _save(entityType, entities)
    return entities
}


// Private functions
function _save(entityType, entities) {
    localStorage.setItem(entityType, JSON.stringify(entities))
}


function _makeId(length = 5) {
    // let uuid = self.crypto.randomUUID();
    // console.log("uuid ",uuid)
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}
