var gulp            = require('gulp');
var cleanCSS        = require('gulp-clean-css');
var rev             = require("gulp-rev");
var revCollector    = require('gulp-rev-collector');
var clean           = require('gulp-clean');
var uglify          = require('gulp-uglify');
var gutil           = require('gulp-util');
var gls             = require('gulp-live-server');
var ejs             = require('gulp-ejs');
var rename          = require('gulp-rename');

const DIST = './dist';
const TEMPLATE = './template';
const VIEW = DIST + '/views';
const CSS_PATH = './css', JS_PATH = './js', EJS_PATH = TEMPLATE;
const CSS_HASH_PATH = DIST + '/css', JS_HASH_PATH = DIST + '/js';
const CUSTOM_SERVER = './server.js';
const HTML = VIEW + '/*.html';
const CSS = CSS_PATH + '/*.css';
const JS = JS_PATH + '/*.js';
const EJS = EJS_PATH + '/*.ejs';
const HTML_EXT = '.html';
const REV = './rev';
const REV_JSON = './rev/*.json';

var data  = require('./data.json');

gulp.task('clean-scripts', function () {
    return gulp.src([CSS_HASH_PATH, JS_HASH_PATH])
        .pipe(clean({ force:true }));
});

gulp.task('minify-css', ['clean-scripts'], function () {
    return gulp.src(CSS)
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rev())
    .pipe(gulp.dest(CSS_HASH_PATH))
    .pipe(rev.manifest('css.json'))
    .pipe(gulp.dest(REV));
});

gulp.task('uglify-js', ['clean-scripts'], function () {
    return gulp.src(JS)
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(rev())
        .pipe(gulp.dest(JS_HASH_PATH))
        .pipe(rev.manifest('js.json'))
        .pipe(gulp.dest(REV));
});

gulp.task('template', ['minify-css', 'uglify-js'], function () {
    return gulp.src(EJS)
        .pipe(ejs(data))
        .on('error', gutil.log)
        .pipe(rename({ extname: HTML_EXT }))
        .pipe(gulp.dest(VIEW));
});

gulp.task('rev', ['template'], function () {
    return gulp.src([REV_JSON, HTML])
        .pipe(revCollector())
        .pipe(gulp.dest(VIEW));
});

gulp.task('server', function () {
    var server = gls.new(CUSTOM_SERVER);
    server.start();

    var watcher = gulp.watch([CSS, JS, EJS], ['rev']);
    watcher.on('change', function (file) {
        server.notify.apply(server, [file]);
    });
    gulp.watch(CUSTOM_SERVER, server.start.bind(server));
});

gulp.task('default', ['server', 'rev']);
gulp.task('build', ['rev']);