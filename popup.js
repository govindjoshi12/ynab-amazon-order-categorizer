const browserAPI = window.browser || window.chrome;

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

async function displayData() {
  let orderDetails = await requestData();

  const list = document.createElement("ul")
  for (const [key, value] of Object.entries(orderDetails.items)) {
    let item = {
      'title': key,
      'price': value.unit_price
    }
    let listElem = document.createElement('li')
    listElem.innerHTML = `
      <span>${item.title}</span>
      <span>\$${item.price}</span>
    `
    list.appendChild(listElem)
  }
  
  document.getElementById('data-display').appendChild(list)
}

displayData();