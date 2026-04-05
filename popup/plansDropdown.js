import { browserAPI, getAndClearElementById, isTokenValid } from "./util.js"
import { ACTIONS } from "../messages.js"
import { state } from "./state.js"
import { buildMatchingOrderBox } from "./matchingOrder.js"

document.getElementById('plans-dropdown').addEventListener(
    'change',
    (event) => {
        state.selected_plan_id = event.target.value
        buildMatchingOrderBox();
    }
)

export async function buildPlansDropdown() {
    const plans_select = getAndClearElementById('plans-dropdown')

    const placeholderOption = document.createElement('option')
    placeholderOption.textContent = "Connect to YNAB."
    placeholderOption.setAttribute('disabled', 'true')
    placeholderOption.setAttribute('selected', 'true')
    placeholderOption.setAttribute('hidden', 'true')
    plans_select.appendChild(placeholderOption)
    if(isTokenValid()) {
        const plans = await browserAPI.runtime.sendMessage(
            { action: ACTIONS['GET_PLANS'] }
        )
        console.log(plans)

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