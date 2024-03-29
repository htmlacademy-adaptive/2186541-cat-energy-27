import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import {deleteAsync} from 'del';


// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}


// HTML
export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace:true}))
    .pipe(gulp.dest('build'))
    .pipe(browser.stream());
}

// Script
export const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

// Images
export const images = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'));
}

export const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('build/img'));
}

// WebP
export const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({
        webp: {}
      }
    ))
    .pipe(gulp.dest('build/img'));
}

// SVG
export const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));
}

export const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Copy
export const copy = (done) => {
  gulp.src([
    'source/**/*.{woff2,woff}',
    'source/*.ico',
    'source/*.webmanifest'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Clean
export const clean = () => {
  return deleteAsync('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
export const reload = (done) => {
  browser.reload();
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(script));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Build
export const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    styles,
    html,
    svg,
    sprite,
    createWebp,
    script
  ),
);

// Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    svg,
    sprite,
    createWebp,
    script
  ),
  gulp.series(
    server,
    watcher
  )
);
