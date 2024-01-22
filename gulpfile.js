const gulp = require('gulp')
const shell = require('gulp-shell')
const fs = require('fs')
const package = fs.readFileSync('./package.json', 'utf8')

// copy recommended files
function copyFile() {
  return gulp
    .src(['LICENSE.md', 'README.md', 'composer.phar'])
    .pipe(gulp.dest('dist/'))
}

// setup packages dir and package.json version
function setupPackage() {
  const currentPackage = JSON.parse(package)
  delete currentPackage.devDependencies
  delete currentPackage.scripts
  let newPackage = currentPackage
  newPackage.version = process.env.VERSION || '0.0.0'
  console.log('Current version detected : ' + newPackage.version)
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

// post deploy to registry
function postDeploy() {
  return gulp
    .src('.')
    .pipe(
      shell(['rm -rf dist/packages/**/node_modules', 'rm -rf dist/packages/ci'])
    )
}

// run task
gulp.task('default', gulp.series(copyFile, setupPackage, postDeploy))
