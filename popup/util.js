import { ACTIONS } from "../messages.js";

export const browserAPI = browser || chrome

export const YNAB_BASE_URL = 'https://api.ynab.com/v1'

export function getAndClearElementById(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
    return el;
}

export async function isTokenValid() {
    const auth_status = await browserAPI.runtime.sendMessage(
        { action: ACTIONS['GET_AUTH_STATUS'] }
    )
    return auth_status['is_authorized']
}

export function renderCentsAsMilliunits(milliunits) {
    // Milliunits should almost always end in 0 in the ones place, 
    // but we add the rounding for safety
    let cents = Math.round(milliunits / 10)
    console.log(milliunits, cents)
    let centsStr = String(cents).padStart(3, '0')
    let dollarComponent = centsStr.substring(0, centsStr.length - 2)
    let centComponent = centsStr.substring(centsStr.length - 2) 
    return `\$${dollarComponent}.${centComponent}`
}
