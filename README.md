### Extension Development

1. Open `about:debugging` on firefox
2. Load temporary add-on
3. Reload any time you make a change
4. `popup.js/html` does not show up in main console. Navigate to `about:debugging` and click `inspect` on the dev extension
5. You can install `web-ext` from `npm` or `brew`. `web-ext run` opens new firefox browser with blank profile and live reloads on source file change. 