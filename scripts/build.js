const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { copy, emptyDirSync } = require('fs-extra');

const execAsync = promisify(exec);

// Get all subdirectories from a directory
function getSubdirectories(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

// Ensure a directory exists, create if it doesn't
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

// Check if directory has package.json
function hasPackageJson(dir) {
  const packageJsonPath = path.join(dir, 'package.json');
  return fs.existsSync(packageJsonPath);
}

// Build a single applet
async function buildApplet(appletPath, appletName) {
  try {
    process.stdout.write(`Installing dependencies for ${appletName}...`);
    await execAsync('npm install', { cwd: appletPath });
    console.log(`Done!`);
    process.stdout.write(`Building ${appletName}...`);
    await execAsync('npm run build', { cwd: appletPath });
    console.log(`Done!`);
    return true;
  } catch (error) {
    console.error(`\nBuild failed:`, error.message);
    return false;
  }
}

// Process a single applet
async function processApplet(appletName, appletsDir, distDir) {
  const appletPath = path.join(appletsDir, appletName);
  const targetPath = path.join(distDir, appletName);

  if (hasPackageJson(appletPath)) {
    // If there's a package.json, build it and copy the dist folder
    const buildSuccess = await buildApplet(appletPath, appletName);
    if (buildSuccess) {
      const appletDistPath = path.join(appletPath, 'dist');
      await copy(appletDistPath, targetPath);
    }
  } else {
    // If no package.json, copy the entire folder directly
    console.log(`${appletName} appears to be pre-built, copying directly...`);
    await copy(appletPath, targetPath);
  }
}

// Main function
async function main() {
  const srcDir = path.join(process.cwd(), 'src');
  const distDir = path.join(process.cwd(), 'dist');
  emptyDirSync(distDir);

  try {
    // Setup
    ensureDirectory(distDir);
    const subdirs = getSubdirectories(srcDir);

    // Process all applets
    const results = await Promise.all(
      subdirs.map((subdir) => processApplet(subdir, srcDir, distDir))
    );

    // Summary
    const totalApplets = subdirs.length;
    console.log(`Done! Total applets built: ${totalApplets}`);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
