'use strict';

let fs = require('fs');
let intel = require('intel');
let path = require('path');

let { languages } = require('./languages');

module.exports = parseTestAnnotations;

/**
 * Parses @Test annotations in a given file. Annotation looks like:
 * //@Test:ActionName:Arg1:Arg2:...:ArgN
 * For every annotation, corresponding callback in actions is called.
 * @param fileName name of file to parse
 * @param actions callback map, entries have the form
 *        ActionName -> function(Arg1, Arg2, ...)
 * @return promise for void
 */
function parseTestAnnotations(fileName, actions) {
  return new Promise(resolve => {
    let extension = path.extname(fileName).substr(1);
    let annotationRe = new RegExp(languages.get(extension).comment + '@Test:(.*)$');

    fs.readFile(fileName, 'utf-8', (error, contents) => {
      intel.verbose(`Parsing annotations in ${fileName}.`);

      if (error) throw error;

      let lines = contents.split('\n');

      lines.forEach(parseLine);

      function parseLine(line, lineNo) {
        let found = line.match(annotationRe);

        if (found) {
          let args = found[1].split(':');
          intel.verbose(`Found an annotation: ${args}.`);
          let actionMatched = false;

          for (let name in actions) {
            if (args[0] == name) {
              actionMatched = true;
              actions[name](args.slice(1), lineNo);
            }
          }

          if (!actionMatched) {
            intel.error(`Unknown annotation in ${fileName}:${lineNo + 1}.`);
          }
        }
      }

      intel.verbose(`Finished parsing ${fileName}.`);

      resolve();
    });
  });
}
