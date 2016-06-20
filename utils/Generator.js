'use strict';

let intel = require('intel');
let path = require('path');

let { languages } = require('./languages');
let { whilst } = require('./promise-utils');
let uniqueSuffix = require('./unique-gen');

//Random test cases to be generated for each profile.
const TEST_CASES = 10;

/**
 * Generator is a program that generates test cases, that is, input files
 * for some task. A single generator can be used for multiple task profiles,
 * or even tasks, if it accepts different commmands.
 * Generator, after being compiled, is called like this:
 * ./generator randomCasesCommand randomCaseNumber
 * and
 * ./generator cornerCaseCommand cornerCaseNumber
 * The case input is then written to stdout.
 * Random case number may seem strange, but C++ generators that use testlib.h
 * calculate random seed from argv, so it has to different for different cases.
 * A generator has to declare at least two commands for generating random and
 * corner cases. Corner case command is followed by case number, to support
 * multiple corner cases. If the corner case with given number cannot be
 * generated (it doesn't exist), the generator outputs nothing.
 */
class Generator {

  /**
   * @param source path to generator source. A single source can correspond to
   *               multiple generators, if it declares multiple command pairs.
   * @param randomName command to generate a random case
   * @param cornerName command to generate a corner case
   */
  constructor(source, languageName, randomName, cornerName) {
    this.source = source;
    this.language = languages.get(languageName);
    this.randomName = randomName;
    this.cornerName = cornerName;

    this.compiledPath = null;
  }

  /**
   * Compile the generator. This must be done before all invokations.
   */
  compile(destination) {
    let self = this;

    return self.language.compile(self.source, destination)
      .then(generatorPath => {
        self.compiledPath = generatorPath;
      })
      .catch(error => {
        intel.error(`Couldn't compile generator ${self.source}: ${error}`);
        throw error;
      });
  }

  /**
   * Generate all test cases to the destination folder.
   * @return promise for case file names array
   */
  generate(destination) {
    let self = this;

    if (!self.compiledPath) {
      let err = `Attempted to invoke generator ${self.source} without compiling it.`;
      intel.error(err);
      return Promise.reject(new Error(err));
    }

    return Promise.all([generateRandomCases(), generateCornerCases()])
      .then(([randomCases, cornerCases]) => randomCases.concat(cornerCases));

    /**
     * Generate random cases.
     * @return promise for case file names array.
     */
    function generateRandomCases() {
      let randomCasesPromises = [];

      for (let i = 1; i <= TEST_CASES; i++) {
        let caseDestination = path.join(destination, uniqueSuffix());

        let promise = self.language.run(self.compiledPath, [self.randomName, i], null, caseDestination)
          .then(() => caseDestination)
          .catch(err => {
            intel.error(`Error generating random test #${i}: ${err}.`);
            throw err;
          });

         randomCasesPromises.push(promise);
      }

      return Promise.all(randomCasesPromises);
    }

    /**
     * Generate corner cases.
     * @return promise for case file names array.
     */
    function generateCornerCases() {
      let cornerCases = [];

      let cornerCasesLeft = true;
      let nextCornerCase = 1;

      return whilst(
        () => cornerCasesLeft,
        () => {
          let caseDestination = path.join(destination, uniqueSuffix());
          let index = nextCornerCase++;

          return self.language.run(self.compiledPath, [self.cornerName, index], null, caseDestination)
            .then(stdout => {
              if (stdout !== '') {
                cornerCases.push(caseDestination);
              } else {
                cornerCasesLeft = false;
              }
            })
            .catch(err => {
              intel.error(`Error generating corner test #${index}: ${err}.`);
              throw err;
            });
        }
      )
      .then(() => {
        return cornerCases;
      });
    }
  }
}

module.exports = Generator;
