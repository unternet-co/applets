/**
 * Bumps the version of web applets.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Get all subdirectories from a directory
function getSubdirectories(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

// Main function
async function main() {
  const srcDir = path.join(process.cwd(), 'src');

  try {
    const subdirs = getSubdirectories(srcDir);

    await Promise.all(
      subdirs.map(async (subdir) => {
        const targetDir = path.join(process.cwd(), 'src', subdir);
        await execAsync('npm uninstall @web-applets/sdk', { cwd: targetDir });
        await execAsync('npm install @web-applets/sdk', { cwd: targetDir });
      })
    );

    console.log(`Done! Total applets bumped: ${subdirs.length}`);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
