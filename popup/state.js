import { onStartup } from './popup.js'
 
const _state = {}

const handler = {
  set(target, property, value, receiver) {
    target[property] = value;
    onStartup()
    console.log('updating', property, 'to', value)
    return true;
  }
};

export const state = new Proxy(_state, handler);

let _abortController = new AbortController();

export const getSignal = () => _abortController.signal;

export const resetAbortController = () => {
    _abortController.abort(); // Cancel old listeners
    _abortController = new AbortController(); // Create fresh signal for new listeners
};