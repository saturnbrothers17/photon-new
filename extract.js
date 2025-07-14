#!/usr/bin/env node
/**
 * Script to extract individual files from FULL_PROJECT_CODE.md and write them
 * to the local filesystem relative to the script's directory.
 *
 * Usage: `node extract.js`
 * Make sure this script is placed in the same directory as FULL_PROJECT_CODE.md
 */

const fs = require('fs');
const path = require('path');

const SOURCE_MD = path.join(__dirname, 'FULL_PROJECT_CODE.md');

if (!fs.existsSync(SOURCE_MD)) {
  console.error('FULL_PROJECT_CODE.md not found in', __dirname);
  process.exit(1);
}

const mdContent = fs.readFileSync(SOURCE_MD, 'utf8');

// Regular expression to match blocks of the form:
// ### File: `path`
// ```lang
// ...code...
// ```
// The language identifier after the opening backticks is optional.
const fileBlockRegex = /###\s+File:\s+`([^`]+)`[\s\S]*?```[a-zA-Z0-9]*\n([\s\S]*?)```/g;

let match;
let createdFiles = 0;
while ((match = fileBlockRegex.exec(mdContent)) !== null) {
  const relativeFilePath = match[1].trim();
  const fileContent = match[2].replace(/\r?\n$/, ''); // remove trailing newline if present

  const targetPath = path.join(__dirname, relativeFilePath);
  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetPath, fileContent, 'utf8');
  createdFiles += 1;
  console.log(`Wrote ${relativeFilePath}`);
}

console.log(`\nDone. ${createdFiles} files created/updated.`);
