var gulp         = require('gulp');

var connect      = require('gulp-connect');
var sourcemaps   = require('gulp-sourcemaps');

var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var exec = require('child_process').exec;

/**
 * PRODUCTION :
 * jspm bundle sfx minified version
 * 
 * take js in ./dist directory (no need jspm with this bundle)
 */
gulp.task('jspmBuild:sfx:min', function (cb) {
  exec('jspm bundle-sfx src/app/bootstrap ./dist/iGotTime.min.js --minify', function (err, stdout, stderr) {
      cb(err);
  });
});
/**
 * PRODUCTION :
 * jspm bundle sfx 
 * 
 * take js in ./dist directory (no need jspm with this bundle)
 */
gulp.task('jspmBuild:sfx', function (cb) {
  exec('jspm bundle-sfx src/app/bootstrap ./dist/iGotTime.js', function (err, stdout, stderr) {
      cb(err);
  });
});


/**
 * DEVELOPEMENT
 * launch server
 * 
 * index.html is ready for developement version (no need to build)
 */
gulp.task('connect', function() {
  connect.server({
    port: 8080
  });
});


gulp.task('default', ['connect']);


