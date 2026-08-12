# YNAB Order Extractor 

**Browser extension for splitting your amazon orders into your YNAB categories.** 

When you click the extension on an amazon orders page, 
- it will find the matching transaction in your plan,
- find each of the items in the order,
- adjust the price of each based on taxes/extra fees,
- and allow you to select a category for each item pulled from your own selected ynab plan.

It's written entirely by hand without AI. I made this as an exercise and just to solve a problem for myself, but I think I could be helpful to others bc I don't think this is a niche use case. It's also written in a way to accomodate any other storefront's receipt page, but I will only update it if I need it for myself. I want to open it up to anyone else who might want to add features for their own benefit. Feel free to file issues and create pull requests if you want to fix a bug or add a feature. 

**My only request is that you do not use AI to write any code.** 

I plan to clean up the code and create a YNAB approved UI at some point in the future so I can submit the extension to the various extension marketplaces, but there's no roadmap for this right now.

Notes
- When you split a transaction, it will replace the memo of the parent transaction with "Order #[order-number] - Split by Extension." And the memos of each of the subtransactions will be set to the first 500 characters of the Amazon item name.
- Once a transaction is split, you cannot re-split the transaction, and there is no way to reverse the action from the extension itself.
- I have not tested the extension on chrome, but it's written using the browser api so it should work as-is.
- The extension lists your credit card payment categories in the categories dropdown because it retrieves ALL your categories, but you cannot set a credit card payment category as a category for a subtransaction, so the update operation will fail if you try to do this.
- Remember that it takes a few days for new transactions to show up in YNAB, so no matching order will be found until YNAB receives the transaction.

Use at your own peril.

### Extension Usage / Development

1. Open `about:debugging` on firefox
2. Load temporary add-on (You may need to reload the extension each time you make a change).
3. `popup.js/html` does not show up in main console. Navigate to `about:debugging` and click `inspect` on the dev extension
4. You can also install `web-ext` from `npm` or `brew`. `web-ext run` opens new firefox browser with blank profile and live reloads on source file change.

TODO:
- error handling when you're being rate limited / some other internal API error
- decoupling data fetch logic from component render
- currently only supports `amazon.com` but could be used with `.co.uk`, `.in`, etc.
- Document how to create `order_extractor.js` content script for any receipt webpage. Backend just expects a paerticular JSON format, so order extractors can be written for any desired receipt page from other storefronts like walmart, target, etc.
- use session storage
