'use strict';

let through = require('through2');
let glob = require('glob');
let intel = require('intel');
let fs = require('fs');
let escapeHtml = require('escape-html');

let { languages } = require('./languages');

module.exports = lectionProcessor;

/**
 * Returns a transform stream for processing lections. The stream processes
 * HTML annotations (currenty only @Listing).
 * @return transform stream
 */
function lectionProcessor() {
  return through.obj((file, encoding, callback) => {
    let lines = file.contents.toString().split('\n');
    let next = 0;

    let outFile = '';

    nextLine();

    function nextLine() {
      if (next < lines.length) {
        processLine(lines[next++])
          .then(outLine => {
            outFile += outLine + '\n';
            nextLine();
          });
      } else {
        file.contents = new Buffer(outFile);
        callback(null, file);
      }
    }
  });
}

/**
 * If line is a @Listing annotation, constructs a tab HTML layout from given
 * listings and returns it as a string. ELse just returns the line unchanged.
 * @param line line
 * @return promise for processed line
 */
function processLine(line) {
  return new Promise(resolve => {
    let re = /^\s*<!--@Listing:(.*)-->\s*$/;
    let found = re.exec(line);

    if (!found) {
      resolve(line);
      return;
    }

    let [path, section] = found[1].split(':');

    glob('listings/' + path, (error, files) => {
      if (error) throw error;

      let sourceNames = new Map();

      for (let file of files) {
        let extension = file.substr(file.lastIndexOf('.') + 1);

        if (sourceNames.get(extension)) {
          intel.error(`directory tree ${path} contains multiple files named *.${extension}`);
          continue;
        }

        sourceNames.set(extension, file);
      }

      let sanitizedSources = new Map();
      let sanitizePromises = [];

      for (let [extension, fileName] of sourceNames) {
        let promise = readListingSource(fileName, section)
          .then(sanitized => sanitizedSources.set(extension, sanitized));
        sanitizePromises.push(promise);
      }

      Promise.all(sanitizePromises)
          .then(() => resolve(constructLayout(sanitizedSources)));
    });
  });
}

/**
 * Constructs an HTML tab layout from given source map.
 * @param sanitizedSources language -> listing map
 * @return HTML source
 */
function constructLayout(sanitizedSources) {
  sanitizedSources = resortByPriority(sanitizedSources);

  let html = '<div class="listing">';

  html += '<ul class="nav nav-pills" role="tablist">';

  for (let extension of sanitizedSources.keys()) {
    html += `<li role="presentation">
               <a href="javascript:;" role="tab">${languages.get(extension).name}</a>
             </li>`;
  }

  html += '</ul>';

  html += '<div class="tab-content">';

  for (let [extension, source] of sanitizedSources) {
    html += `<div role="tabpanel" class="tab-pane">
               <pre><code class="language-${prismLangName(extension)} line-numbers">${source}</code></pre>
             </div>`;
  }

  html += '</div>';

  html += '</div>';

  return html;

  function prismLangName(extension) {
    if (extension == "cc") return "cpp";
    if (extension == "java") return "java";
    if (extension == "py") return "python";
    return "";
  }
}

/**
 * Reads given file, stripping all annotations from it. Can read either the
 * whole file or only given section.
 * Also encodes HTML special characters.
 * @param fileName file name
 * @param section optional section name, reads whole file if omitted
 * @return promise for listing content
 */
function readListingSource(fileName, section) {
  return new Promise(resolve => {
    let extension = fileName.substr(fileName.lastIndexOf('.') + 1);

    if (!languages.get(extension)) {
      intel.error(`Listing ${fileName} has unknown language`);
      resolve('');
      return;
    }

    let commentPrefix = languages.get(extension).comment;

    fs.readFile(fileName, 'utf-8', (error, contents) => {
      if (error) throw error;

      if (section) {
        let re = new RegExp(`${commentPrefix}@Section:${section}\\s*\\n((.|\\n)*?)\\n\\s*${commentPrefix}@EndSection`);
        let found = re.exec(contents);

        if (!found) {
          intel.error(`Listing source ${fileName} doesn't contain requested section ${section}.`);
          resolve('');
          return;
        }

        contents = found[1];
      }

      let sanitized = '';
      let lines = contents.split('\n');

      for (let line of lines) {
        if (line.search(new RegExp(`^\\s*${commentPrefix}@`)) == -1) {
          sanitized += line + '\n';
        }
      }

      sanitized = escapeHtml(sanitized);
      sanitized = stripIndent(sanitized);

      resolve(sanitized);
    });
  });
}

/**
 * Returns a new sources map with entries sorted by language priority ascending.
 * @param sources language -> listing map
 * @return language -> listing map with sorted entries
 */
function resortByPriority(sources) {
  let langs = [... sources.keys()]
              .sort((a, b) => languages.get(a).priority - languages.get(b).priority);

  let result = new Map();

  for (let lang of langs) {
    result.set(lang, sources.get(lang));
  }

  return result;
}

/**
 * Strips redundant indentation from a listing.
 */
function stripIndent(listing) {
  let notBlankLines = listing.split('\n').filter(it => it.trim() !== '');
  let indents = notBlankLines.map(line => line.search(/[^ \t]/));
  let minIndent = Math.min(...indents);

  let lines = listing.split('\n');
  lines = lines.map(line => line.substr(minIndent));
  while (lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  return lines.join('\n');
}
