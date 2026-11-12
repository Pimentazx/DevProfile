const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const envPath = path.resolve(__dirname, '..', '.env.test');
let envFile;
try {
  envFile = readFileSync(envPath, 'utf8');
} catch {
  console.error('Crie backend/.env.test usando backend/.env.test.example.');
  process.exit(1);
}

for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (!match) continue;

  const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
  process.env[match[1]] = value;
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  console.error('TEST_DATABASE_URL precisa estar definida em backend/.env.test.');
  process.exit(1);
}

const databaseUrl = new URL(testDatabaseUrl);
if (
  decodeURIComponent(databaseUrl.pathname.slice(1)) !== 'devprofile_test' ||
  !['localhost', '127.0.0.1', '::1'].includes(databaseUrl.hostname)
) {
  console.error(
    'TEST_DATABASE_URL deve apontar para devprofile_test em localhost; migrations foram canceladas.',
  );
  process.exit(1);
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'local-e2e-only-secret';

const prismaCli = path.resolve(__dirname, '../node_modules/prisma/build/index.js');
const migration = spawnSync(
  process.execPath,
  [prismaCli, 'migrate', 'deploy', '--config', './test/prisma-e2e.config.ts'],
  { stdio: 'inherit', env: process.env },
);

if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status || 1);

const jestCli = require.resolve('jest/bin/jest');
const tests = spawnSync(
  process.execPath,
  ['--experimental-vm-modules', jestCli, '--config', './test/jest-e2e.json'],
  { stdio: 'inherit', env: process.env },
);

if (tests.error) throw tests.error;
process.exit(tests.status || 0);
