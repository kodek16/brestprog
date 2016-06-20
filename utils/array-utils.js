'use strict';

module.exports = { count, invertMatrix };

/**
 * Count the number of occurences of value in array.
 * @return number of ocurrences
 */
function count(array, value) {
  let result = 0;

  let next = 0;
  while (array.indexOf(value, next) != -1) {
    result++;
    next = array.indexOf(value, next) + 1;
  }

  return result;
}

/**
 * Transforms a two-dimensional rectangular array so that arr[i][j] becomes
 * arr[j][i].
 * @return transformed matrix
 */
function invertMatrix(matrix) {
  let result = [];

  for (let j of matrix[0].keys()) {
    let newRow = [];
    for (let i of matrix.keys()) {
      newRow.push(matrix[i][j]);
    }
    result.push(newRow);
  }

  return result;
}
