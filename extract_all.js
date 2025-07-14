#!/usr/bin/env node
/**
 * Improved extractor for FULL_PROJECT_CODE.md that is tolerant of variations in
 * code-fence syntax.
 *
 * Strategy:
 * 1. Stream through the markdown file line-by-line.
 * 2. When we encounter a heading line that looks like `### File: `path`` we
 *    record the path.
 * 3. The next line that starts with triple backticks (```), we treat as the
 *    beginning of a code fence. We capture everything until the matching
 *    closing backticks (```), respecting that the fence may be immediately
 *    followed by a language identifier (e.g. ```ts, ```tsx).
 * 4. Write the captured code to the target file path, creating directories as
 *    necessary.
 */

const fs = require('fs');
const path = require('path');

const SRC_MD = path.join(__dirname, 'FULL_PROJECT_CODE.md');
if (!fs.existsSync(SRC_MD)) {
  console.error('FULL_PROJECT_CODE.md not found');
  process.exit(1);
}

const lines = fs.readFileSync(SRC_MD, 'utf8').split(/\r?\n/);

let currentFile = null;
let collecting = false;
let buffer = [];
let created = 0;

function flush() {
  if (!currentFile) return;
  const content = buffer.join('\n');
  const targetPath = path.join(__dirname, currentFile);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Wrote', currentFile);
  created += 1;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect heading
  const fileMatch = line.match(/^###\s+File:\s+`([^`]+)`/);
  if (fileMatch) {
    // If we were collecting previous file, flush it
    if (collecting) {
      flush();
      buffer = [];
      collecting = false;
    }
    currentFile = fileMatch[1].trim();
    continue;
  }

  // Detect start of code fence when we have a currentFile but not collecting yet
  if (currentFile && !collecting && line.startsWith('```')) {
    collecting = true;
    // skip this line (fence), don't include language identifier
    continue;
  }

  // Detect end of code fence
  if (collecting && line.startsWith('```')) {
    // end of current file
    collecting = false;
    flush();
    buffer = [];
    currentFile = null;
    continue;
  }

  // Collect code lines
  if (collecting) {
    buffer.push(line);
  }
}

console.log(`\nExtraction complete. ${created} file(s) written.`);
