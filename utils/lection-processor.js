'use strict';

const through = require('through2');
const spawn = require('child_process').spawn;

module.exports = lectionProcessor;

function lectionProcessor() {
  return through.obj((file, encoding, callback) => {
    const processor = spawn('./utils/lection-processor.py')

    processor.stdin.end(file.contents);

    let processedHtml = '';
    let log = '';

    processor.stdout.on('data', (data) => { processedHtml += data; });
    processor.stderr.on('data', (data) => { log += data; });

    processor.on('close', (code) => {
      if (code == 0) {
        file.contents = new Buffer(processedHtml);
        callback(null, file);
      } else {
        console.error(`Error while testing listing ${file.path}. Log:\n${log}`);
      }
    });
  });
}
