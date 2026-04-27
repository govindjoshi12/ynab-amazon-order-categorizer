import { browserAPI } from "./util.js";
import { ACTIONS } from "../messages.js";
import { App } from "./app.js";
import { abortController } from "./state.js";

// Build and refresh Components
export async function onStartup() {
    // abortController.abort()
    const app = await App()
    document.getElementById('root').innerHTML = ""
    document.getElementById('root').appendChild(app)
}

// rebuild app on auth or state change
browserAPI.runtime.onMessage.addListener((message) => {
if (message.action === ACTIONS['AUTH_FLOW_COMPLETE']) {
    onStartup();
  }
});

onStartup();