'use strict';

let intel = require('intel');
let path = require('path');
let execSync = require('child_process').execSync;

let exec = require('./exec');
let uniqueName = require('./unique-gen');

const TIMEOUT = 20000;

let nextPriority = 1;

/*
 * A programming language to be used in listings.
 * Use 'compile' and 'run' methods to run source files.
 */
class Language {

  constructor(name, extension, comment, compile, run) {
    this.name = name;
    this.extension = extension;
    this.comment = comment;
    this.priority = nextPriority++;

    this.compile = compile;
    this.run = run;
  }
}

let languages = new Map();

module.exports = { Language, languages };

//C++11
languages.set('cc', new Language('C++', 'cc', '//', compileCc, runCc));

//Java 8
languages.set('java', new Language('Java', 'java', '//', compileJava, runJava));

//Python 3
languages.set('py', new Language('Python', 'py', '#', compilePy, runPy));

//Memoization for avoiding compiling same source multiple times. Prevents
//a bug when Java .class file is deleted by one component compilation when
//it is still needed for compiling another component from the same source.
let compiledArtifacts = new Map();

function compileCc(sourcePath, destination) {
  if (compiledArtifacts.has(sourcePath)) return compiledArtifacts.get(sourcePath);

  let targetPath = path.join(destination, uniqueName());
  intel.verbose(`Compiling C++ source ${sourcePath} to ${targetPath}`);

  let promise = exec(`clang++ -std=c++11 -o ${targetPath} ${sourcePath}`)
    .then(() => {
      intel.verbose(`Successfully compiled ${sourcePath} to ${targetPath}`);
      return targetPath;
    })
    .catch(err => {
      intel.error(`${sourcePath} could not be compiled, error is:\n${err}`);
      throw err;
    });

  compiledArtifacts.set(sourcePath, promise);
  return promise;
}

function runCc(executablePath, args, inFile, outFile) {
  return exec(executablePath, { args, inFile, outFile, timeout: TIMEOUT });
}

function compileJava(sourcePath, destination) {
  if (compiledArtifacts.has(sourcePath)) return Promise.resolve(compiledArtifacts.get(sourcePath));

  let jarPath = path.join(destination, uniqueName() + '.jar');
  intel.verbose(`Compiling Java source ${sourcePath} to ${jarPath}`);

  let buildDir = path.join(destination, uniqueName());
  execSync(`mkdir -p ${buildDir}`);

  let promise = exec(`javac ${sourcePath} -d ${buildDir}`)
    .then(() => {
      intel.verbose(`Successfully compiled ${sourcePath} to .class file(s) at ${buildDir}`);
      intel.verbose(`Packaging ${buildDir} into a JAR.`);
      return exec(`jar cfe ${jarPath} Main -C ${buildDir} .`)
        .then(() => jarPath);
    })
    .then(jarPath => {
      intel.verbose(`Successfully created JAR file ${jarPath}`);
      compiledArtifacts.set(sourcePath, jarPath);
      return jarPath;
    })
    .catch(err => {
      intel.error(`${sourcePath} could not be compiled, error is:\n${err}`);
      throw err;
    });

  compiledArtifacts.set(sourcePath, promise);
  return promise;
}

function runJava(jarPath, args, inFile, outFile) {
  return exec(`java -jar ${jarPath}`, { args, inFile, outFile, timeout: TIMEOUT });
}

//We don't compile Python
function compilePy(sourcePath) {
  return Promise.resolve(sourcePath);
}

function runPy(sourcePath, args, inFile, outFile) {
  return exec(`python3 ${sourcePath}`, { args, inFile, outFile, timeout: TIMEOUT });
}
