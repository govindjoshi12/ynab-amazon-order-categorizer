# YNAB Order Extractor 

### Extension Development

1. Open `about:debugging` on firefox
2. Load temporary add-on
3. Reload any time you make a change
4. `popup.js/html` does not show up in main console. Navigate to `about:debugging` and click `inspect` on the dev extension
5. You can install `web-ext` from `npm` or `brew`. `web-ext run` opens new firefox browser with blank profile and live reloads on source file change.

TODO:
- error handling when you're being rate limited / some other internal API error
- decoupling data fetch logic from component render
- currently only supports `amazon.com` but could be used with `.co.uk`, `.in`, etc.
- Document how to create `order_extractor.js` content script for any receipt webpage. Backend just expects a paerticular JSON format, so order extractors can be written for any desired receipt page from other storefronts like walmart, target, etc.
- use session storage
