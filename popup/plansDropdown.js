import { browserAPI, getAndClearElementById, isTokenValid } from "./util.js"
import { ACTIONS } from "../messages.js"
import { state } from "./state.js"


export const PlansDropdown = async () => {
    const plansDropdown = document.createElement('select')

    plansDropdown.addEventListener(
        'change',
        (event) => {
            state.selected_plan_id = event.target.value
        }
    )


    const placeholderOption = document.createElement('option')

    plansDropdown.appendChild(placeholderOption)
    if(await isTokenValid()) {
        const plans = await browserAPI.runtime.sendMessage({ 
            action: ACTIONS['GET_PLANS'],
        })

        placeholderOption.text = "Default"
        placeholderOption.id = "default"
        
        if(!state.selected_plan_id) {
            state.selected_plan_id = "default"
            placeholderOption.setAttribute("selected", "true")
        }

        for(let i = 0; i < plans.length; i++) {
            let option = document.createElement('option')
            option.text = plans[i].name
            option.value = plans[i].id

            if(option.value === state.selected_plan_id) {
                option.setAttribute('selected', 'true')
            }

            plansDropdown.appendChild(option)
        }
    } else {
        placeholderOption.textContent = "Connect to YNAB."
        placeholderOption.setAttribute('disabled', 'true')
        placeholderOption.setAttribute('selected', 'true')
        placeholderOption.setAttribute('hidden', 'true')
    }

    return plansDropdown
}