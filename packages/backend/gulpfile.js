import gulp from 'gulp'
import shell from 'gulp-shell'

const PREFIX = 'YOUR_APP_PATH'
const SERVER_PATH = `${PREFIX}/server`
const CLIENT_PATH = `${PREFIX}/frontend`
const SIP = '66.175.214.6'
const SSH_PARAMS = `abou@${SIP}`

// HAPPY CODING !
const mode = process.env.MODE || 'prod'
console.log(mode)

function UI() {
  console.log('-----------------------------------')
  console.log('  YEYE - GESTION DE STOCK ')
  console.log('-----------------------------------')
  console.log('( prod ) - Production')
  console.log('( dev )  - Development')
}

function copyCurrentEnv() {
  console.log('Prepare copy server env')
  let sourceFile

  if (mode === 'prod') {
    sourceFile = `${SERVER_PATH}/.env_prod`
  } else if (mode === 'dev') {
    sourceFile = `${SERVER_PATH}/.env_dev`
  } else {
    throw new Error('Mode non reconnu')
  }

  return gulp
    .src(sourceFile)
    .pipe(shell([`cp ${sourceFile} ${SERVER_PATH}/.env`]))
}

function buildReact() {
  console.log('Prepare react build')
  return gulp
    .src('./')
    .pipe(
      shell([
        `cd ${CLIENT_PATH} && npm run build && rm -rf ${SERVER_PATH}/client/build && mv build ${SERVER_PATH}/client`
      ])
    )
}

function deployToProduction() {
  console.log('Prepare deploy to remote server')
  return gulp.src('./').pipe(
    shell([
      `echo "DEPLOIEMENT DE LA VERSION NON COMPILÉE EN COURS"`,
      `rm -rf ${SERVER_PATH}/dist`,
      `mv ${SERVER_PATH}/node_modules/ ${PREFIX}/tmp1`,
      `mv ${SERVER_PATH}/.cache/ ${PREFIX}/.cache`,
      // pas important lors du deploy (skip de puppeteer)
      `mv ${SERVER_PATH}/.npmrc ${PREFIX}/.npmrc`,

      // Sauvegarder le code source du frontend
      `mv ${CLIENT_PATH}/node_modules/ ${PREFIX}/tmp2`,
      `mkdir -p ${SERVER_PATH}/client/source_code`,
      // reverse : tar -xzvf projects.tar.gz
      `tar -czvf frontend.tar.gz ${CLIENT_PATH}`,
      `cp -r frontend.tar.gz ${SERVER_PATH}/client/source_code/`,
      `mv ${PREFIX}/tmp2/ ${CLIENT_PATH}/node_modules`,

      // Transfert vers le serveur distant
      `rsync -avz --no-perms -e ssh ${SERVER_PATH}/ ${SSH_PARAMS}:/home/abou/sites/Yeye_$(date +'%m_%d_%Y')`,

      // Post-transfert
      `mv ${PREFIX}/tmp1/ ${SERVER_PATH}/node_modules`,
      `mv ${PREFIX}/.cache/ ${SERVER_PATH}/.cache mv ${PREFIX}/.npmrc ${SERVER_PATH}/.npmrc`
    ])
  )
}

function bundle() {
  console.log('Prepare webpack bundle')
  return gulp.src('./').pipe(
    shell(
      [
        `rm -rf ${SERVER_PATH}/dist/*`,
        // use webpack
        `cd ${SERVER_PATH} && npm run build:${mode}`,

        // prepare dist
        `mkdir -p ${SERVER_PATH}/dist/src/{uploads,database/dump}`,
        `cp -r ${SERVER_PATH}/client ${SERVER_PATH}/dist`,
        `cp -r ${SERVER_PATH}/src/database/pg_constraint.sql ${SERVER_PATH}/dist`,
        `cp -r ${SERVER_PATH}/src/database/pg_constraint.sql ${SERVER_PATH}/dist/src/database`,

        // bundle for specifi mode
        `if [ "${mode}" == 'prod' ]; then 
          cp -r ${SERVER_PATH}/{node_modules,package.json,dump.js} ${SERVER_PATH}/dist
        else
          cp -r ${SERVER_PATH}/{node_modules,package.json,dump.js,.npmrc} ${SERVER_PATH}/dist
          if [[ -f ${SERVER_PATH}/.cache/puppeteer/chrome/chrome-linux-x64 ]]; then
            cp ${SERVER_PATH}/.cache/puppeteer/chrome/chrome-linux-x64 ${SERVER_PATH}/dist
          fi
        fi`
      ],
      { shell: '/bin/bash' }
    )
  )
}

UI()

// npx gulp --series bundle default
gulp.task('bundle', bundle)
gulp.task(
  'default',
  gulp.series(copyCurrentEnv, buildReact, deployToProduction)
)
