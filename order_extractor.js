document.body.style.border = '10px solid red'

console.log("Hello from the extension.")

function moneyStrToMilliunits(moneyStr) {
    return Math.round(Number(moneyStr.replace(/[^0-9.-]+/g,"")) * 1000);
}

internal_key_map = {
    "Item(s) Subtotal:": "items_subtotal",
    "Grand Total:": "grand_total",
    "Shipping & Handling:": "shipping",
    "Free Shipping:": "free_shipping",
    "Total before tax:": "pre_tax_total",
    "Estimated tax to be collected:": "tax",
    "FSA or HSA eligible:": "fsa_hsa_eligibile"
}

function extractOrder() {

    let labelClass = 'od-line-item-row-label'
    let costClass = 'od-line-item-row-content'

    let subtotals_elem = document.getElementById('od-subtotals');
    list_items = subtotals_elem.getElementsByTagName('li')
    summary_dict = {}
    for (var i = 0; i < list_items.length; i++) {
        let labelText = list_items[i]
                        .getElementsByClassName(labelClass)[0]
                        .querySelector("span span")
                        .textContent.trim()
        
        let costText = list_items[i]
                        .getElementsByClassName(costClass)[0]
                        .querySelector('span')
                        .textContent.trim()
        
        summary_dict[internal_key_map[labelText]] = moneyStrToMilliunits(costText)
    }

    let itemsList = document.querySelectorAll('[data-component="purchasedItemsRightGrid"]');
    let items_dict = {}
    for(var i = 0; i < itemsList.length; i++) {
        let itemElem = itemsList[i]
        let itemTitle = itemElem
                        .querySelectorAll('[data-component="itemTitle"]')[0]
                        .lastElementChild.textContent.trim()
        let itemPrice = itemElem    
                        .querySelectorAll('[data-component="unitPrice"]')[0]
                        .lastElementChild.firstChild.textContent.trim()
        
        items_dict[itemTitle] = {
            'unit_price': moneyStrToMilliunits(itemPrice)
        }
    }

    let orderDateText = document.querySelectorAll('[data-component="orderDate"]')[0]
                        .querySelector('span')
                        .textContent
    let orderDateTimestamp = new Date(orderDateText)

    let orderId = document.querySelectorAll('[data-component="orderId"]')[0]
                .querySelector('span')
                .textContent

    return {
        'order_date': orderDateTimestamp.toISOString(),
        'order_id': orderId,
        'summary': summary_dict,
        'items': items_dict
    }
}

let browserAPI = browser || chrome
browserAPI.runtime.onMessage.addListener((message) => {
  if (message.action === "EXTRACT_ORDER") {

    const orderDetails = extractOrder();

    return Promise.resolve({ orderDetails });
  }
});