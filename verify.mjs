import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = dirname(fileURLToPath(import.meta.url));
const dist = resolve(siteRoot, 'dist');
const args = process.argv.slice(2);
const allowUnpublished = args.includes('--allow-unpublished-downloads');
const checkRemote = args.includes('--check-remote');
const reportArgument = args.indexOf('--report');
const reportPath = resolve(reportArgument < 0 ? resolve(siteRoot, 'verification.json') : args[reportArgument + 1] || 'verification.json');
const checks = [];
const startedAtUtc = new Date().toISOString();
let release;
let releaseData;
let html = '';
let combinedContent = '';
let publishReady = true;

function requireValue(value, message) { if (!value) throw new Error(message); }
async function exists(path) { try { await access(path); return true; } catch { return false; } }
async function json(path) { return JSON.parse(await readFile(path, 'utf8')); }
async function hash(path) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(path)) digest.update(chunk);
  return digest.digest('hex');
}
async function check(name, action) {
  try { checks.push({ name, pass: true, detail: await action() }); }
  catch (error) { checks.push({ name, pass: false, detail: error.message }); }
}
function localPath(url, base = dist) {
  const clean = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  const path = resolve(clean.startsWith('/') ? dist : base, clean.replace(/^\//, ''));
  const rel = relative(dist, path);
  requireValue(rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel), `Reference leaves dist: ${url}`);
  return path;
}
function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) result[match[1].toLowerCase()] = match[2] ?? match[3];
  return result;
}

await check('release_metadata_matches_verified_packages', async () => {
  release = await json(resolve(dist, 'assets/release.json'));
  releaseData = await json(resolve(dist, 'assets/release-data.json'));
  requireValue(release.product === 'DMC Player' && /^\d+\.\d+\.\d+$/.test(release.version), 'Product/version metadata is invalid.');
  requireValue(release.platform?.operatingSystem === 'Windows' && release.platform?.architecture === 'x64', 'The release is not identified as Windows x64.');
  requireValue(releaseData.version === release.version, 'Derived release version is stale.');
  const canonical = resolve(siteRoot, `../Distribution/${release.version}/release.json`);
  if (await exists(canonical)) requireValue(await hash(canonical) === await hash(resolve(dist, 'assets/release.json')), 'Website release.json differs from the verified distribution manifest.');
  requireValue(release.files?.length === 2, 'Installer and portable package metadata are required.');
  const verified = [];
  for (const file of release.files) {
    requireValue(['installer', 'portable'].includes(file.kind) && /^DMC-Player-[\w.-]+\.(exe|zip)$/.test(file.filename), 'Unexpected package name or kind.');
    requireValue(Number.isSafeInteger(file.sizeBytes) && file.sizeBytes > 100_000_000 && /^[a-f\d]{64}$/i.test(file.sha256), `Invalid package size/hash: ${file.filename}`);
    const derived = releaseData.downloads?.[file.kind];
    requireValue(derived && derived.filename === file.filename && derived.sizeBytes === file.sizeBytes && derived.sha256.toLowerCase() === file.sha256.toLowerCase(), `Derived metadata differs for ${file.kind}.`);
    const source = resolve(siteRoot, `../Distribution/${release.version}/${file.filename}`);
    if (await exists(source)) {
      requireValue((await stat(source)).size === file.sizeBytes && await hash(source) === file.sha256.toLowerCase(), `Actual distribution package does not match: ${file.filename}`);
    }
    verified.push({ kind: file.kind, filename: file.filename, sizeBytes: file.sizeBytes, sha256: file.sha256 });
  }
  return verified;
});

await check('download_targets_are_concrete_and_available', async () => {
  requireValue(release && releaseData, 'Release metadata could not be read.');
  const results = [];
  for (const file of release.files) {
    const url = releaseData.downloads?.[file.kind]?.url;
    requireValue(typeof url === 'string' && url.length > 0 && !/(?:example\.(?:com|org)|YOUR_|PLACEHOLDER|localhost|127\.0\.0\.1)/i.test(url), `Missing or placeholder ${file.kind} download URL.`);
    if (/^https:\/\//i.test(url)) {
      const target = new URL(url);
      requireValue(!target.username && !target.password && decodeURIComponent(target.pathname).endsWith(`/${file.filename}`), `External URL must identify the real filename: ${file.kind}`);
      if (target.hostname === 'github.com') {
        const tag = target.pathname.match(/\/releases\/download\/([^/]+)\//)?.[1];
        requireValue(tag === release.version || tag === `v${release.version}`, `GitHub download is not pinned to release ${release.version}.`);
      }
      let remoteStatus = 'not_requested';
      if (checkRemote) {
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15_000) });
        requireValue(response.ok, `Download HEAD returned HTTP ${response.status}: ${file.kind}`);
        const length = response.headers.get('content-length');
        if (length !== null) requireValue(Number(length) === file.sizeBytes, `Remote size differs for ${file.kind}.`);
        remoteStatus = response.status;
      }
      results.push({ kind: file.kind, url, remoteStatus, remoteHashVerified: false });
    } else {
      requireValue(/^(?:\.\/)?downloads\//.test(url), `Download URLs must be relative to the project website: ${url}`);
      const target = localPath(url);
      if (!await exists(target)) {
        publishReady = false;
        requireValue(allowUnpublished, `Download is missing: ${url}. Include verified downloads or set a real HTTPS download base before publishing.`);
        results.push({ kind: file.kind, url, ready: false, designOnly: true });
      } else {
        requireValue((await stat(target)).size === file.sizeBytes && await hash(target) === file.sha256.toLowerCase(), `Hosted package bytes differ: ${file.filename}`);
        results.push({ kind: file.kind, url, ready: true, sha256Verified: true });
      }
    }
  }
  return results;
});

await check('html_has_basic_accessible_document_structure', async () => {
  html = await readFile(resolve(dist, 'index.html'), 'utf8');
  requireValue(/<!doctype html>/i.test(html) && /<html\b[^>]*lang=["']en(?:-[\w]+)?["']/i.test(html), 'HTML5 document and English language declaration are required.');
  requireValue(/<title>[^<]*DMC Player[^<]*<\/title>/i.test(html), 'The page title must identify DMC Player.');
  requireValue(/<meta\b[^>]*name=["']viewport["']/i.test(html), 'Responsive viewport metadata is missing.');
  requireValue((html.match(/<h1(?:\s|>)/gi) || []).length === 1 && /<main(?:\s|>)/i.test(html), 'The page needs one primary heading and a main landmark.');
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  requireValue(new Set(ids).size === ids.length, 'Duplicate element IDs were found.');
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) requireValue('alt' in attributes(tag), 'An image is missing alternative text.');
  return { uniqueIds: ids.length, mainHeadingCount: 1 };
});

await check('local_assets_and_fragment_links_exist', async () => {
  requireValue(html, 'index.html could not be read.');
  const visited = new Set();
  for (const tag of html.match(/<(?:a|link|script|img|source)\b[^>]*>/gi) || []) {
    const attrs = attributes(tag);
    const url = attrs.src ?? attrs.href;
    if (!url || /^(?:https?:|data:)/i.test(url)) continue;
    requireValue(!/^(?:javascript:|mailto:|tel:|\/)/i.test(url), `Unsupported, root-relative, or unprovided contact/link: ${url}`);
    if (url.startsWith('#')) {
      requireValue(url.length > 1 && new RegExp(`\\bid=["']${url.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html), `Broken fragment link: ${url}`);
      continue;
    }
    const target = localPath(url);
    if (allowUnpublished && /^(?:\.\/)?downloads\//.test(url) && !await exists(target)) continue;
    requireValue(await exists(target), `Missing local asset: ${url}`);
    visited.add(target);
  }
  const textFiles = [...visited].filter(path => ['.js', '.css'].includes(extname(path)));
  combinedContent = html + '\n' + (await Promise.all(textFiles.map(path => readFile(path, 'utf8')))).join('\n');
  for (const css of textFiles.filter(path => extname(path) === '.css')) {
    const content = await readFile(css, 'utf8');
    for (const match of content.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)) {
      if (/^(?:https?:|data:|#)/i.test(match[1])) continue;
      requireValue(await exists(localPath(match[1], dirname(css))), `Missing CSS asset: ${match[1]}`);
    }
  }
  return { localAssets: visited.size };
});

await check('faq_and_source_documentation_match_release', async () => {
  requireValue(release, 'Release metadata could not be read.');
  const results = [];
  for (const [filename, asset] of [['FAQ.md', 'faq.md'], ['TV-sources.md', 'tv-sources.md']]) {
    const target = resolve(dist, 'assets', asset);
    const entry = release.documentation?.find(file => file.filename === `docs/${filename}`);
    requireValue(entry, `Release metadata lacks ${filename}.`);
    requireValue((await stat(target)).size === entry.sizeBytes && await hash(target) === entry.sha256.toLowerCase(), `Website documentation is stale: ${filename}`);
    combinedContent += '\n' + await readFile(target, 'utf8');
    results.push({ filename, sha256: entry.sha256 });
  }
  const faq = await json(resolve(dist, 'assets/faq.json'));
  requireValue(Array.isArray(faq) ? faq.length > 0 : Object.keys(faq).length > 0, 'FAQ data is empty.');
  return results;
});

await check('screenshots_match_prepared_asset_hashes', async () => {
  requireValue(releaseData?.screenshots?.length > 0, 'Prepared screenshot metadata is missing.');
  const results = [];
  for (const image of releaseData.screenshots) {
    const target = localPath(image.url);
    const bytes = await readFile(target);
    requireValue(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `Screenshot is not a PNG: ${image.filename}`);
    requireValue(bytes.readUInt32BE(16) === image.width && bytes.readUInt32BE(20) === image.height, `Screenshot dimensions differ: ${image.filename}`);
    requireValue(bytes.length === image.sizeBytes && await hash(target) === image.sha256.toLowerCase(), `Screenshot bytes differ: ${image.filename}`);
    requireValue(typeof image.alt === 'string' && image.alt.trim().length > 0, `Screenshot description is missing: ${image.filename}`);
    results.push({ filename: image.filename, width: image.width, height: image.height, sha256: image.sha256 });
  }
  return results;
});

await check('published_claims_preserve_known_limits', async () => {
  requireValue(release?.streamingCatalogue?.protectedProgrammePlaybackVerified === false, 'Protected website playback must remain marked unverified.');
  requireValue(release.watchTogether?.maximumFreeSessionMinutes === 60 && release.watchTogether?.serviceAvailabilityGuaranteed === false, 'Free relay limits are missing.');
  requireValue(release.queue?.normalOpensAddItems === false && release.queue?.automaticWatchHistory === false && release.queue?.explicitAddRequired === true, 'Manual queue/no-history semantics are missing.');
  requireValue(release.files.find(file => file.kind === 'installer')?.signed === false, 'Installer signature status is incorrect.');
  requireValue(/60(?:[\s-]+minute|\s*minutes|\s*min)/i.test(combinedContent), 'The user-facing content omits the free relay session limit.');
  requireValue(/unsigned|not (?:code[- ]?)?signed/i.test(combinedContent), 'The user-facing content omits the unsigned build status.');
  requireValue(!/(?:works with|supports|plays) (?:absolutely )?(?:every|all) (?:streaming|paid|protected) (?:service|website)/i.test(combinedContent), 'The site overstates streaming website compatibility.');
  requireValue(!/trusted by\s+[\d,]+|\b[45]\.\d\s*(?:\/\s*5|stars)|lorem ipsum|support@|mailto:/i.test(html), 'Unprovided social proof, support contact, or placeholder copy was found.');
  return { protectedProgrammePlaybackVerified: false, freeRelayMinutes: 60, automaticWatchHistory: false, installerSigned: false, note: 'Structural/text checks; browser review is still required for layout and interaction.' };
});

const passed = checks.every(item => item.pass);
const report = { pass: passed, publishReady: passed && publishReady, startedAtUtc, finishedAtUtc: new Date().toISOString(), version: release?.version ?? null, checks, scope: 'Local static files, canonical release bytes when available, and optional remote HEAD checks. No browser execution, provider sign-in, installation, or hosting changes.' };
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`Website checks: ${checks.filter(item => item.pass).length}/${checks.length} pass; publish-ready=${report.publishReady}.`);
for (const item of checks.filter(item => !item.pass)) console.error(`${item.name}: ${item.detail}`);
process.exitCode = passed ? 0 : 1;
