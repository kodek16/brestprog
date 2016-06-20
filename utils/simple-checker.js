'use strict';

let fs = require('fs');

const ALLOWED_ERROR = 1e-4;

module.exports = runSimpleChecker;

/**
 * A simple checker that compares files line by line, token by token, allowing
 * small errors in fractions.
 * @param fileName1 first file
 * @param fileName2 second file
 * @return promise for true or false. True is returned when files are the same.
 */
function runSimpleChecker(fileName1, fileName2) {
  let promise1 = new Promise(resolve => {
    fs.readFile(fileName1, 'utf8', (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });

  let promise2 = new Promise(resolve => {
    fs.readFile(fileName2, 'utf8', (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });

  return Promise.all([promise1, promise2])
    .then(compareFiles);

  function compareFiles(files) {
    let [file1, file2] = files;

    let lines1 = file1.split('\n'), lines2 = file2.split('\n');

    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      let line1 = lines1[i] || '';
      let line2 = lines2[i] || '';

      if (!compareLines(line1, line2)) {
        return false;
      }
    }

    return true;
  }

  function compareLines(line1, line2) {
    let tokens1 = line1.split(' ').filter(t => t.length);
    let tokens2 = line2.split(' ').filter(t => t.length);

    if (tokens1.length != tokens2.length) {
      return false;
    }

    for (let i = 0; i < tokens1.length; i++) {
      let fractionRe = /\d+\.\d+/;
      if (fractionRe.test(tokens1[i]) && fractionRe.test(tokens2[i])) {
        let error = Math.abs(Number(tokens1[i]) - Number(tokens2[i]));
        if (error > ALLOWED_ERROR) {
          return false;
        }
      } else {
        if (String(tokens1[i]) != String(tokens2[i])) {
          return false;
        }
      }
    }

    return true;
  }
}
