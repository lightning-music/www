/**
 * Function utilities.
 */
var assert = require('assert');

/**
 * Ensure a callback is invoked only once.
 * 
 * @param  {Function}   cb
 * @param  {Boolean}    fatal - If true, throw Error, else log error
 * 
 * @return {Function}   wrapper around cb
 */
module.exports.callOnce = function(cb, fatal) {
  assert.strictEqual(typeof cb, 'function');
  var called = false;
  return function() {
    var args = Array.prototype.slice.call(arguments);
    if (!called) {
      cb.apply(cb, args);
      called = true;
    } else {
      if (fatal) {
        throw new Error('function invoked more than once');
      } else {
        console.log('attempting to invoke function more than once');
      }
    }
  };
};

