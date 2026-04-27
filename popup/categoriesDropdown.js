import { browserAPI, isTokenValid } from "./util.js";
import { abortController, state } from "./state.js"
import { ACTIONS } from "../messages.js";

export async function CategoriesDropdown(currentCategoryId, categoryClickHandler) {

    const dropdown = document.createElement('select')

    if(await isTokenValid()) {
        const category_groups = await browserAPI.runtime.sendMessage({
            action: ACTIONS['GET_CATEGORIES'],
            plan_id: state.selected_plan_id
        })
        
        for(let i = 0; i < category_groups.length; i++) {
            let group = category_groups[i]
            let optgroup = document.createElement('optgroup')
            optgroup.label = group.name
            for(let j = 0; j < group['categories'].length; j++) {
                let cat = group['categories'][j]
                let opt = document.createElement('option')
                opt.text = cat.name
                opt.value = cat.id

                if(opt.value === currentCategoryId) {
                    opt.selected = true
                }

                optgroup.appendChild(opt)
            }
            dropdown.appendChild(optgroup)
        }

        dropdown.addEventListener('change', categoryClickHandler, 
            { signal: abortController.signal }
        )
    } else {
        dropdown.textContent = "-"
    }

    return dropdown
}