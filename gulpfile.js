const gulp = require("gulp");
const replace = require("gulp-replace");
const sass = require("gulp-sass");
const cleancss = require("gulp-clean-css");
const purgecss = require("gulp-purgecss");
const pinfo = require("./package.json");
const exec = require("child_process").exec;
var uglify = require("gulp-uglify");

gulp.task("fix-version", function () {
  return gulp
    .src("src/manifest.json")
    .pipe(replace("$VERSION$", pinfo.version))
    .pipe(gulp.dest("./"));
});

gulp.task("styles-nano", function () {
  return gulp
    .src("src/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(cleancss())
    .pipe(gulp.dest("resources/css/"));
});

gulp.task("purge-unused-css", function () {
  return gulp
    .src("src/scss/bootstrap.min.css")
    .pipe(
      purgecss({
        content: ["windows/**/*.html", "src/scripts/**/*.js"],
      })
    )
    .pipe(gulp.dest("resources/css"));
});

gulp.task("minify-scripts", function () {
  return gulp
    .src("src/scripts/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("resources/scripts/"));
});

gulp.task("build-archive", function (callback) {
  exec(
    "PowerShell.exe -File .\\CreateNewPackage.ps1",
    function (err, stdout, stderr) {
      console.log(stdout);
      callback(err);
    }
  );
});

gulp.task("default", function () {
  gulp.watch(
    "src/scss/**/*.scss",
    gulp.series(
      "styles-nano",
      "purge-unused-css",
      "fix-version",
      "build-archive"
    )
  );
  gulp.watch("src/manifest.json", gulp.series("fix-version", "build-archive"));
  gulp.watch(
    "windows/*.*",
    gulp.series(
      "styles-nano",
      "purge-unused-css",
      "fix-version",
      "build-archive"
    )
  );
  gulp.watch("package.json", gulp.series("fix-version", "build-archive"));
  gulp.watch(
    "src/scripts/**/*.js",
    gulp.series("minify-scripts", "build-archive")
  );
});

gulp.task(
  "deploy",
  gulp.series(
    "minify-scripts",
    "styles-nano",
    "purge-unused-css",
    "fix-version",
    "build-archive"
  )
);
