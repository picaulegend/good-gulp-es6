import gulp from "gulp";
import gutil from "gulp-util";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import runSequence from "run-sequence";
import webpackConfig from "./webpack.conf";
import plugins from 'gulp-load-plugins';

const $ = plugins();
const browserSync = BrowserSync.create();

gulp.task("js", (cb) => {
  const myConfig = Object.assign({}, webpackConfig);

  webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });
});


gulp.task("server", ["js"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch('src/sass/**/*.scss', ['sass']);
  gulp.watch('src/**/*.html', browserSync.reload);
  gulp.watch("./src/js/**/*.js", ["js"]);
});


gulp.task('html', () => {
  return gulp.src('src/*.html')
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/'))
})

gulp.task("sass", () => {
  return gulp.src('src/sass/**/*')
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.autoprefixer())
    .pipe($.sourcemaps.write('/maps/'))
    .pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
})

gulp.task('css', () => {
  return gulp.src('dist/css/**/*')
    .pipe($.cleanCss())
    .pipe(gulp.dest('dist/css/'))
})

/* img */
gulp.task('img', () => {
  return gulp.src('src/img/**/*')
    .pipe($.changed('dist/img'))
    .pipe($.image())
    .pipe(gulp.dest('dist/img/'))
})


/* cleaning */
gulp.task('clean', () => {
  return del.sync(['dist/css/', 'dist/js/']);
})

/* revving & replacing */
gulp.task('revision', () => {
  return gulp.src(['dist/**/*.css', 'dist/**/*.js'])
    .pipe($.rev())
    .pipe($.revDeleteOriginal())
    .pipe(gulp.dest('dist'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('dist'))
})

gulp.task('revreplace', ['revision'], () => {
  var manifest = gulp.src("dist/rev-manifest.json");

  return gulp.src('dist/index.html')
    .pipe($.revReplace({manifest: manifest}))
    .pipe(gulp.dest('dist'));
});