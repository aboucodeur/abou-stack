const fs = require('node:fs'),
  path = require('node:path'),
  cp = require('node:child_process'),
  prompts = require('prompts'),
  args = require('minimist')(process.argv.slice(2))

const argProjectName = args['_'][0]

function copyRecursive(source, destination) {
  const files = fs.readdirSync(source)

  files.forEach((file) => {
    const sourcePath = path.join(source, file)
    const destinationPath = path.join(destination, file)

    const stats = fs.statSync(sourcePath)
    const isFile = stats.isFile()
    const isDir = stats.isDirectory()

    // ! is directory and not (like file)
    if (isFile) fs.copyFileSync(sourcePath, destinationPath)
    else if (isDir && file !== 'node_modules') {
      fs.mkdirSync(destinationPath)
      copyRecursive(sourcePath, destinationPath)
    }
  })
}

/**
 * Copy source package to destination
 * source : (PACKAGE PATH + PROJECT TYPE)
 * destination : (CWD + NAME)
 *
 * @param {string | null} source
 * @param {string | null} des
 * @returns {boolean | void}
 */
function sourceDesPackage(source, des) {
  if (!(source ?? des)) {
    console.error('Package name is not defined !')
    return false
  }
  copyRecursive(source, des)
}

// mode interactive pour la creation de projet
;(async function generateProject() {
  const response = await prompts(
    [
      argProjectName
        ? {}
        : {
            type: 'text',
            name: 'projectName',
            message: 'Enter the project name : '
          },
      {
        type: 'select',
        name: 'projectType',
        message: 'Select type of projetc : ',
        choices: [
          { title: 'PERN STACK', value: 'PERN' },
          { title: 'ASTRO JS', value: 'ASTRO' },
          { title: 'BOOTSTRAP TEMPLATE 1', value: 'TEMPLATE/1' },
          { title: 'LARAVEL PROJECT', value: 'PHP_LARAVEL' }
        ]
      }
    ],
    {
      onCancel: () => {
        console.log('Bye bye !')
        process.exit(1)
        // return true
      }
    }
  )

  function checkProjectName(projectName) {
    if (!projectName) {
      console.error('Project name not defined')
      return false
    }
    const isValid = /^[a-zA-Z0-9-_]+$/.test(projectName)
    if (!isValid) {
      console.error('Invalid project name')
      return false
    }
    return projectName === '.' ? '' : projectName
  }

  const { projectType, projectName } = response
  const getName = argProjectName ?? projectName
  const isValidName = checkProjectName(getName)

  if (!isValidName) {
    console.log('Invalid name bye (*_*) !')
    process.exit(1)
  }

  const rootPath = __dirname
  const packagePath = path.join(__dirname, 'packages', projectType)
  const outputPath = path.join(process.cwd(), getName) // user current working directory

  // create project output directory
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath)
  else {
    console.error(
      `${getName} already exists in directory ${path.dirname(outputPath)}`
    )
    process.exit(1)
  }

  if (projectType === 'PHP_LARAVEL') {
    console.log('ABSTACK> Required composer, NODE, and NPM ...')
    try {
      const composerPHARScript = path.join(rootPath, 'composer.phar')
      const composerProcess = cp.spawnSync(
        `${composerPHARScript}`,
        ['create-project', 'laravel/laravel', projectName],
        { stdio: 'inherit' }
      )
      if (composerProcess.status !== 0) {
        console.error('ABSTACK> Composer command failed!')
      }
    } catch (error) {
      console.error(
        'ABSTACK> Composer not installed or project creation failed!'
      )
    }
  } else {
    // *** copying to output PATH ...
    sourceDesPackage(packagePath, outputPath)
  }

  console.log(
    `ABSTACK> Project ${getName} created successfully at ${outputPath}`
  )
  console.log(`ABSTACK> cd ${getName}`)
  console.log(`ABSTACK> Change the world (made by Aboucodeur) !`)
})()
