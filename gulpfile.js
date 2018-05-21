var gulp = require('gulp');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var imagemin = require('gulp-imagemin');



gulp.task('usemin', function() {
  return gulp.src('./index_new.html')
    .pipe(usemin({
      css: [ minifyCss() ],
      html: [ minifyHtml({ empty: true }) ],
      js: [ uglify()],
      inlinejs: [ uglify() ],
      inlinecss: [ minifyCss(), 'concat' ]
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('scripts', () => {
  return gulp.src('js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});


gulp.task('html', () => {
  return gulp.src('tpl/**/*.html')
    .pipe(minifyHtml({ empty: true }))
    .pipe(gulp.dest('dist/tpl'))
});

gulp.task('image', () =>
    gulp.src('img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
);

gulp.task('css', () => {
  return gulp.src('css/**/*.css')
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/css'))
});


