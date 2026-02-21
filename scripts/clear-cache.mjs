import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const projectRoot = join(import.meta.dirname, '..');

// Check and remove .next cache
const nextDir = join(projectRoot, '.next');
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('Cleared .next cache directory');
} else {
  console.log('.next directory does not exist');
}

// Confirm middleware.ts does NOT exist
const middlewarePath = join(projectRoot, 'middleware.ts');
if (existsSync(middlewarePath)) {
  rmSync(middlewarePath);
  console.log('Deleted stale middleware.ts');
} else {
  console.log('middleware.ts confirmed deleted');
}

// Confirm proxy.ts exists
const proxyPath = join(projectRoot, 'proxy.ts');
if (existsSync(proxyPath)) {
  console.log('proxy.ts exists - correct');
} else {
  console.log('WARNING: proxy.ts is missing!');
}
