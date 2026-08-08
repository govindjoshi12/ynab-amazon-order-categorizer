import { browserAPI } from "./util.js";
import { state, getSignal } from "./state.js";
import { ACTIONS } from "../messages.js";

const max_memo_len = 500

export async function submitButton() {
    const buttonContainer = document.createElement('div')
    const button = document.createElement('button')

    // TODO: Set text to Create if there's no matching order
    button.textContent = "Update"
    buttonContainer.appendChild(button)

    // TODO: Allow creating new transaction if no matching transaction found
    let valid = !!state.order_details.transaction_id && !state.order_details.pre_split;
    if(valid) {
        for(const [key, value] of Object.entries(state.order_details.items)) {
            if(!state.order_details.items[key].category_id) {
                valid = false;
                break
            }
        }
    }

    if(!valid) {
        button.disabled = true
    } else {
        // TODO: Log the current state of the app
        let currState = "hello darkness my old friend"
        // What do I need?
        // Assumption: We do not need ALL of the fields on
        // https://api.ynab.com/v1#tag/scheduled-transactions/GET/plans/{plan_id}/scheduled_transactions/{scheduled_transaction_id}
        // Only the ones to update.
        // Update:
        // plan_id, transaction_id
        // memo (Order ID + "Split by Extension")
        // subtransactions: [
        //  amount
        //  category_id
        //  memo (item name, max len 500)
        //  payee_id, payee_name (copy from parent)
        // ]
        // TODO: If transaction is already a split transaction,
        // Display message that we cannot split it. 

        let plan_id = state.selected_plan_id
        let transaction_id = state.order_details.transaction_id
        let account_id = state.order_details.account_id
        let memo = `Amazon Order #${state.order_details.order_id} - Split by Extension`
        let amount = -1 * state.order_details.summary['grand_total']
        console.log(amount)
        let subtransactions = []
        for(const [item_name, item_details] of Object.entries(state.order_details.items)) {
            subtransactions.push({
                'amount': -1 * item_details.adjusted_price,
                'category_id': item_details.category_id,
                'memo': truncate(item_name, max_memo_len),
                'payee_id': state.order_details.payee_id,
                'payee_name': state.order_details.payee_name
            })
        }

        // TODO: need to get account_id. Each plan has multiple accounts, 
        // and each transaction is associated with an account
        let transaction = {
            'transaction': {
                'account_id': account_id, 
                'amount': amount,
                'memo': memo,
                'subtransactions': subtransactions
            }
        }

        button.addEventListener(
            'click', 
            async () => {
                // TODO: Send message to backend with transactionInfo
                let response_status = await browserAPI.runtime.sendMessage({
                    action: ACTIONS['UPDATE_TRANSACTION'],
                    plan_id: plan_id,
                    transaction_id: transaction_id,
                    transaction: transaction
                })
                // TODO: Display success or failure message
                state.submit_status = response_status
                console.log(state.submit_status)
            },
            { signal: getSignal() }
        )
    }

    if(state.submit_status !== undefined) {
        const statusMsgElem = document.createElement('span')
        if(state.submit_status) {
            statusMsgElem.innerHTML = "Order updated successfully!"
        } else {
            statusMsgElem.innerHTML = "Update failed."
        }
        buttonContainer.appendChild(statusMsgElem)
    }

    return buttonContainer
}

function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}