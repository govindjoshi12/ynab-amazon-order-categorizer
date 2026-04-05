import { ACTIONS } from "../messages.js";

export const browserAPI = browser || chrome

export const YNAB_BASE_URL = 'https://api.ynab.com/v1'

export function getAndClearElementById(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
    return el;
}

export async function isTokenValid() {
    const valid = await browserAPI.runtime.sendMessage(
        { action: ACTIONS['IS_TOKEN_VALID'] }
    )
    return valid
}

export function renderCentsAsDollars(cents) {
    let centsStr = String(cents).padStart(3, '0')
    let dollarComponent = centsStr.substring(0, centsStr.length - 2)
    let centComponent = centsStr.substring(centsStr.length - 2) 
    return `\$${dollarComponent}.${centComponent}`
}
