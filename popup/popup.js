import { browserAPI } from "./util.js";
import { buildAuthBox } from "./authBox.js";
import { buildPlansDropdown } from "./plansDropdown.js";
import { buildOrderTable } from "./orderTable.js";
import { buildMatchingOrderBox } from "./matchingOrder.js";
import { ACTIONS } from "../messages.js";

// Build and refresh Components
async function onStartup() {
    await buildAuthBox();
    await buildPlansDropdown();
    await buildOrderTable();
    await buildMatchingOrderBox();
}

async function onAuth() {
    await buildAuthBox();
    await buildPlansDropdown();
    await buildMatchingOrderBox();
}

browserAPI.runtime.onMessage.addListener((message) => {
if (message.action === ACTIONS['AUTH_FLOW_COMPLETE']) {
    onAuth();
  }
});
onStartup();