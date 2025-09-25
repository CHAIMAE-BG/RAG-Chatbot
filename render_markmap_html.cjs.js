
const { execSync } = require('child_process');
const fs = require('fs');

const mdFile = process.argv[2];
const outputFile = process.argv[3];

if (!mdFile || !outputFile) {
  console.error('Usage: node render_markmap_html.js <markdown-file> <output-html-file>');
  process.exit(1);
}

try {
  // Ensure markmap-cli is installed globally: npm install -g markmap-cli
  // The --no-open flag prevents the browser from opening automatically.
  execSync(`markmap "${mdFile}" -o "${outputFile}" --no-open`);
} catch (error) {
  console.error('Error generating Markmap HTML. Is markmap-cli installed globally (npm install -g markmap-cli)?');
  console.error(error.stderr ? error.stderr.toString() : error.message);
  process.exit(1);
}
