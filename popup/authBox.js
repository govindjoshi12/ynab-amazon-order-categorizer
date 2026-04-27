import { browserAPI } from "./util.js"
import { ACTIONS } from "../messages.js"
import { abortController } from "./state.js"

export const AuthBox = async () => {
    const authBox = document.createElement('div')
    const button = document.createElement('button')
    const infodiv = document.createElement('div')

    button.addEventListener(
        'click', 
        async () => (
            await browserAPI.runtime.sendMessage(
                { action: ACTIONS['AUTHORIZE_YNAB'] }
            )
        ),
        { signal: abortController.signal }
    )

    const auth_status = await browserAPI.runtime.sendMessage(
        { action: ACTIONS['GET_AUTH_STATUS'] }
    )

    if(auth_status['is_authorized'] && auth_status['expires_at'] > Date.now()) {
        button.textContent = "Refresh Credentials"
        // Since the auth_box code re-runs everytime the popup is re-opened, we don't need to explicitly
        // create logic to refresh this text every few minutes. It is not likely that users spend more
        // than 2-3 minutes on the popup.
        let expiration_minutes = Math.round((auth_status['expires_at'] - Date.now()) / 1000 / 60)
        infodiv.textContent = `Session expires in ${expiration_minutes} minutes`
    } else {
        button.textContent = "Connect to YNAB"
    }

    authBox.appendChild(button)
    authBox.appendChild(infodiv)

    return authBox
}
