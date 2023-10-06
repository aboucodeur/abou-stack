const gulp = require('gulp')
const shell = require('gulp-shell')
const fs = require('fs')
const package = fs.readFileSync('./package.json', 'utf8')

// copy the simple file
function copyFile() {
  return gulp.src(['LICENSE.md', 'README.md']).pipe(gulp.dest('dist/'))
}

// setup packages
function postBuild() {
  return gulp
    .src('.')
    .pipe(
      shell(['rm -rf dist/packages/**/node_modules', 'rm -rf dist/packages/ci'])
    )
}

// steup package.json
function setupPackage() {
  const customPackage = JSON.parse(package)
  delete customPackage.devDependencies
  delete customPackage.scripts
  let newPackage = customPackage
  newPackage.version = process.env.VERSION || 'no-version'
  fs.writeFileSync('package_tmp.json', JSON.stringify(newPackage), 'utf8')
  return gulp
    .src('.')
    .pipe(
      shell([
        'cp -r packages dist/',
        'mv package_tmp.json dist/',
        'mv dist/package_tmp.json dist/package.json'
      ])
    )
}

// run
gulp.task('default', gulp.series(copyFile, setupPackage, postBuild))
