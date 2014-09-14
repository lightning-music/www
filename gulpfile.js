var fs = require('fs'),
    gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    defineModule = require('gulp-define-module'),
    handlebars = require('gulp-handlebars');

function bundle(bundler) {
  return bundler.bundle()
    .on('error', gulpUtil.log.bind(gulpUtil, 'browserify error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('.'));
}

gulp.task('bundle', function() {
  var bundler = browserify('./index.js', watchify.args);
  return bundle(bundler);
});

gulp.task('watch', function() {
  var bundler = watchify(browserify('./index.js', watchify.args));
  bundler.transform('brfs');
  bundler.on('update', bundle.bind(null, bundler));
  return bundle(bundler);
});

gulp.task('templates', function() {
  gulp.src('templates/*.html')
    .pipe(handlebars())
    .pipe(defineModule('node'))
    .pipe(gulp.dest('.'));
});

gulp.task('clean', function() {
  fs.unlinkSync('./bundle.js');
});
