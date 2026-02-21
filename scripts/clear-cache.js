import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const projectDir = '/vercel/share/v0-project';

// Check middleware.ts does NOT exist
const middlewarePath = join(projectDir, 'middleware.ts');
const proxyPath = join(projectDir, 'proxy.ts');

console.log('middleware.ts exists:', existsSync(middlewarePath));
console.log('proxy.ts exists:', existsSync(proxyPath));

// Clear .next cache
const nextDir = join(projectDir, '.next');
if (existsSync(nextDir)) {
  console.log('Clearing .next directory...');
  rmSync(nextDir, { recursive: true, force: true });
  console.log('.next directory cleared successfully');
} else {
  console.log('.next directory does not exist');
}

// Also clear turbopack cache if it exists
const turboDir = join(projectDir, '.turbo');
if (existsSync(turboDir)) {
  console.log('Clearing .turbo directory...');
  rmSync(turboDir, { recursive: true, force: true });
  console.log('.turbo directory cleared successfully');
} else {
  console.log('.turbo directory does not exist');
}

console.log('Cache clear complete');
