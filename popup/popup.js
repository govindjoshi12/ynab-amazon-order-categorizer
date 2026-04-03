async function requestData() {
  const [tab] = await browserAPI.tabs.query({
    active: true,
    currentWindow: true
  });

  const response = await browserAPI.tabs.sendMessage(
    tab.id,
    { action: "extractOrder" }
  );

  return response.orderDetails
}

function roundTo10sPower(num, pow) {
  let tens_power = Math.pow(10, pow)
  return Math.round(num * tens_power) / tens_power
}

function renderCentsAsDollars(cents) {
  let centsStr = String(cents).padStart(3, '0')
  let dollarComponent = centsStr.substring(0, centsStr.length - 2)
  let centComponent = centsStr.substring(centsStr.length - 2) 
  return `\$${dollarComponent}.${centComponent}`
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

  let items_subtotal = orderDetails.summary['Item(s) Subtotal:']
  let grand_total = orderDetails.summary['Grand Total:']
  let diff = roundTo10sPower(grand_total - items_subtotal, 2)
  items = adjustPricesByTotal(orderDetails.items, items_subtotal, grand_total)
  const table = document.createElement("table")

  let tableHeader = document.createElement('tr')
  tableHeader.innerHTML = `
    <th>Item</th>
    <th>Unit Price</th>
    <th>Adjusted Price</th>
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
    table.appendChild(row)
  }

  let additionalFees = document.createElement('tr')
  additionalFees.innerHTML = `
    <td>Taxes, Shipping, and Other Fees</td>
    <td>${renderCentsAsDollars(diff)}</td>
    <td>${renderCentsAsDollars(0)}</td>
  `

  let totals = document.createElement('tr')
  totals.innerHTML = `
    <td>Grand Total</td>
    <td>${renderCentsAsDollars(grand_total)}</td>
    <td>${renderCentsAsDollars(grand_total)}</td>
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

async function runExtension() {

  let activeTabUrl = await getActiveTabUrl();
  console.log(activeTabUrl)
  const matcher = new RegExp(/.*:\/\/www\.amazon\.com\/your-orders\/order-details\?orderID=.*/, "g");
  let match = matcher.test(activeTabUrl)

  let divElem = document.createElement('div')
  if(!match) {
      divElem.innerHTML = '<h1>Please navigate to an amazon orders page.</h1>'
  } else {
      let notif = document.createElement('span')
      notif.innerHTML = '<h1>Order Found!</h1>'
      divElem.appendChild(notif)
      divElem.appendChild(await createOrderHTML())
  }

  console.log(document.getElementById('data-display'))
  document.getElementById('data-display').appendChild(divElem)
}

runExtension();