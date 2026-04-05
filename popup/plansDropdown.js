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

    plans_select.appendChild(placeholderOption)
    if(isTokenValid()) {
        const plans = await browserAPI.runtime.sendMessage({ 
            action: ACTIONS['GET_PLANS'],
        })
        console.log(plans)

        placeholderOption.textContent = "Default"
        placeholderOption.setAttribute("value", "default")
        placeholderOption.setAttribute("selected", "true")
        state.selected_plan_id = "default"

        for(let i = 0; i < plans.length; i++) {
            let option = document.createElement('option')
            option.text = plans[i].name
            option.value = plans[i].id
            plans_select.appendChild(option)
        }
    } else {
        placeholderOption.textContent = "Connect to YNAB."
        placeholderOption.setAttribute('disabled', 'true')
        placeholderOption.setAttribute('selected', 'true')
        placeholderOption.setAttribute('hidden', 'true')
    }
}