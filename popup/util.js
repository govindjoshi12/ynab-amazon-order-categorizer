export const browserAPI = browser || chrome

export function getAndClearElementById(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
    return el;
}