import { browserAPI, YNAB_BASE_URL, isTokenValid, renderCentsAsDollars } from "./util.js";
import { state } from "./state.js";
import { ACTIONS } from "../messages.js";

// https://api.ynab.com/v1#tag/transactions/GET/plans/{plan_id}/transactions
async function getTransactions() {
    let plan_id = state.selected_plan_id
    let since_date = new Date(state.order_details.order_date)
    since_date.setDate(since_date.getDate() - 10)
    let since_date_str = since_date.toISOString().substring(0, 10)
    
    const endpoint = `${YNAB_BASE_URL}/plans/${plan_id}/transactions`
        + `?since_date=${since_date_str}`
    
    let response = await browserAPI.runtime.sendMessage({
        action: ACTIONS['USE_AUTHORIZED_FETCH'],
        endpoint: endpoint
    })
    return response.data.transactions
}

export async function buildMatchingOrderBox() {
    
    const matchingOrderElem = document.getElementById('matching-order')
    
    console.log(state)
    if(isTokenValid() && state.order_details && state.selected_plan_id) {
        const transactions = await getTransactions()
        let end_date = new Date(state.order_details.order_date)
        end_date.setDate(end_date.getDate() + 10)
        let grand_total_milliunits = -1 * state.order_details.summary['grand_total'] * 10

        const filtered_transactions = transactions.filter((item) => (
            Date.parse(item.date) < end_date.getTime()
            && item.amount == grand_total_milliunits
        ))
        
        if(filtered_transactions.length == 0) {
            matchingOrderElem.textContent = "No match found in selected budget. Splitting transaction will create new transaction."
        } else {
            let item = filtered_transactions[0]
            matchingOrderElem.innerHTML = `
                Match found!<br/>
                Transaction ID: ${item.id},<br>
                Order amount: ${item.amount_formatted},<br/>
                Order date: ${item.date},<br/> 
                Category: ${item.category_name},<br/>
                Payee: ${item.payee_name}
            `
        }
    } 
}