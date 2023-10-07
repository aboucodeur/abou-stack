const fs = require('node:fs'),
  path = require('node:path'),
  prompts = require('prompts'),
  args = require('minimist')(process.argv.slice(2))

const argProjectName = args['_'][0]

// recursive copy file and directory to destination
function copyRecursive(source, destination) {
  const files = fs.readdirSync(source)

  files.forEach((file) => {
    const sourcePath = path.join(source, file)
    const destinationPath = path.join(destination, file)
    const stats = fs.statSync(sourcePath)

    if (stats.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath)
    } else if (stats.isDirectory() && file !== 'node_modules') {
      fs.mkdirSync(destinationPath)
      copyRecursive(sourcePath, destinationPath)
    }
  })
}
// copy source package to destination
function sourceDestination(name = '', conf = { package: null, out: null }) {
  if (name && conf.package && conf.out) {
    const sourcePath = path.join(conf.package, name)
    const destinationPath = path.join(conf.out)
    copyRecursive(sourcePath, destinationPath)
  }
}

async function generateProject() {
  const response = await prompts(
    [
      argProjectName
        ? {}
        : {
            type: 'text',
            name: 'projectName',
            message: 'Enter the project name:'
          },
      {
        type: 'select',
        name: 'projectType',
        message: 'Select type of projetc:',
        choices: [
          { title: 'Fullstack PERN APP', value: 'pern' },
          { title: 'Multi page application', value: 'static' }
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

  // isValidaName
  function isValidName(projectName) {
    if (!projectName) {
      console.error('Project name not defined')
      return false
    }

    const isValid = /^[a-zA-Z0-9-_]+$/.test(projectName)

    if (!isValid) {
      console.error('Invalid project name')
      return false
    }

    return isValid
  }

  // getValidName
  function getValidName(projectName) {
    const isValid = isValidName(projectName)
    if (!isValid) return false
    return projectName === '.' ? '' : projectName
  }

  const { projectType, projectName } = response
  const getName = argProjectName ? argProjectName : projectName

  const checkName = getValidName(getName)
  if (!checkName) {
    console.log('Thanks !')
    process.exit(1)
  }

  const packagePath = path.join(__dirname, 'packages')
  const outputPath = path.join(process.cwd(), getName)

  // create project directory
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath)
  else {
    console.error(`${getName} already exists in directory ${path.dirname(outputPath)}`)
    process.exit(1)
  }

  if (projectType === 'static') {
    sourceDestination(projectType, {
      package: packagePath,
      out: outputPath
    })
  } else if (response.projectType === 'pern') {
    fs.mkdirSync(path.join(outputPath, 'frontend'))
    fs.mkdirSync(path.join(outputPath, 'backend'))

    // recursive copy
    fs.readdirSync(packagePath)
      .filter((pack) => pack === 'backend' || pack === 'frontend')
      .forEach((source) => {
        console.log(source)
        copyRecursive(
          path.join(packagePath, source),
          path.join(outputPath, source)
        )
      })
  }

  console.log(`Project ${getName} created successfully at ${outputPath}`)
  console.log(`cd ${getName}`)
  console.log(`Change world !`)
}

generateProject()
