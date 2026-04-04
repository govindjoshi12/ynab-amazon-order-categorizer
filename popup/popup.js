import { browserAPI } from "./util.js";
import { buildAuthBox } from "./authBox.js";
import { buildPlansDropdown } from "./plansDropdown.js";
import { buildOrderTable } from "./orderTable.js";
import { ACTIONS } from "../messages.js";

// Build and refresh Components
function onStartup() {
    buildAuthBox();
    buildPlansDropdown();
    buildOrderTable();
}

function onAuth() {
    buildAuthBox();
    buildPlansDropdown();
}

browserAPI.runtime.onMessage.addListener((message) => {
if (message.action === ACTIONS['AUTH_FLOW_COMPLETE']) {
    onAuth();
  }
});
onStartup();