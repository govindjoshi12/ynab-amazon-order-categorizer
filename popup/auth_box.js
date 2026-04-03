const browserAPI = browser || chrome

const YNAB_BASE_URL = 'https://api.ynab.com/v1'
const GET_TOKEN_INFO_MESSAGE = "GET_TOKEN_INFO"
const AUTHORIZE_YNAB_MESSAGE = "AUTHORIZE_YNAB"
const USE_AUTHORIZED_FETCH_MESSAGE = "USE_AUTHORIZED_FETCH"

document.getElementById('auth-button').addEventListener('click', async () => (
    await browserAPI.runtime.sendMessage({ action: "AUTHORIZE_YNAB" })
))

async function buildAuthBox() {
    const auth_box = document.getElementById('auth-box')
    const button = document.getElementById('auth-button')
    const infodiv = document.getElementById('auth-info')

    const token_info = await browserAPI.runtime.sendMessage(
        { action: 'GET_TOKEN_INFO'}
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

async function buildPlansDropdown() {
    const plans_select = document.getElementById('plans-dropdown')

    const token_info = await browserAPI.runtime.sendMessage(
        { action: 'GET_TOKEN_INFO'}
    )
    if(token_info['access_token']) {
        const plansEndpoint =  `${YNAB_BASE_URL}/plans`
        let response = await browserAPI.runtime.sendMessage(
            {
                action: USE_AUTHORIZED_FETCH_MESSAGE,
                endpoint: plansEndpoint
            }
        )
        console.log(response)
        let plans = response.data.plans

        // TODO: Use plan id to make future api calls
        for(let i = 0; i < plans.length; i++) {
            let name = plans[i].name
            let option = document.createElement('option')
            option.text = name
            plans_select.appendChild(option)
        }
    } 
}

function onAuth() {
    buildAuthBox();
    buildPlansDropdown();
}

browserAPI.runtime.onMessage.addListener((message) => {
if (message.action === "AUTH_FLOW_COMPLETE") {
    onAuth();
  }
});
onAuth();