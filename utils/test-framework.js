'use strict';

let execSync = require('child_process').execSync;
let path = require('path');
let glob = require('glob');
let intel = require('intel');

let { languages } = require('./languages');
let runSimpleChecker = require('./simple-checker');
let parseAnnotations = require('./parse-test-annotations');

let { count, invertMatrix } = require('./array-utils');

let Generator = require('./Generator');
let Solution = require('./Solution');

module.exports = test;

/**
 * Test all components in a directory tree.
 * @param rootDir directory tree root
 * @return promise for true of false, true is only returned when all tests
 *         have passed.
 */
function test(rootDir) {
  return findTestTargets(rootDir)
    .then(checkTestTargets)
    .then(testAllTargets);
}

class TestTarget {
  constructor() {
    this.solutions = [];
    this.generators = new Map();
    this.profiles = [];
  }
}

/**
 * Finds test targets and their components in a directory tree.
 * @param rootDir search root directory
 * @return promise for test targets object
 */
function findTestTargets(rootDir) {
  intel.verbose('Looking for test targets in ' + rootDir);

  let testTargets = new Map();  //target name -> TestTarget

  let globPromises = [];
  let parsePromises = [];

  let parseComponents = new Map();

  parseComponents.set('cc', parseCcComponents);
  parseComponents.set('java', parseJavaComponents);
  parseComponents.set('py', parsePyComponents);

  for (let [lang, parse] of parseComponents) {
    globPromises.push(new Promise(resolve => {
      glob(path.join(rootDir, '**', '*.' + languages.get(lang).extension), (error, files) => {
        if (error) throw error;

        for (let file of files) {
          parsePromises.push(parse(file, testTargets));
        }

        resolve();
      });
    }));
  }

  return Promise.all(globPromises)
    .then(() => Promise.all(parsePromises))
    .then(() => {
      intel.verbose('Finished parsing test targets in ' + rootDir);
      return testTargets;
    });
}

/**
 * Searches for valid profiles of every target in test targets objects. Valid
 * profiles, that is, those that can be successfully tested, are saved in
 * testTarget.profiles.
 * @param targets test targets object
 * @return modified test targets object with 'profiles' fields
 */
function checkTestTargets(targets) {
  for (let [name, target] of targets) {
    let profiles = new Set();
    let profileSolutions = new Map();   //profile -> solution count
    let profilesWithGenerators = new Set();

    if (target.solutions) {
      for (let solution of target.solutions) {
        for (let profile of solution.profiles) {
          profiles.add(profile);

          if (!profileSolutions.has(profile)) {
            profileSolutions.set(profile, 1);
          } else {
            profileSolutions.set(profile, profileSolutions.get(profile) + 1);
          }
        }
      }
    }

    if (target.generators) {
      for (let [profile, ] of target.generators) {
        profiles.add(profile);
        profilesWithGenerators.add(profile);
      }
    }

    //Should never happen.
    if (profiles.size === 0) {
      intel.error(`Target ${name} has no defined profiles.`);
    }

    for (let profile of profiles) {
      let good = true;

      if (!profilesWithGenerators.has(profile)) {
        intel.error(`Target ${name} profile ${profile} has no generator.`);
        good = false;
      }

      let solutions = profileSolutions.get(profile) || 0;

      if (solutions < 2) {
        intel.error(`Target ${name} profile ${profile} has ${solutions} solution(s), needs at least 2.`);
        good = false;
      }

      if (good) {
        target.profiles.push(profile);
      }
    }
  }

  return targets;
}

/**
 * Does the actual testing using components registered in the test targets
 * object.
 * @param testTargets test targets object
 * @return promise for true of false, true is only returned when all tests
 *         have passed.
 */
function testAllTargets(testTargets) {
  let testPromises = [];

  for (let [targetName, target] of testTargets) {
    for (let profile of target.profiles) {
      intel.verbose(`Testing ${targetName} ${profile}`);

      let prefix = 'tmp/' + sanitizeFileName(targetName + ' ' + profile);
      assertDirExists(prefix);

      let generator = target.generators.get(profile);
      let solutions = target.solutions.filter(
                          solution => solution.profiles.indexOf(profile) != -1);

      let casesPromise = generator.compile(prefix)
        .then(() => generator.generate(prefix));

      let compileSolutionsPromise = Promise.all(solutions.map(solution => solution.compile(prefix)));

      let testPromise = Promise.all([casesPromise, compileSolutionsPromise])
        .then(([cases]) => Promise.all(solutions.map(solution => solution.invoke(cases, prefix))))
        .then(solutionsInvokations => {
          let invokationsByCases = invertMatrix(solutionsInvokations);
          return Promise.all(invokationsByCases.map(
            caseInvokations => compareOutputs(caseInvokations, `${targetName} ${profile}`)));
        })
        .then(casePassed => casePassed.indexOf(false) == -1)
        .then(testsSuccessful => {
          if (!testsSuccessful) {
            intel.error(`Tests for ${targetName} ${profile} failed.`);
          } else {
            intel.info(`Tests for ${targetName} ${profile} passed.`);
          }

          return testsSuccessful;
        })
        .catch(err => {
          intel.error(`Some error happened while testing ${targetName} ${profile}: ${err}\n ${err.stack}`);
          return false;
        });

      testPromises.push(testPromise);
    }
  }

  return Promise.all(testPromises)
    .then(profileSuccesses => {
      if (profileSuccesses.indexOf(false) == -1) {
        intel.info('All tests have passed.');
        return true;
      } else {
        intel.error('Some tests have failed.');
        return false;
      }
    });

  /**
   * Compares all solutions outputs using simple checker.
   * @param invokations array of different solutions invokations on the same
   *        case.
   * @param profileName profile name (only used for error reporting).
   * @return promise for true or false, true is only returned when checker
   *         considered all outputs the same.
   */
  function compareOutputs(invokations, profileName) {
    let first = invokations[0];

    return Promise.all(invokations.slice(1).map(other => runSimpleChecker(first.output, other.output)))
      .then(equal => {

        //Only one solution gave different output.
        if (invokations.length > 2 && count(equal, false) == 1) {
          let badInvokation = invokations[equal.indexOf(false) + 1];

          intel.error(`Error found while testing ${profileName}, ` +
                      `most likely solution ${badInvokation.solution.source} is ` +
                      `incorrect. The test case is at ${badInvokation.input}, ` +
                      `solution output at ${badInvokation.output}. Output ` +
                      `assumed to be correct is at ${first.output}.`);

          return false;

        //All solutions gave the same output.
        } else if (count(equal, false) === 0) {
          return true;

        //Some other mismatch.
        } else {
          let badInvokation = invokations[equal.indexOf(false) + 1];

          intel.error(`Error(s) found while testing ${profileName}: ` +
                      `at least 2 solutions gave different outputs for case ` +
                      `${badInvokation.input}. They are ${first.solution.source} (${first.output}) ` +
                      `and ${badInvokation.solution.source} (${badInvokation.output}).`);

          return false;
        }
      });
  }
}

//------------------
//Annotation parsing
//------------------

function parseCcComponents(fileName, testTargets) {
  return parseAnnotations(fileName, {
    'Solution' : (args, lineNo) => processSolutionAnno(fileName, lineNo, 'cc', testTargets, args),
    'Generator': (args, lineNo) => processGeneratorAnno(fileName, lineNo, 'cc', testTargets, args)
  });
}

function parseJavaComponents(fileName, testTargets) {
  return parseAnnotations(fileName, {
    'Solution' : (args, lineNo) => processSolutionAnno(fileName, lineNo, 'java', testTargets, args)
  });
}

function parsePyComponents(fileName, testTargets) {
  return parseAnnotations(fileName, {
    'Solution' : (args, lineNo) => processSolutionAnno(fileName, lineNo, 'py', testTargets, args)
  });
}

/**
 * Registers a file annotated as @Solution in the test targets object.
 * @param fileName solution file name
 * @param lineNo annotated line number
 * @param lang solution language
 * @param testTargets test targets object
 * @param args annotation arguments
 */
function processSolutionAnno(fileName, lineNo, lang, testTargets, args) {
  let targetName = args[0];
  let targetProfiles = args.slice(1);

  if (!targetName || targetProfiles.length === 0) {
    intel.error(`Bad @Solution annotation in ${fileName}:${lineNo + 1}.`);
    return;
  }

  if (!testTargets.has(targetName)) {
    testTargets.set(targetName, new TestTarget());
  }

  testTargets.get(targetName).solutions.push(new Solution(fileName, lang, targetProfiles));

  intel.info(`Added a solution for target ${targetName} profile(s) ${targetProfiles}: ${fileName}.`);
}

/**
 * Registers a file annotated as @Generator in the test targets object.
 * @param fileName generator file name
 * @param lineNo annotated line number
 * @param lang generator language
 * @param testTargets test targets object
 * @param args annotation arguments
 */
function processGeneratorAnno(fileName, lineNo, lang, testTargets, args) {
  let targetName = args[0];
  let targetProfile = args[1];
  let randomGeneratorName = args[2];
  let cornerGeneratorName = args[3];

  if (!targetName || !targetProfile || !randomGeneratorName || !cornerGeneratorName) {
    intel.error(`Bad @Generator annotation in ${fileName}:${lineNo + 1}.`);
    return;
  }

  if (!testTargets.has(targetName)) {
    testTargets.set(targetName, new TestTarget());
  }

  if (testTargets.get(targetName).generators.has(targetProfile)) {
    intel.error(`@Generator for ${targetName} ${targetProfile} is redefined in ${fileName}:${lineNo + 1}.`);
    return;
  }

  testTargets.get(targetName).generators.set(targetProfile,
      new Generator(fileName, lang, randomGeneratorName, cornerGeneratorName));

  intel.info(`Added a generator for target ${targetName} ${targetProfile}: ${fileName}/${randomGeneratorName},${cornerGeneratorName}.`);
}

//------------
//Random utils
//------------

/**
 * Create a directory if it didn't exist before.
 * @param dir directory name
 */
function assertDirExists(dir) {
  execSync(`mkdir -p ${dir}`);
}

/**
 * Replaces non-alphanumeric characters in a file name with underscores.
 * @param fileName file name
 * @return sanitized file name
 */
function sanitizeFileName(fileName) {
  let result = '';

  for (let char of fileName) {
    if (char.search(/\w/) >= 0) {
      result += char;
    } else {
      result += '_';
    }
  }

  return result;
}
