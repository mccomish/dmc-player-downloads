#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir, readFile, realpath, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(websiteRoot, '..');
const options = { version: '2.10.3', includeDownloads: false, downloadBase: './downloads' };
for (let index = 2; index < process.argv.length; index++) {
  const argument = process.argv[index];
  if (argument === '--include-downloads') options.includeDownloads = true;
  else if (argument === '--version' || argument === '--download-base') {
    const value = process.argv[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}.`);
    options[argument === '--version' ? 'version' : 'downloadBase'] = value;
  } else if (argument === '--help') {
    console.log('Usage: node website/scripts/prepare-release.mjs [--version 2.10.3] [--include-downloads] [--download-base ./downloads|https://host/path]');
    process.exit(0);
  } else throw new Error(`Unknown argument: ${argument}`);
}
if (!/^\d+\.\d+\.\d+$/.test(options.version)) throw new Error('Version must have the form major.minor.patch.');
const downloadBase = normalizeDownloadBase(options.downloadBase);
if (options.includeDownloads && downloadBase !== './downloads')
  throw new Error('--include-downloads requires the local ./downloads URL. Use metadata-only preparation for an external download host.');

const releaseRoot = await realpath(path.join(repositoryRoot, 'Distribution', options.version));
const checksumBytes = await readFile(path.join(releaseRoot, 'sha256SUMS.txt'));
const checksums = parseChecksums(checksumBytes.toString('utf8'));
const verified = new Map();
// Verify every listed source, including both large downloads and the release
// manifest, before changing the website output. No network or installs occur.
for (const [filename, expected] of checksums) {
  const source = await sourcePath(filename);
  const integrity = await hashFile(source);
  if (integrity.sha256 !== expected) throw new Error(`Source checksum mismatch: ${filename}`);
  verified.set(filename, { source, ...integrity });
}
if (!verified.has('release.json') || !verified.has('README.md')) throw new Error('Release checksum list is missing the manifest or README.');
const release = JSON.parse(await readFile(verified.get('release.json').source, 'utf8'));
if (release.schemaVersion !== 1 || release.product !== 'DMC Player' || release.version !== options.version)
  throw new Error('The release manifest does not match the requested DMC Player release.');
if (release.platform?.operatingSystem !== 'Windows' || release.platform?.architecture !== 'x64')
  throw new Error('This website preparation expects the Windows x64 release.');
for (const collection of ['files', 'assets', 'documentation']) {
  if (!Array.isArray(release[collection])) throw new Error(`The manifest has no ${collection} array.`);
  for (const item of release[collection]) {
    const actual = verified.get(item.filename);
    if (!actual || actual.sizeBytes !== item.sizeBytes || actual.sha256 !== item.sha256?.toLowerCase())
      throw new Error(`Manifest metadata does not match its verified source: ${item.filename}`);
  }
}
if (release.files.filter(item => item.kind === 'installer').length !== 1 || release.files.filter(item => item.kind === 'portable').length !== 1)
  throw new Error('The release must contain exactly one installer and one portable download.');
if (release.files.some(item => path.basename(item.filename) !== item.filename || item.filename.includes('\\')))
  throw new Error('Download filenames must not contain directories.');

const sourceFaq = await readFile(verifiedDocument('faq').source);
const canonicalFaq = await readFile(path.join(repositoryRoot, 'docs', 'FAQ.md'));
if (!sourceFaq.equals(canonicalFaq)) throw new Error('The canonical FAQ differs from the packaged release FAQ. Prepare a consistent release before publishing.');
const faq = parseFaq(sourceFaq.toString('utf8'));
const brandNames = new Map([
  ['assets/DMC-Player-Logo.svg', 'dmc-logo.svg'],
  ['assets/DMC-Player-Mark.svg', 'dmc-mark.svg'],
  ['assets/DMC-Player-Icon.png', 'dmc-icon.png'],
]);
const assetCopies = [];
for (const [filename, destination] of brandNames) {
  const item = verified.get(filename);
  if (!item) throw new Error(`Missing official brand asset: ${filename}`);
  assetCopies.push({ destination, bytes: await verifiedBytes(item) });
}
const screenshots = [];
for (const [filename, alt] of [
  ['dmc-player.png', 'DMC Player main window with file and stream playback controls.'],
  ['dmc-live-tv.png', 'DMC Player direct live TV channels with search, favourites and optional playlist import.'],
  ['dmc-player-queue.png', 'DMC Player with an explicitly chosen play queue.'],
  ['dmc-playlist-library.png', 'DMC Player playlist library with saved sources, search, groups, favourites and playback controls, using sample entries.'],
]) {
  const bytes = await readFile(path.join(repositoryRoot, 'artifacts', filename));
  const dimensions = pngDimensions(bytes);
  if (bytes.length > 500_000) throw new Error(`Screenshot exceeds the 500 KB site asset budget: ${filename}`);
  assetCopies.push({ destination: filename, bytes });
  screenshots.push({ filename, url: `./assets/${filename}`, alt, ...dimensions, sizeBytes: bytes.length, sha256: digest(bytes) });
}

const files = release.files.map(item => ({
  ...item,
  url: `${downloadBase}/${encodeURIComponent(item.filename)}`,
  sizeMiB: Math.round(item.sizeBytes / 1024 / 1024 * 10) / 10,
  sizeLabel: `${(item.sizeBytes / 1_000_000).toFixed(1)} MB`,
}));
const outputRoot = path.join(websiteRoot, 'dist');
const assetsRoot = path.join(outputRoot, 'assets');
await mkdir(assetsRoot, { recursive: true });
if (options.includeDownloads) {
  const downloadsRoot = path.join(outputRoot, 'downloads');
  await mkdir(downloadsRoot, { recursive: true });
  for (const item of release.files) {
    // Only a plain filename may become a public download path.
    if (path.basename(item.filename) !== item.filename || item.filename.includes('\\')) throw new Error('Download filename must not contain directories.');
    const target = path.join(downloadsRoot, item.filename);
    const temporary = `${target}.${process.pid}.tmp`;
    try {
      await copyFile(verified.get(item.filename).source, temporary);
      const copy = await hashFile(temporary);
      if (copy.sha256 !== item.sha256 || copy.sizeBytes !== item.sizeBytes) throw new Error(`Copied download failed verification: ${item.filename}`);
      await rename(temporary, target);
    } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  }
}
const data = {
  schemaVersion: 1,
  product: release.product,
  version: release.version,
  preparedAtUtc: release.preparedAtUtc,
  generatedAtUtc: new Date().toISOString(),
  platform: release.platform,
  files,
  downloads: Object.fromEntries(files.map(item => [item.kind, item])),
  downloadsIncluded: options.includeDownloads,
  brand: { logo: './assets/dmc-logo.svg', mark: './assets/dmc-mark.svg', icon: './assets/dmc-icon.png' },
  screenshots,
  faqUrl: './assets/faq.json',
  faqMarkdownUrl: './assets/faq.md',
  tvSourcesUrl: './assets/tv-sources.md',
  runtimes: release.runtimes,
  fileAssociations: release.fileAssociations,
  startup: release.startup,
  viewModes: release.viewModes,
  queue: release.queue,
  playlistLibrary: release.playlistLibrary,
  streamingCatalogue: release.streamingCatalogue,
  liveTv: release.liveTv,
  addons: release.addons,
  updates: release.updates,
  watchTogether: release.watchTogether,
  verification: {
    ...release.verification,
    sourceFilesVerified: verified.size,
    releaseManifestSha256: verified.get('release.json').sha256,
    checksumFileSha256: digest(checksumBytes),
  },
};
for (const { destination, bytes } of assetCopies) await atomicWrite(path.join(assetsRoot, destination), bytes);
await atomicWrite(path.join(assetsRoot, 'release.json'), await verifiedBytes(verified.get('release.json')));
await atomicWrite(path.join(assetsRoot, 'faq.md'), sourceFaq);
await atomicWrite(path.join(assetsRoot, 'tv-sources.md'), await verifiedBytes(verifiedDocument('tvSources')));
await atomicWrite(path.join(assetsRoot, 'faq.json'), `${JSON.stringify(faq, null, 2)}\n`);
await atomicWrite(path.join(assetsRoot, 'release-data.json'), `${JSON.stringify(data, null, 2)}\n`);
const installer = data.downloads.installer;
const officialBase = `https://github.com/mccomish/dmc-player-downloads/releases/download/v${release.version}`;
const updateManifest = {
  schemaVersion: 1, product: release.product, version: release.version,
  releaseUrl: `https://github.com/mccomish/dmc-player-downloads/releases/tag/v${release.version}`,
  installer: { url: `${officialBase}/${installer.filename}`, filename: installer.filename, sizeBytes: installer.sizeBytes, sha256: installer.sha256 },
};
await atomicWrite(path.join(websiteRoot, 'dist', 'update.json'), `${JSON.stringify(updateManifest, null, 2)}\n`);
console.log(`Prepared DMC Player ${release.version}: ${verified.size} source hashes verified; ${screenshots.length} lossless screenshots; ${faq.entries.length} FAQ entries; downloads ${options.includeDownloads ? 'copied and reverified' : 'excluded (use --include-downloads to bundle)'}.`);

function normalizeDownloadBase(value) {
  if (value.startsWith('./') && !/[?#\\\s]/.test(value) && !value.split('/').slice(1).some(part => part === '..' || part === '.')) return value.replace(/\/+$/, '');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Download base must be a ./relative path or an HTTPS URL without credentials, query or fragment.');
  return url.href.replace(/\/+$/, '');
}
function parseChecksums(text) {
  const result = new Map();
  for (const line of text.split(/\r?\n/).filter(line => line.trim())) {
    const match = /^([a-fA-F0-9]{64}) {2}(.+)$/.exec(line);
    if (!match || result.has(match[2])) throw new Error('Malformed or duplicate release checksum entry.');
    result.set(match[2], match[1].toLowerCase());
  }
  if (!result.size) throw new Error('The release checksum file is empty.');
  return result;
}
async function sourcePath(filename) {
  if (typeof filename !== 'string' || !filename || filename.includes('\\') || /[\x00-\x1f]/.test(filename) || path.isAbsolute(filename) || filename.split('/').some(part => part === '.' || part === '..' || !part))
    throw new Error(`Unsafe source filename: ${filename}`);
  const source = await realpath(path.join(releaseRoot, ...filename.split('/')));
  const relative = path.relative(releaseRoot, source);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !(await stat(source)).isFile()) throw new Error(`Source escapes its release directory: ${filename}`);
  return source;
}
async function hashFile(filename) {
  const hash = createHash('sha256'); let sizeBytes = 0;
  for await (const chunk of createReadStream(filename)) { hash.update(chunk); sizeBytes += chunk.length; }
  return { sha256: hash.digest('hex'), sizeBytes };
}
function digest(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
async function verifiedBytes(item) {
  const bytes = await readFile(item.source);
  if (bytes.length !== item.sizeBytes || digest(bytes) !== item.sha256) throw new Error('A verified release source changed during preparation.');
  return bytes;
}
function verifiedDocument(kind) {
  const item = release.documentation.find(document => document.kind === kind);
  if (!item || !verified.has(item.filename)) throw new Error(`The release has no verified ${kind} document.`);
  return verified.get(item.filename);
}
function pngDimensions(bytes) {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error('A screenshot is not a valid PNG.');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (width < 200 || height < 200 || width > 4000 || height > 4000) throw new Error('Screenshot dimensions are outside the expected app-render range.');
  return { width, height };
}
function parseFaq(markdown) {
  const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const title = /^# (.+)$/m.exec(normalized)?.[1];
  const entries = [...normalized.matchAll(/^## (.+)\n\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)]
    .map(match => ({ question: match[1].trim(), answer: match[2].trim() }));
  if (title !== 'DMC Player FAQ' || entries.length < 10 || entries.some(entry => !entry.answer)) throw new Error('The canonical FAQ could not be parsed into complete questions and answers.');
  return { title, entries };
}
async function atomicWrite(filename, content) {
  const temporary = `${filename}.${process.pid}.tmp`;
  try { await writeFile(temporary, content); await rename(temporary, filename); }
  finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
}
