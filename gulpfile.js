'use strict';

let gulp = require('gulp');
let del = require('del');
let fs = require('fs');
let jade = require('gulp-jade');
let rename = require('gulp-rename');
let mergeStreams = require('merge-stream');
let runSequence = require('run-sequence');
let webserver = require('gulp-webserver');
let yargs = require('yargs');
let intel = require('intel');

let lectionProcessor = require('./utils/lection-processor.js');
let test = require('./utils/test-framework.js');

intel.setLevel(intel.WARN);

if (yargs.argv.info) {
  intel.setLevel(intel.INFO);
}

if (yargs.argv.verbose) {
  intel.setLevel(intel.VERBOSE);
}

gulp.task('default', [ 'run' ]);

gulp.task('run', [ 'build' ], function() {
  return gulp.src('dist').pipe(webserver({
    host: '0.0.0.0'
  }));
});

gulp.task('stop', function() {
  return gulp.src('dist')
    .pipe(webserver())
    .emit('kill');
});

gulp.task('watch', ['run'], function() {
  gulp.watch(['lections/**/*', 'listings/**/*'], ['clean:build', 'build']);
});

gulp.task('clean', ['clean:test', 'clean:build']);

gulp.task('test', [ 'clean:test' ], function() {
  return test('./listings');
});

gulp.task('clean:test', function() {
  return del([ 'tmp' ]);
});

gulp.task('build', function(cb) {
  runSequence(
    'clean:build',
    ['copyStatic', 'compileLections', 'compileIndex'],
    cb
  );
});

gulp.task('clean:build', function() {
  return del([
    'dist/**',
    '!dist'
  ]);
});

gulp.task('copyStatic', function() {
  return gulp.src([
    'scripts/**',
    'styles/**'
  ], {
    base: '.'
  })
  .pipe(gulp.dest('dist'));
});

//Only generates russian index as of now.
gulp.task('compileIndex', () => {
  return readLections()
    .then(lections => {
      let links = {};
      for (let lection of lections) {
        links[lection.name.ru] = '/lections/ru/' + lection.src;
      }

      return gulp.src('templates/index.jade')
        .pipe(jade({
          locals: {
            lections: links
          }
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist'));
    });
});

gulp.task('compileLections', () => {
  return readLections()
    .then(lections => {
      let commonStream = mergeStreams();

      for (let lection of lections) {
        for (let lang in lection.name) {
          if (lection.name.hasOwnProperty(lang)) {
            fs.readFile('lections/' + lang + '/' + lection.src, function(err, contents) {
              if (err) {
                throw err;
              }

              let stream = gulp.src('templates/lection.jade')
                .pipe(jade({
                  locals: {
                    lectionName: lection.name[lang],
                    lectionSrc: contents
                  }
                }))
                .pipe(rename(lection.src))
                .pipe(lectionProcessor())
                .pipe(gulp.dest('dist/lections/' + lang + '/'));

              commonStream.add(stream);
            });
          }
        }
      }

      return commonStream;
    });
});

function readLections() {
  return new Promise(resolve => {
    fs.readFile('lections/list.json', 'utf-8', (err, data) => {
      if (err) {
        intel.error(`Couldn't read lections/list.json: ${err}`);
        resolve([]);
        return;
      }

      resolve(JSON.parse(data));
    });
  });
}
