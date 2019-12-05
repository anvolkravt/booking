const gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    svgSprite = require('gulp-svg-sprite'),
    svgMin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    imagemin = require('gulp-imagemin');

sass.compiler = require('node-sass');

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'onboarding.html'
        },
        port: 666
    });
});

gulp.task('html', () => {
    return gulp.src('./app/*.html')
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

gulp.task('sass', function () {
    return gulp.src('./app/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

gulp.task('images', () => {
    return gulp.src('./app/assets/images/**/*.+(png|jpg|jpeg)')
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
        ]))
        .pipe(gulp.dest('./dist/assets/images'));
});

gulp.task('svg', () => {
    return gulp.src('./app/assets/images/icons/**/*.svg')
        .pipe(svgMin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg",
                    render: {
                        scss: {
                            dest: '../../../../scss/components/_sprite.scss',
                            template: "./app/assets/templates/_sprite_template.scss"
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest('./app/assets/images/sprite'))
        .pipe(browserSync.stream());
});

gulp.task('svg-to-dist', () => {
    return gulp.src('./app/assets/images/sprite/**/*.+(svg)')
        .pipe(gulp.dest('./dist/assets/images/sprite'))
        .pipe(browserSync.stream());
});

gulp.task('fonts', () => {
    return gulp.src('./app/assets/fonts/**/*.+(woff|woff2)')
        .pipe(gulp.dest('./dist/assets/fonts'))
        .pipe(browserSync.stream());
});

gulp.task('watch', function () {
    gulp.watch('./app/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('./app/js/**/*.js').on('change', browserSync.reload);
    gulp.watch("./app/*.html", gulp.series('html'));
    gulp.watch("./app/assets/images/**/*.+(jpg|jpeg|png)", gulp.series('images'));
    gulp.watch("./app/assets/images/icons/*.svg", gulp.series('svg'));
    gulp.watch("./app/assets/images/sprite/**/*.svg", gulp.series('svg-to-dist'));
    gulp.watch("./app/assets/fonts/**/*.+(woff|woff2)", gulp.series('fonts'));
});

gulp.task('default', gulp.parallel('server', 'html', 'sass', 'images', 'svg', 'svg-to-dist', 'fonts', 'watch'));
