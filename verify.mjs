import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = dirname(fileURLToPath(import.meta.url));
const dist = resolve(siteRoot, 'dist');
const args = process.argv.slice(2);
const allowUnpublished = args.includes('--allow-unpublished-downloads');
const checkRemote = args.includes('--check-remote');
const requireUpdateManifest = args.includes('--require-update-manifest');
const requiredPages = ['index.html', 'features.html', 'live-tv.html', 'watch-together.html', 'download.html', 'help.html', 'about.html'];
const reportArgument = args.indexOf('--report');
const reportPath = resolve(reportArgument < 0 ? resolve(siteRoot, 'reports/verification.json') : args[reportArgument + 1] || 'reports/verification.json');
const checks = [];
const startedAtUtc = new Date().toISOString();
let release;
let releaseData;
let html = '';
const pages = new Map();
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
function decodeEntities(value) {
  return value.replace(/&(?:amp|#38|#x26);/gi, '&').replace(/&quot;/gi, '"').replace(/&apos;|&#39;/gi, "'").replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([a-f\d]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)));
}
function visibleText(document) {
  return decodeEntities(document.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}
function reference(url, base) {
  const decoded = decodeEntities(url);
  requireValue(!/^(?:javascript:|mailto:|tel:|\/)/i.test(decoded), `Unsupported, root-relative, or unprovided contact/link: ${url}`);
  const [resource, fragment] = decoded.split('#', 2);
  return { target: resource ? localPath(resource, base) : base, fragment: fragment === undefined ? undefined : decodeURIComponent(fragment) };
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

await check('all_pages_have_accessible_document_structure', async () => {
  const filenames = (await readdir(dist)).filter(filename => extname(filename) === '.html');
  for (const filename of requiredPages) requireValue(filenames.includes(filename), `The requested page is missing: ${filename}`);
  const titles = new Set();
  const results = [];
  for (const filename of filenames) {
    const document = await readFile(resolve(dist, filename), 'utf8');
    const title = document.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    requireValue(/<!doctype html>/i.test(document) && /<html\b[^>]*lang=["']en(?:-[\w]+)?["']/i.test(document), `${filename}: HTML5 document and English language declaration are required.`);
    requireValue(title && title.includes('DMC Player'), `${filename}: page title must identify DMC Player.`);
    requireValue(!titles.has(title), `${filename}: page title duplicates another page.`); titles.add(title);
    const meta = (document.match(/<meta\b[^>]*>/gi) || []).map(attributes);
    requireValue(meta.some(tag => tag.name?.toLowerCase() === 'viewport' && tag.content?.includes('width=device-width')), `${filename}: responsive viewport metadata is missing.`);
    requireValue(meta.some(tag => tag.name?.toLowerCase() === 'description' && tag.content?.trim()), `${filename}: page description is missing.`);
    requireValue((document.match(/<h1(?:\s|>)/gi) || []).length === 1 && (document.match(/<main(?:\s|>)/gi) || []).length === 1, `${filename}: exactly one primary heading and main landmark are required.`);
    const ids = (document.match(/<[a-z][^>]*>/gi) || []).map(attributes).filter(tag => tag.id !== undefined).map(tag => decodeEntities(tag.id));
    requireValue(ids.every(Boolean) && new Set(ids).size === ids.length, `${filename}: empty or duplicate element IDs were found.`);
    for (const tag of document.match(/<img\b[^>]*>/gi) || []) requireValue('alt' in attributes(tag), `${filename}: an image is missing alternative text.`);
    requireValue(/<nav(?:\s|>)/i.test(document), `${filename}: navigation landmark is missing.`);
    const skip = (document.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || []).find(anchor => /skip (?:to )?(?:main )?content/i.test(visibleText(anchor)));
    requireValue(skip && attributes(skip).href?.startsWith('#'), `${filename}: keyboard skip-to-content link is missing.`);
    pages.set(resolve(dist, filename), { filename, document, ids: new Set(ids) });
    results.push({ filename, title, uniqueIds: ids.length, mainHeadingCount: 1 });
  }
  html = pages.get(resolve(dist, 'index.html')).document;
  return results;
});

await check('local_assets_and_fragment_links_exist', async () => {
  requireValue(pages.size >= requiredPages.length, 'All requested HTML pages must be readable before link validation.');
  const visited = new Set();
  let fragments = 0;
  for (const [pagePath, { filename, document }] of pages) {
    const linkedPages = new Set();
    for (const tag of document.match(/<(?:a|link|script|img|source)\b[^>]*>/gi) || []) {
      const attrs = attributes(tag);
      const url = attrs.src ?? attrs.href;
      if (!url || /^(?:https?:|data:)/i.test(url)) continue;
      const ref = reference(url, url.startsWith('#') ? pagePath : dirname(pagePath));
      const target = ref.target;
      if (allowUnpublished && /^(?:\.\/)?downloads\//.test(url) && !await exists(target)) continue;
      requireValue(await exists(target) && (await stat(target)).isFile(), `${filename}: missing local asset or page: ${url}`);
      visited.add(target);
      if (extname(target) === '.html') linkedPages.add(relative(dist, target).replaceAll(sep, '/'));
      if (ref.fragment !== undefined) {
        requireValue(ref.fragment.length > 0 && pages.get(target)?.ids.has(ref.fragment), `${filename}: broken fragment link: ${url}`); fragments++;
      }
    }
    for (const expected of requiredPages) requireValue(linkedPages.has(expected), `${filename}: shared navigation/footer does not link to ${expected}.`);
  }
  const textFiles = [...visited].filter(path => ['.js', '.css'].includes(extname(path)));
  combinedContent = [...pages.values()].map(page => page.document).join('\n') + '\n' + (await Promise.all(textFiles.map(path => readFile(path, 'utf8')))).join('\n');
  for (const css of textFiles.filter(path => extname(path) === '.css')) {
    const content = await readFile(css, 'utf8');
    for (const match of content.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)) {
      if (/^(?:https?:|data:|#)/i.test(match[1])) continue;
      requireValue(await exists(localPath(match[1], dirname(css))), `Missing CSS asset: ${match[1]}`);
    }
  }
  for (const script of textFiles.filter(path => extname(path) === '.js')) {
    execFileSync(process.execPath, ['--check', script], { encoding: 'utf8', stdio: 'pipe' });
    const source = await readFile(script, 'utf8');
    for (const match of source.matchAll(/["'](\.\/assets\/[^"'`\s]+)["']/g))
      requireValue(await exists(localPath(match[1], dirname(script))), `JavaScript references a missing asset: ${match[1]}`);
  }
  return { pages: pages.size, localAssets: visited.size, checkedFragments: fragments, scriptSyntaxChecked: textFiles.filter(path => extname(path) === '.js').length };
});

await check('download_pages_have_working_static_fallbacks', async () => {
  requireValue(releaseData, 'Release data could not be read.');
  const result = [];
  for (const filename of ['index.html', 'download.html']) {
    const document = pages.get(resolve(dist, filename))?.document;
    requireValue(document, `${filename} could not be read.`);
    const anchors = (document.match(/<a\b[^>]*>/gi) || []).map(attributes).filter(tag => tag['data-download']);
    requireValue(anchors.some(tag => tag['data-download'] === 'installer'), `${filename}: a real installer download link is required.`);
    if (filename === 'download.html') requireValue(anchors.some(tag => tag['data-download'] === 'portable'), 'download.html: a portable download link is required.');
    for (const anchor of anchors) {
      const expected = releaseData.downloads[anchor['data-download']];
      requireValue(expected && decodeEntities(anchor.href || '') === expected.url, `${filename}: static ${anchor['data-download']} fallback is stale or invalid.`);
    }
    for (const match of document.matchAll(/<[^>]+data-hash=["']([^"']+)["'][^>]*>([^<]+)</gi))
      requireValue(match[2].trim().toLowerCase() === releaseData.downloads[match[1]]?.sha256.toLowerCase(), `${filename}: static checksum is stale.`);
    result.push({ filename, verifiedLinks: anchors.length });
  }
  return result;
});

await check('free_and_creator_identity_are_visible', async () => {
  for (const filename of ['index.html', 'about.html']) {
    const document = pages.get(resolve(dist, filename))?.document;
    requireValue(document, `${filename} could not be read.`);
    const text = visibleText(document.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] || '');
    requireValue(/\bfree\b/i.test(text) && /Darryl McComish/.test(text), `${filename}: the free product and Darryl McComish attribution must be visible.`);
    requireValue(/\bgamers?\b/i.test(text), `${filename}: the gamer focus is missing.`);
  }
  return { visibleOn: ['index.html', 'about.html'], creator: 'Darryl McComish', free: true };
});

await check('update_manifest_matches_the_verified_installer', async () => {
  const path = resolve(dist, 'update.json');
  if (!await exists(path)) {
    if (requireUpdateManifest) { publishReady = false; throw new Error('The updater-capable release requires dist/update.json.'); }
    return { present: false, required: false, note: 'Use --require-update-manifest when publishing an updater-capable release.' };
  }
  const update = await json(path);
  const installer = releaseData?.downloads?.installer;
  requireValue(update.schemaVersion === 1 && update.product === 'DMC Player' && update.version === release?.version, 'Update manifest product/schema/version differs from the verified release.');
  requireValue(update.releaseUrl === `https://github.com/mccomish/dmc-player-downloads/releases/tag/v${release.version}`, 'Update release notes URL is not pinned to the expected repository/version.');
  requireValue(installer && update.installer?.url === installer.url && update.installer?.filename === installer.filename && update.installer?.sizeBytes === installer.sizeBytes && update.installer?.sha256?.toLowerCase() === installer.sha256.toLowerCase(), 'Update installer URL/name/size/hash differs from the verified download.');
  return { present: true, version: update.version, installer: installer.filename, exactPackageContract: true };
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
  const markdown = (await readFile(resolve(dist, 'assets/faq.md'), 'utf8')).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const expectedEntries = markdown.split(/^## /m).slice(1).map(section => {
    const newline = section.indexOf('\n');
    return { question: section.slice(0, newline).trim(), answer: section.slice(newline + 1).trim() };
  });
  requireValue(faq.title === 'DMC Player FAQ' && expectedEntries.length > 0 && JSON.stringify(faq.entries) === JSON.stringify(expectedEntries), 'The searchable FAQ differs from the verified FAQ document.');
  results.push({ searchableQuestions: expectedEntries.length, matchesVerifiedMarkdown: true });
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
  const publicHtml = [...pages.values()].map(page => page.document).join('\n');
  requireValue(!/trusted by\s+[\d,]+|\b[45]\.\d\s*(?:\/\s*5|stars)|lorem ipsum|support@|mailto:/i.test(publicHtml), 'Unprovided social proof, support contact, or placeholder copy was found.');
  return { protectedProgrammePlaybackVerified: false, freeRelayMinutes: 60, automaticWatchHistory: false, installerSigned: false, note: 'Structural/text checks; browser review is still required for layout and interaction.' };
});

const passed = checks.every(item => item.pass);
const report = { pass: passed, publishReady: passed && publishReady, startedAtUtc, finishedAtUtc: new Date().toISOString(), version: release?.version ?? null, checks, scope: 'Local static files, canonical release bytes when available, and optional remote HEAD checks. No browser execution, provider sign-in, installation, or hosting changes.' };
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`Website checks: ${checks.filter(item => item.pass).length}/${checks.length} pass; publish-ready=${report.publishReady}.`);
for (const item of checks.filter(item => !item.pass)) console.error(`${item.name}: ${item.detail}`);
process.exitCode = passed ? 0 : 1;
