#!/usr/bin/env node
import { readFile, mkdir, access, mkdtemp, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: node scripts/release.mjs [--json]\nBuild an allowlisted Chrome Web Store ZIP in dist/. Does not publish.');
  process.exit(0);
}
if (args.some(arg => arg !== '--json')) { console.error('Unknown argument. Use --help.'); process.exit(1); }
try {
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  if (manifest.manifest_version !== 3) throw new Error('Manifest V3 is required.');
  if (manifest.permissions?.length || manifest.host_permissions?.length) throw new Error('Review new permissions before releasing.');
  const files = [...new Set(['manifest.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'PRIVACY_POLICY.md',
    ...Object.values(manifest.icons), ...manifest.content_scripts.flatMap(script => [...script.js, ...script.css])])].sort();
  for (const file of files) {
    if (path.isAbsolute(file) || file.split('/').includes('..')) throw new Error(`Unsafe path: ${file}`);
    await access(path.join(root, file));
    if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', file], { cwd: root });
  }
  await mkdir(path.join(root, 'dist'), { recursive: true });
  const output = path.join(root, 'dist', `ultrasignup-race-visualizer-${manifest.version}.zip`);
  // Always create a fresh archive; stale entries can never survive a prior build.
  const temporary = await mkdtemp(path.join(root, 'dist', '.release-'));
  try {
    const archive = path.join(temporary, 'candidate.zip');
    execFileSync('zip', ['-q', '-X', archive, ...files], { cwd: root });
    await rename(archive, output);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
  const result = { version: manifest.version, output, files };
  console.log(args.includes('--json') ? JSON.stringify(result) : `Built ${output}\n${files.length} runtime and disclosure files; no publishing performed.`);
} catch (error) { console.error(error.message); process.exit(1); }
