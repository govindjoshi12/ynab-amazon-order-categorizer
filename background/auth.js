import { ACTIONS } from "../messages.js"

let browserAPI = browser || chrome

console.log("Auth: I'm running in the background.")

const YNAB_BASE_URL = 'https://api.ynab.com/v1'
const CLIENT_ID = "Ac8Lio8N1Bjp01bAzQos4F71VfPEE9_iXrAiz68kesQ"
const redirectUri = browserAPI.identity.getRedirectURL()

const ACCESS_TOKEN_KEY = 'access_token'
const TOKEN_TYPE_KEY = 'token_type'
const EXPIRES_AT_KEY = 'expires_at'
const PLANS_KEY = 'plans'
const MISSING_VALUE = 'MISSING'
const REAUTH_MINS_BEFORE_EXPIRATION = 5

async function localGet(key) {
	let result = await browserAPI.storage.local.get({[key]: MISSING_VALUE})
	return result[key] == MISSING_VALUE ? undefined : result[key]
}

async function localStore(key, value) {
	return browserAPI.storage.local.set({
		[key]: value
	})
}

async function getTokenInfo() {
	let access_token = await localGet(ACCESS_TOKEN_KEY)
	let token_type = await localGet(TOKEN_TYPE_KEY)
	let expires_at = await localGet(EXPIRES_AT_KEY)
	return {
		'access_token': access_token,
		'token_type': token_type,
		'expires_at': expires_at
	}
}

async function isTokenValid() {
	let token_dict = await getTokenInfo()
	return token_dict[ACCESS_TOKEN_KEY] && Date.now() < token_dict[EXPIRES_AT_KEY]
}

async function authorizeYnab() {

	const authUrl =
		`https://app.ynab.com/oauth/authorize?client_id=${CLIENT_ID}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&response_type=token`

	const responseUrl = await browserAPI.identity.launchWebAuthFlow({
		url: authUrl,
		interactive: true
	})

	let paramsString = responseUrl.substring(responseUrl.indexOf('#') + 1)
	let searchParams = new URLSearchParams(paramsString)
	
	let token_dict = {
		[ACCESS_TOKEN_KEY]: searchParams.get('access_token'),
		[TOKEN_TYPE_KEY]: searchParams.get('token_type'),
		[EXPIRES_AT_KEY]: Date.now() + (Number(searchParams.get('expires_in')) * 1000)
	}

	browserAPI.storage.local.set(token_dict).then(
		() => console.log('Stored token info in local storage.'),
		(error) => console.log(error)
	)

	browserAPI.runtime.sendMessage({ action: ACTIONS['AUTH_FLOW_COMPLETE'] })
}

async function authorizedFetch(endpoint) {
	const token_info = await getTokenInfo()
	if(!token_info['access_token'] || Date.now() > token_info[EXPIRES_AT_KEY]) {
		throw new Error('Unauthorized. Authorize application to call YNAB API.')
	} else {
		const response = fetch(endpoint, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `${token_info[TOKEN_TYPE_KEY]} ${token_info[ACCESS_TOKEN_KEY]}` 
			},
		})
		return response
	}
}

async function getPlans() {
	let plans = localGet(PLANS_KEY)
	if(!plans) {
        const plansEndpoint =  `${YNAB_BASE_URL}/plans`
		const response = await authorizedFetch(plansEndpoint)
		plans = response.data.plans
	}
	return plans
}

// Message listener
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  	if (message.action === ACTIONS['GET_TOKEN_INFO']) {
		getTokenInfo().then(data => sendResponse(data));
		return true;
	} else if(message.action === ACTIONS['USE_AUTHORIZED_FETCH']) {
		authorizedFetch(message.endpoint).then(
			(response) => ({
				success: true,
				response: sendResponse(response.json())
			}),
			(error) => ({
				success: false,
				response: error
			})
		)
		// Need to keep the message channel open
		return true;
	} else if(message.action === ACTIONS['AUTHORIZE_YNAB']) {
		authorizeYnab();
  	} else if(message.action === ACTIONS['IS_TOKEN_VALID']) {
		isTokenValid().then(data => sendResponse(data))
		return true;
	} else if(message.action === ACTIONS['GET_PLANS']) {
		return true;
	}
  	return false;
});
