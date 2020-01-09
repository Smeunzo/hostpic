const gulp = require('gulp');
const ts = require('gulp-typescript');
var spawn = require('child_process').spawn;

const tsProject = ts.createProject('tsconfig.json');

var node;

gulp.task('build', () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('run', gulp.series('build', (done) => {
    if (node) node.kill();
    node = spawn('node', ['dist/main.js'], {stdio: 'inherit'});
    done();
}));

gulp.task('watch', gulp.series('run', () => {
    gulp.watch(['src/**/*.ts'], gulp.series('run'));
}));

gulp.task('default', gulp.series('watch'));