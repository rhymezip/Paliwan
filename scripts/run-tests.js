// Runs the pure-logic unit tests with Node's built-in test runner. sucrase strips
// the TypeScript on the fly, so this works on Node 20 with no build step.
require('sucrase/register/ts');

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'logic', '__tests__');
const files = fs
  .readdirSync(dir)
  .filter((name) => name.endsWith('.test.ts'))
  .sort();

for (const name of files) {
  require(path.join(dir, name));
}
