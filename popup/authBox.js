import { browserAPI } from "./util.js"
import { ACTIONS } from "../messages.js"

document.getElementById('auth-button').addEventListener('click', async () => (
    await browserAPI.runtime.sendMessage({ action: ACTIONS['AUTHORIZE_YNAB'] })
))

export async function buildAuthBox() {
    const auth_box = document.getElementById('auth-box')
    const button = document.getElementById('auth-button')
    const infodiv = document.getElementById('auth-info')

    const token_info = await browserAPI.runtime.sendMessage(
        { action: ACTIONS['GET_TOKEN_INFO'] }
    )

    if(token_info['access_token']) {
        button.textContent = "Refresh Credentials"
        // Since the auth_box code re-runs everytime the popup is re-opened, we don't need to explicitly
        // create logic to refresh this text every few minutes. It is not likely that users spend more
        // than 2-3 minutes on the popup.
        let expiration_minutes = Math.round((token_info['expires_at'] - Date.now()) / 1000 / 60)
        infodiv.textContent = `Session expires in ${expiration_minutes} minutes`
    } else {
        button.textContent = "Connect to YNAB"
    }
}
