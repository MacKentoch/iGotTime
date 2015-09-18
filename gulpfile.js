var gulp         = require('gulp');
var connect      = require('gulp-connect');
var sourcemaps   = require('gulp-sourcemaps');
var sass         = require('gulp-sass');
var cssmin       = require('gulp-cssmin');
var notify 			 = require('gulp-notify');
var rename			 = require('gulp-rename');
var concat 			 = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var exec         = require('child_process').exec;
var gulpConfig   = require('./gulpConfig');

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
gulp.task('connect',  function() {
  connect.server({
    port: 8080
  });
});





/**
 * SASS task
 */
 gulp.task('build:scss', 
		 function(){
	//minified		 
	gulp.src(gulpConfig.bases.src + gulpConfig.components.iGotTime.css, 
					{ cwd: gulpConfig.bases.root })
		.pipe(sass().on('error', notify.onError(function (error) { return 'Error: ' + error.message;})))
		.pipe(cssmin())   
		.pipe(concat(gulpConfig.components.iGotTime.bundleCssName + '.min.css'))   
		.pipe(gulp.dest(gulpConfig.bases.dist));
	//not minified
	gulp.src(gulpConfig.bases.src + gulpConfig.components.iGotTime.css, 
					{ cwd: gulpConfig.bases.root })
		.pipe(sass().on('error', notify.onError(function (error) { return 'Error: ' + error.message;})))
		.pipe(concat(gulpConfig.components.iGotTime.bundleCssName + '.css'))   
		.pipe(gulp.dest(gulpConfig.bases.dist));
 });



gulp.task('default', ['build:scss', 'connect']);


