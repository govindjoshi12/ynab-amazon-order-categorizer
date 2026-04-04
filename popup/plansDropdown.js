import { browserAPI, getAndClearElementById } from "./util.js"
import { ACTIONS } from "../messages.js"

const YNAB_BASE_URL = 'https://api.ynab.com/v1'

export async function buildPlansDropdown() {
    const plans_select = getAndClearElementById('plans-dropdown')

    const isTokenValid = await browserAPI.runtime.sendMessage(
        { action: ACTIONS['IS_TOKEN_VALID'] }
    )
    console.log(isTokenValid)

    const placeholderOption = document.createElement('option')
    placeholderOption.textContent = "Connect to YNAB."
    placeholderOption.setAttribute('disabled', 'true')
    placeholderOption.setAttribute('selected', 'true')
    placeholderOption.setAttribute('hidden', 'true')
    plans_select.appendChild(placeholderOption)
    if(isTokenValid) {
        const plansEndpoint =  `${YNAB_BASE_URL}/plans`
        let response = await browserAPI.runtime.sendMessage(
            {
                action: ACTIONS['USE_AUTHORIZED_FETCH'],
                endpoint: plansEndpoint
            }
        )
        console.log(response)
        let plans = response.data.plans

        // TODO: Use plan id to make future api calls
        placeholderOption.textContent = "Select Plan"
        for(let i = 0; i < plans.length; i++) {
            let name = plans[i].name
            let option = document.createElement('option')
            option.text = plans[i].name
            option.value = plans[i].id
            plans_select.appendChild(option)
        }
    }
}