// index.js
const fs = require("fs");
const path = require("path");
const prompts = require("prompts");

function copyRecursive(source, destination) {
  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);
    const stats = fs.statSync(sourcePath);

    if (stats.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    } else if (stats.isDirectory() && file !== "node_modules") {
      fs.mkdirSync(destinationPath);
      copyRecursive(sourcePath, destinationPath);
    }
  });
}

async function generateProject() {
  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Enter the project name:",
    },
  ]);

  // PATH input or output
  const packagePath = path.join(__dirname, "packages");
  const outputPath = path.join(__dirname, response.projectName);

  fs.mkdirSync(outputPath);
  fs.mkdirSync(path.join(outputPath, "frontend"));
  fs.mkdirSync(path.join(outputPath, "backend"));

  fs.readdirSync(packagePath).forEach((source) => {
    copyRecursive(
      path.join(packagePath, source),
      path.join(outputPath, source)
    );
  });

  console.log(
    `Project ${response.projectName} created successfully at ${outputPath}`
  );
}

generateProject();
