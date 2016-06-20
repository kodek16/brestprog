'use strict';

module.exports = { whilst, wait };

/**
 * Repeatedly execute an asynchronous function that returns a promise on
 * completion while condition (synchronous) returns true.
 */
function whilst(condition, fn) {
  if (condition()) {
    return fn().then(() => whilst(condition, fn));
  } else {
    return Promise.resolve();
  }
}

/**
 * A promise wrapper for setTimeout.
 * @param ms milliseconds to wait
 * @return promise that resolves after x ms
 */
function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
