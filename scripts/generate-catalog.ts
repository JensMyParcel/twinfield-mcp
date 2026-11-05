import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { CatalogGenerator } from '../codegen/catalog-generator.js';

const vendor = fileURLToPath(new URL('../vendor/twinfield', import.meta.url));
const target = fileURLToPath(new URL('../src/catalog/soap-catalog.generated.ts', import.meta.url));
const source = new CatalogGenerator(vendor).source();

if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== source) {
    console.error('src/catalog/soap-catalog.generated.ts is stale. Run `npm run generate`.');
    process.exit(1);
  }
} else {
  writeFileSync(target, source);
}
