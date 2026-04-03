document.body.style.border = '10px solid red'

console.log("Hello from the extension.")

function moneyStrToCents(moneyStr) {
    return Math.round(Number(moneyStr.replace(/[^0-9.-]+/g,"")) * 100);
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
        
        summary_dict[labelText] = moneyStrToCents(costText)
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
            'unit_price': moneyStrToCents(itemPrice)
        }
    }

    return {
        'summary': summary_dict,
        'items': items_dict
    }
}

let browserAPI = browser || chrome
browserAPI.runtime.onMessage.addListener((message) => {
  if (message.action === "extractOrder") {

    const orderDetails = extractOrder();

    return Promise.resolve({ orderDetails });
  }
});