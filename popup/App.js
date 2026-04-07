import { browserAPI } from "./util.js";
import { state } from "./state.js";
import { AuthBox } from "./AuthBox.js";
import { PlansDropdown } from "./PlansDropdown.js";
import { MatchingOrderBox } from "./MatchingOrder.js";
import { OrderTable } from "./OrderTable.js";

export const App = async () => {
    const root = document.createElement('root')

    const authBox = await AuthBox()
    const plansDropdown = await PlansDropdown()
    const matchingOrder = await MatchingOrderBox()
    const orderTable = await OrderTable()

    root.appendChild(authBox)
    root.appendChild(plansDropdown)
    root.appendChild(matchingOrder)
    root.appendChild(orderTable)

    return root
}