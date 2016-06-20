'use strict';

let intel = require('intel');
let path = require('path');

let { languages } = require('./languages');
let uniqueName = require('./unique-gen');

/**
 * A data class that contains a reference to a solution object, and input and
 * output file names.
 */
class SolutionInvokation {
  constructor(solution, input, output) {
    this.solution = solution;
    this.input = input;
    this.output = output;
  }
}

/**
 * A solution is a runnable program that solves some task by reading input data
 * from stdin and writing result to stdout. One solution can target (solve)
 * multiple task profiles. This allows more optimal solutions to be used when
 * testing less optimal.
 */
class Solution {

  constructor(source, languageName, profiles) {
    this.source = source;
    this.language = languages.get(languageName);
    this.profiles = profiles;

    this.compiledPath = null;
  }

  /**
   * Compile the solution. This must be done before all invokations.
   */
  compile(destination) {
    let self = this;

    return self.language.compile(self.source, destination)
      .then(solutionPath => {
        self.compiledPath = solutionPath;
      })
      .catch(error => {
        intel.error(`Couldn't compile solution ${self.source}: ${error}`);
        throw error;
      });
  }

  /**
   * Runs the solution on given cases.
   * @param cases input file names.
   * @return promise for SolutionInvokation array
   */
  invoke(cases, tempDir) {
    let self = this;

    if (!self.compiledPath) {
      let err = `Attempted to invoke generator ${self.source} without compiling it.`;
      intel.error(err);
      return Promise.reject(new Error(err));
    }

    return Promise.all(cases.map(inFile => {
      let outFile = path.join(tempDir, uniqueName());
      return self.language.run(self.compiledPath, [], inFile, outFile)
        .then(() => new SolutionInvokation(self, inFile, outFile));
    }));
  }
}

module.exports = Solution;
