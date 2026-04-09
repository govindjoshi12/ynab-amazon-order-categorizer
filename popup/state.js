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