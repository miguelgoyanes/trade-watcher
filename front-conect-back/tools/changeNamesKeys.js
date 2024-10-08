
export function changeNamesKeys(
    array,
    mapeoClaves = {
        open_price: 'open',
        close_price: 'close',
        high_price: 'high',
        low_price: 'low',
        start_timestamp: 'time'
    }) {
    return array.map(obj => {
        const nuevoObj = {};
        for (let clave in obj) {
            if (obj.hasOwnProperty(clave)) {
                // Si la clave está en el mapeo, la cambiamos por el nuevo nombre
                const nuevaClave = mapeoClaves[clave] || clave;
                nuevoObj[nuevaClave] = obj[clave];
            }
        }
        return nuevoObj;
    });
}

export function changeNameKeys(
    obj,
    mapeoClaves = {
        open_price: 'open',
        close_price: 'close',
        high_price: 'high',
        low_price: 'low',
        start_timestamp: 'time'
    }) {
    const nuevoObj = {};
    for (let clave in obj) {
        if (obj.hasOwnProperty(clave)) {
            // Si la clave está en el mapeo, la cambiamos por el nuevo nombre
            const nuevaClave = mapeoClaves[clave] || clave;
            nuevoObj[nuevaClave] = obj[clave];
        }
    }
    return nuevoObj;
}
