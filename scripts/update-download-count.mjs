import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadDownloadCount } from '../dist/download-count.mjs';

const output = new URL('../dist/assets/download-count.json', import.meta.url);
const temporary = new URL('../dist/assets/download-count.json.tmp', import.meta.url);
try {
  const snapshot = await loadDownloadCount();
  await mkdir(new URL('../dist/assets/', import.meta.url), { recursive: true });
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  await rename(temporary, output);
  console.log(`Download snapshot refreshed: ${snapshot.total.toLocaleString('en-GB')} downloads across ${snapshot.packageCount} packages in ${snapshot.releaseCount} releases.`);
  console.log(fileURLToPath(output));
} catch (error) {
  await rm(temporary, { force: true });
  console.error(`Download snapshot was not changed: ${error.message}`);
  process.exitCode = 1;
}
