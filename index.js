const fs = require('fs'),
 path = require('path'),
 prompts = require('prompts'),
 args = require('minimist')(process.argv.slice(2));

 const userAppName = args['_'][0]


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

function sourceDestination(name = '', conf = { package: null, out: null }) {
  if (name && conf.package && conf.out) {
    const sourcePath = path.join(conf.package, name)
    const destinationPath = path.join(conf.out)
    copyRecursive(sourcePath, destinationPath)
  }
}

async function generateProject() {
  const response = await prompts([
    userAppName ? {} : {
      type: 'text',
      name: 'projectName',
      message: 'Enter the project name:'
    },
    {
      type: 'select',
      name: 'projectType',
      message: 'Select type of projetc:',
      choices: [
        { title: 'Fullstack SPA', value: 'spa' },
        { title: 'Multi page application', value: 'static' },
      ]
    }
  ])

  // source and output path
  const getName = userAppName ? userAppName : response.projectName
  const packagePath = path.join(__dirname, 'packages') // like my starter
  const outputPath = path.join(process.cwd(), getName) // like your computer

  fs.mkdirSync(outputPath)
  const { projectType } = response

  if (projectType === 'static') {
    sourceDestination(projectType, {
      package: packagePath,
      out: outputPath
    })
  } else if (response.projectType === 'spa') {
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

  console.log(
    `Project ${getName} created successfully at ${outputPath}`
  )
  console.log(`cd ${outputPath}`)
  console.log(`Change world !`)
}

generateProject()
