import { browserAPI } from "./util.js";
import { state } from "./state.js";

export async function submitButton() {
    const button = document.createElement('button')
    button.textContent = "Submit"

    let valid = true
    for(const [key, value] of Object.entries(state.order_details.items)) {
        if(!state.order_details.items[key].category_id) {
            valid = false;
            break
        }
    }

    if(!valid) {
        button.setAttribute('disabled', true)
    }
    return button
}