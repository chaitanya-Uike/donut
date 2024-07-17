const context = [];

export function createSignal(value) {
  const subscriptions = new Set();
  const getValue = () => {
    const running = getCurrentObserver();
    if (running) {
      subscriptions.add(running);
    }
    return value;
  };
  const setValue = (newValue) => {
    if (value !== newValue) {
      value = newValue;
      for (const subscription of subscriptions) {
        subscription();
      }
    }
  };
  return [getValue, setValue];
}

export function createEffect(callback) {
  context.push(callback);
  try {
    callback();
  } finally {
    context.pop();
  }
}

function getCurrentObserver() {
  return context[context.length - 1];
}

export function createStore(value) {
  const signals = new Map();

  const handler = {
    get(obj, prop) {
      if (!signals.has(prop)) {
        signals.set(prop, createSignal(obj[prop]));
      }

      return signals.get(prop)[0]();
    },

    set(obj, prop, value) {
      const _store = createStore(value);
      if (!signals.has(prop)) obj[prop] = _store;
      else signals.get(prop)[1](_store);
      return true;
    },
  };

  let type = typeof value;
  if (value === null) type = "null";
  else if (Array.isArray(value)) type = "array";

  if (type === "array") {
    const _value = [];
    for (let i = 0, l = value.length; i < l; ++i) {
      _value[i] = createStore(value[i]);
    }
    return new Proxy(_value, handler);
  } else if (type === "object") {
    const _value = {};
    const keys = Object.keys(value);
    for (let i = 0, l = keys.length; i < l; ++i) {
      _value[keys[i]] = createStore(value[keys[i]]);
    }
    return new Proxy(_value, handler);
  }

  return value;
}
