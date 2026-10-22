#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
const capabilities = { name: 'ultrasignup-race-visualizer', home: fileURLToPath(new URL('../', import.meta.url)), commands: [
  { command: 'npm --prefix tests test -- --runInBand', description: 'Test shared production logic and content-script updates.', tty: false },
  { command: 'node scripts/release.mjs --json', description: 'Validate and package the extension without publishing.', tty: false },
  { command: 'node scripts/capabilities.mjs --json', description: 'List agent-callable project commands.', tty: false }
] };
console.log(JSON.stringify(capabilities));
