var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    batch = require('gulp-batch'),
    sass = require('gulp-ruby-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    nunjucksRender = require('gulp-nunjucks-render'),
    watch = require('gulp-watch'),
    del = require('del'),
    nunjucksDefaults = {path: 'src/templates/'},
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'), // ToDo: change beepbeep on gutil, and error log
    beepbeep = require('beepbeep'),
    ftp = require('vinyl-ftp');

// Reaction in case of error
function errorlog(err) {
  beepbeep();
	console.error(err.message);
	this.emit('end');
}

// ///////////////////////////////////////////////////
// // Watch Task
// ///////////////////////////////////////////////////
// gulp.task('watch', ['scss', 'html', 'browser-sync']);

gulp.task('default', ['compile']);

///////////////////////////////////////////////////
// SCSS compile
///////////////////////////////////////////////////
gulp.task('scss', function() {
  return sass('src/scss/style.scss')
  .on('error', sass.logError)
  .pipe(sourcemaps.init())
  .pipe(autoprefixer('last 2 versions'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./dist/css/'))
  .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
  watch('src/scss/**/*.scss',function () {
    gulp.start('scss');
  });
  watch('src/templates/**/*.+(html|njk|nunjucks)', function () {
    gulp.start('html');
  });
  gulp.start('browser-sync');
});

///////////////////////////////////////////////////
// Html compile
///////////////////////////////////////////////////
gulp.task('html', function() {
  return gulp.src('src/templates/pages/**/*.+(html|njk|nunjucks)')
  .pipe(plumber())
  .pipe(nunjucksRender(nunjucksDefaults))
  .on('error', errorlog)
  .pipe(gulp.dest('dist/'))
  .pipe(reload({stream:true}));
});

///////////////////////////////////////////////////
// Browser Sync
///////////////////////////////////////////////////
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
  //watch('./dist/**/*')
  //.pipe(reload({stream:true}));
});

///////////////////////////////////////////////////
// Deploy
// command line example: FTP_USER=XXX FTP_PWD=XXX gulp deploy 
///////////////////////////////////////////////////
gulp.task('deploy', function() {
  var user = process.env.FTP_USER;
  var password = process.env.FTP_PWD;
  var host = 'ftp.alexemashev.com';
  var port = 21;
  var localFilesGlob = ['dist/**/*'];
  var remoteFolder = '/';

  var conn = ftp.create({
        host: host,
        port: port,
        user: user,
        password: password,
        parallel: 3,
        log: gutil.log
    });

  return gulp.src(localFilesGlob, { buffer: false })
      .pipe( conn.newer( remoteFolder ) ) // only upload newer files
      .pipe( conn.dest( remoteFolder ) );
});
