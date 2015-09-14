var gulp         = require('gulp');

var connect      = require('gulp-connect');
var sourcemaps   = require('gulp-sourcemaps');

var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');




gulp.task('connect', function() {
  connect.server({
    port: 8080
  });
});


gulp.task('default', ['connect']);
