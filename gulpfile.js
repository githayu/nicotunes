var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    compass = require('gulp-compass'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    please = require('gulp-pleeease'),
    changed = require('gulp-changed'),
    imagemin = require('gulp-imagemin'),
    babel = require('gulp-babel'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    htmlmin = require('gulp-htmlmin'),
    pngquant = require('imagemin-pngquant'),
    through2 = require('through2');


// html
gulp.task('html', function() {
  gulp.src('./src/html/**/*.html', {
    base: 'src'
  })
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('./app'));
});

// JS
gulp.task('js', function() {
  gulp.src('./src/js/**/*.js', {
    base: 'src'
  })
    .pipe(changed('./app'))
    .pipe(plumber())
    .pipe(babel({
      presets: ['es2017', 'stage-1', 'stage-0', 'react'],
      plugins: ['transform-decorators-legacy'],
      compact: false
    }))
    // .pipe(uglify({
    //   output: {
    //     ascii_only: true
    //   }
    // }))
    .pipe(gulp.dest('./app'));
});


// css
gulp.task('css', function() {
  gulp.src('./src/css/**/*.css', {
    base: 'src'
  })
    .pipe(plumber())
    .pipe(please({
      browsers: ['last 1 Chrome versions']
    }))
    .pipe(gulp.dest('./app'));
});


// compass
gulp.task('compass', function() {
  gulp.src('./src/sass/**/*.scss')
    .pipe(plumber())
    .pipe(compass({
      config_file: './src/config.rb',
      sass: './src/sass/',
      css: './src/css/',
      comments: false
    }));
});


// image
gulp.task('image', function() {
  gulp.src('./src/img/**/*', {
    base: 'src'
  })
    .pipe(imagemin({
      use: [pngquant({
        quality: '65-80',
        spped: 1
      })]
    }))
    .pipe(gulp.dest('./app'));
});


// 監視
gulp.task('watch', function() {
  watch('./src/html/**/*.html', function() {
    gulp.start('html');
  });

  watch('./src/js/**/*.js', function() {
    gulp.start('js');
  });

  watch('./src/react/**/*.js', function() {
    gulp.start('browserify');
  });

  watch('./src/sass/**/*.scss', function() {
    gulp.start('compass');
  });

  watch('./src/css/**/*.css', function() {
    gulp.start('css');
  });

  watch('./src/img/**/*', function() {
    gulp.start('image');
  });
});


// 実行
gulp.task('default', ['watch']);
