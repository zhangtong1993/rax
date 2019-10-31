let updateCallbacks = [];
let effectCallbacks = [];
let layoutCallbacks = [];
export let scheduler = setTimeout;

if (process.env.NODE_ENV !== 'production') {
  // Wrapper timer for hijack timers in jest
  scheduler = (callback) => {
    setTimeout(callback);
  };
}

function invokeFunctionsWithClear(callbacks) {
  let callback;
  while (callback = callbacks.shift()) {
    callback();
  }
}

// Schedule before next render
export function schedule(callback) {
  if (updateCallbacks.length === 0) {
    scheduler(flush);
  }
  updateCallbacks.push(callback);
}

// Flush before next render
export function flush() {
  let callback;
  while (callback = updateCallbacks.shift()) {
    callback();
  }
}

export function scheduleEffect(callback) {
  if (effectCallbacks.length === 0) {
    scheduler(flushEffect);
  }
  effectCallbacks.push(callback);
}

export function flushEffect() {
  let callback;
  while (callback = effectCallbacks.shift()) {
    callback();
  }
}

export function scheduleLayout(callback) {
  layoutCallbacks.push(callback);
}

export function flushLayout() {
  invokeFunctionsWithClear(layoutCallbacks);
}