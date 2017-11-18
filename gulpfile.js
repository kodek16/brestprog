'use strict';

const fs = require('fs');

const gulp = require('gulp');
const del = require('del');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const mergeStreams = require('merge-stream');
const runSequence = require('run-sequence');
const webserver = require('gulp-webserver');

const lectionProcessor = require('./utils/lection-processor.js');

gulp.task('default', [ 'run' ]);

gulp.task('run', [ 'build' ], function() {
  return gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0'
    }));
});

gulp.task('stop', function() {
  return gulp.src('dist')
    .pipe(webserver())
    .emit('kill');
});

gulp.task('watch', [ 'run' ], function() {
  gulp.watch(
      [ 'lections/**/*', 'listings/**/*', 'styles/**/*', 'scripts/**/*' ],
      [ 'clean', 'build' ]);
});

gulp.task('build', function(cb) {
  runSequence(
    'clean',
    ['copyStatic', 'compileLections', 'compileIndex'],
    cb
  );
});

gulp.task('clean', function() {
  return del([
    'dist/**',
    '!dist'
  ]);
});

gulp.task('copyStatic', function() {
  return gulp.src([
    'resources/**',
    'scripts/**',
    'styles/**'
  ], {
    base: '.'
  })
  .pipe(gulp.dest('dist'));
});

// Only generates russian index as of now.
gulp.task('compileIndex', () => {
  return readLections()
    .then(lections => {
      let links = {};
      for (let lection of lections) {
        links[lection.name.ru] = '/lections/ru/' + lection.src;
      }

      return gulp.src('templates/index.pug')
        .pipe(pug({
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

              let stream = gulp.src('templates/lection.pug')
                .pipe(pug({
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
        console.error(`Couldn't read lections/list.json: ${err}`);
        resolve([]);
        return;
      }

      resolve(JSON.parse(data));
    });
  });
}
