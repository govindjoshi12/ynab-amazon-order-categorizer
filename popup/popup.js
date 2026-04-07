import { browserAPI } from "./util.js";
import { ACTIONS } from "../messages.js";
import { App } from "./app.js";

// Build and refresh Components
async function onStartup() {
    const app = await App()
    document.getElementById('root').appendChild(app)
}

async function onAuth() {
    const app = await App()
    document.getElementById('root').appendChild(app)
}

browserAPI.runtime.onMessage.addListener((message) => {
if (message.action === ACTIONS['AUTH_FLOW_COMPLETE']) {
    onAuth();
  }
});
onStartup();