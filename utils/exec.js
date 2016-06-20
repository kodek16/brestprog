'use strict';

let cpExec = require('child_process').exec;
let intel = require('intel');

let { wait } = require('./promise-utils');

module.exports = exec;

const MAX_PARALLEL_TASKS = 8;

let runningTasks = 0;

/**
 * A convenience wrapper for the exec function.
 * @param executablePath path to the executable, possibly with some flags.
 * @param options different execution options, see implementation.
 * @return promise that resolves to stdout on success or rejects to
 *         stderr on error.
 */
function exec(executablePath, options) {
  options = options || {};

  let command = executablePath;

  if (options.args) {
    command += ` ${options.args.join(' ')}`;
  }

  if (options.inFile) {
    command += ` <${options.inFile}`;
  }

  if (options.outFile) {
    command += ` >${options.outFile}`;
  }

  intel.verbose(`Executing ${command}`);

  let execOptions = {
    maxBuffer: 50000000   //for stdout and stderr, 50M
  };

  if (options.timeout) {
    execOptions.timeout = options.timeout;
  }

  if (runningTasks < MAX_PARALLEL_TASKS) {
    runningTasks++;

    return new Promise((resolve, reject) => {
      cpExec(command, execOptions,
             (error, stdout, stderr) => {
               runningTasks--;
               if (error) {
                 reject(stderr);
               } else {
                 resolve(stdout);
               }
             });
    });
  } else {
    return wait(300)
      .then(() => exec(executablePath, options));
  }
}
