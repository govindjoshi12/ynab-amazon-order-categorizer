document.body.style.border = '10px solid red'

console.log("Hello from the extension.")

url = window.location.href
const matcher = new RegExp(/.*:\/\/www\.amazon\.com\/your-orders\/order-details\?orderID=.*/, "g");
console.log('url:', url)
match = matcher.test(url)

if(!match) {
    console.log("Please navigate to a valid order details page on amazon.")
} else {
    console.log("Order found!")
}

function extractMoneyNumber(moneyStr) {
    return Number(moneyStr.replace(/[^0-9.-]+/g,""));
}

let labelClass = 'od-line-item-row-label'
let costClass = 'od-line-item-row-content'

let subtotals_elem = document.getElementById('od-subtotals');

list_items = subtotals_elem.getElementsByTagName('li')
console.log(list_items)

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
    
   summary_dict[labelText] = extractMoneyNumber(costText)
}

let itemsList = document.querySelectorAll('[data-component="purchasedItemsRightGrid"]');
let items_dict = {}
for(var i = 0; i < itemsList.length; i++) {
    let itemElem = itemsList[i]
    let itemTitle = itemElem
                    .querySelectorAll('[data-component="itemTitle"]')[0]
                    .lastElementChild
                    .textContent
                    .trim()
    let itemPrice = itemElem    
                    .querySelectorAll('[data-component="unitPrice"]')[0]
                    .firstElementChild
                    .firstChild
                    .textContent.trim()
    
    items_dict[itemTitle] = {
        'unit_price': Number(itemPrice.replace(/[^0-9.-]+/g,""))
    }
}

console.log(summary_dict)

let items_subtotal = summary_dict['Item(s) Subtotal:']
let grand_total = summary_dict['Grand Total:'] 
let diff = grand_total - items_subtotal
let running_total = 0
for(const [key, value] of Object.entries(items_dict)) {
    let price = value['unit_price']
    let adjusted = price + ((price / items_subtotal) * diff)
    items_dict[key]['adjusted_price'] = Math.round(adjusted * 100) / 100
    running_total += adjusted
}
console.log(items_dict)
console.log(grand_total, running_total)