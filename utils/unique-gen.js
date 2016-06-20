'use strict';

module.exports = uniqueString;

let next = 1;

/**
 * Simple unique string generator.
 * //TODO make asynchronous, because who uses synchronous JS these days?
 */
function uniqueString() {
  return 'a' + next++;
}
