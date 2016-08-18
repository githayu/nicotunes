import gulp from 'gulp';
import plumber from 'gulp-plumber';
import gif from 'gulp-if';
import ignore from 'gulp-ignore';
import jsonminify from 'gulp-jsonminify';
import compass from 'gulp-compass';
import pleeease from 'gulp-pleeease';
import htmlmin from 'gulp-htmlmin';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import through2 from 'through2';

const DEBUG = !process.argv.includes('--release');
const DEST = './app';

// 監視対象
const watchTasks = [
  'javascript',
  'json',
  'html',
  'sass',
  'css',
  'copy'
];

// パターン
var PATTERN = {
  JAVASCRIPT: [
    'src/**/*.js'
  ],
  JSON: [
    'src/**/*.json'
  ],
  HTML: [
    'src/**/*.html'
  ],
  SASS: [
    'src/**/*.scss'
  ],
  CSS: [
    'src/**/*.css'
  ]
};

// コピー機
PATTERN.COPY = (() => {
  var result = [
    'src/**/*',
    '!src/**/esx/**/*',
    '!src/**/sass/**/*',
    '!src/**/node_modules/**/*',
    '!src/**/.DS_Store'
  ];

  Object.values(PATTERN).forEach(pattern => {
    let newPattern = [];

    Array.from(pattern).forEach(text => {
      if (text.includes('node_modules')) newPattern.push(text.slice(1));
      else newPattern.push(text.startsWith('!') ? text : '!'+ text);
    });

    result.push(...newPattern);
  });

  return result;
})();

const PLEEEASE_OPTIONS = {
  autoprefix: {
    browsers: ['last 1 version']
  }
};

const UGLIFY_CONFIG = {
  output: {
    ascii_only: true
  }
};

// タスクたち
gulp.task('javascript', () => {
  return gulp.src(PATTERN.JAVASCRIPT, { base: 'src' })
  .pipe(plumber())
  .pipe(babel())
  .pipe(gif(!DEBUG, uglify(UGLIFY_CONFIG)))
  .pipe(gulp.dest(DEST));
});

gulp.task('json', () => {
  return gulp.src(PATTERN.JSON, { base: 'src' })
  .pipe(jsonminify())
  .pipe(gulp.dest(DEST));
});

gulp.task('html', () => {
  return gulp.src(PATTERN.HTML, { base: 'src' })
  .pipe(plumber())
  .pipe(htmlmin({
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
  }))
  .pipe(gulp.dest(DEST));
});

gulp.task('css', function() {
  return gulp.src(PATTERN.CSS, { base: 'src' })
  .pipe(plumber())
  .pipe(pleeease(PLEEEASE_OPTIONS))
  .pipe(gulp.dest(DEST));
});

gulp.task('sass', () => {
  return gulp.src(PATTERN.SASS)
  .pipe(plumber())
  .pipe(compass({
    css: './src/css',
    sass: './src/sass'
  }))
});

gulp.task('copy', () => {
  return gulp.src(PATTERN.COPY, { base: 'src' })
  .pipe(plumber())
  .pipe(ignore.include({
    isFile: true
  }))
  .pipe(gulp.dest(DEST));
});

gulp.task('watch', () => {
  for (let task of watchTasks) {
    gulp.watch(PATTERN[task.toUpperCase()], gulp.parallel(task));
  }
});

gulp.task('all', gulp.series(...Object.keys(PATTERN).map(pattern => pattern.toLowerCase())));

gulp.task('default', gulp.series('watch'));
