import { browserAPI, renderCentsAsDollars } from "./util.js";
import { state } from "./state.js";
import { getCategoriesDropdown } from "./categoriesDropdown.js";


async function requestData() {
  const [tab] = await browserAPI.tabs.query({
    active: true,
    currentWindow: true
  });

  const response = await browserAPI.tabs.sendMessage(
    tab.id,
    { action: "EXTRACT_ORDER" }
  );

  return response.orderDetails
}

function roundTo10sPower(num, pow) {
  let tens_power = Math.pow(10, pow)
  return Math.round(num * tens_power) / tens_power
}

function adjustPricesByTotal(items_dict, item_subtotal, grand_total) {
  if(!item_subtotal) {
    item_subtotal = 0
    for (const [key, value] of Object.entries(items_dict)) {
      item_subtotal += items_dict[key]['unit_price']
    }
  }

  // Items Dict is in cents
  const keys = Object.keys(items_dict);
  let len = keys.length
  let running_total = 0;
  let diff = grand_total - item_subtotal;
  for(let i = 0; i < len; i++) {
    if(i < len - 1) {
      let item_price = items_dict[keys[i]]['unit_price']
      console.log(item_price)
      let adjusted_price = Math.round((item_price / item_subtotal) * diff) + item_price
      console.log(adjusted_price)
      items_dict[keys[i]]['adjusted_price'] = adjusted_price
      running_total += adjusted_price
    } else {
      // account for penny drift
      let adjusted_price = grand_total - running_total
      console.log(adjusted_price)
      console.log(grand_total, running_total + adjusted_price)
      items_dict[keys[i]]['adjusted_price'] = adjusted_price
    }
  }

  return items_dict
}

async function createOrderHTML() {
  let orderDetails = await requestData();
  state.order_details = orderDetails

  let items_subtotal = orderDetails.summary['items_subtotal']
  let grand_total = orderDetails.summary['grand_total']
  let diff = roundTo10sPower(grand_total - items_subtotal, 2)
  console.log(diff)
  let items = adjustPricesByTotal(orderDetails.items, items_subtotal, grand_total)
  const table = document.createElement("table")

  let tableHeader = document.createElement('tr')
  tableHeader.innerHTML = `
    <th>Item</th>
    <th>Unit Price</th>
    <th>Adjusted Price</th>
    <th>Category</th>
  `
  table.appendChild(tableHeader)

  for (const [key, value] of Object.entries(items)) {
    let item = {
      'title': key,
      'unit_price': renderCentsAsDollars(value.unit_price),
      'adjusted_price': renderCentsAsDollars(value.adjusted_price)
    }
    let row = document.createElement('tr')
    row.innerHTML = `
      <td>${item.title}</td>
      <td>${item.unit_price}</td>
      <td>${item.adjusted_price}</td>
    `
    row.appendChild(await getCategoriesDropdown())
    table.appendChild(row)
  }

  let additionalFees = document.createElement('tr')
  additionalFees.innerHTML = `
    <td>Taxes, Shipping, and Other Fees</td>
    <td>${renderCentsAsDollars(diff)}</td>
    <td>${renderCentsAsDollars(0)}</td>
    <td></td>
  `

  let totals = document.createElement('tr')
  totals.innerHTML = `
    <td>Grand Total</td>
    <td>${renderCentsAsDollars(grand_total)}</td>
    <td>${renderCentsAsDollars(grand_total)}</td>
    <td></td>
  `

  table.appendChild(additionalFees)
  table.appendChild(totals)
  
  return table
}

async function getActiveTabUrl() {
  const tabs = await browserAPI.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0].url;
}

export async function buildOrderTable() {

  let activeTabUrl = await getActiveTabUrl();
  const matcher = new RegExp(/.*:\/\/www\.amazon\.com\/your-orders\/order-details\?orderID=.*/, "g");
  let match = matcher.test(activeTabUrl)

  let divElem = document.createElement('div')
  if(!match) {
      divElem.innerHTML = '<h1>Please navigate to an amazon orders page.</h1>'
  } else {
      let notif = document.createElement('span')
      notif.innerHTML = '<h3>Order Found!</h3>'
      divElem.appendChild(notif)
      let table = await createOrderHTML()
      let orderNumberElem = document.createElement('span')
      orderNumberElem.textContent = `Order #${state.order_details.order_id}`
      divElem.appendChild(orderNumberElem)
      divElem.appendChild(table)
  }

  document.getElementById('data-display').appendChild(divElem)
}
