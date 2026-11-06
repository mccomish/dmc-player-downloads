// Public release asset totals. This module never records visitors or download clicks.
export const DOWNLOAD_REPO = 'mccomish/dmc-player-downloads';
export const RELEASES_URL = `https://github.com/${DOWNLOAD_REPO}/releases`;
export const RELEASES_API_URL = `https://api.github.com/repos/${DOWNLOAD_REPO}/releases?per_page=100&page=1`;

const integer = '(?:0|[1-9]\\d*)';
const prereleaseIdentifier = '(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)';
const semver = `${integer}\\.${integer}\\.${integer}(?:-${prereleaseIdentifier}(?:\\.${prereleaseIdentifier})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?`;
const packageName = new RegExp(`^(?:DMC-Player-Setup-${semver}\\.exe|(?:DMC-Player|Sidecar)-${semver}-win-(?:x64|x86|arm64)\\.zip)$`, 'i');
// GitHub's Link header can use this repository's immutable numeric API route.
// Only these two verified routes are allowed; a Link cannot select another repo.
const apiPaths = new Set([`/repos/${DOWNLOAD_REPO}/releases`, '/repositories/1447566970/releases']);

function count(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`Invalid ${name}`);
  return value;
}
function identifier(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new TypeError(`Invalid ${name}`);
  return value;
}
function add(left, right) { return count(left + right, 'aggregate download count'); }
function tag(value) {
  if (typeof value !== 'string' || !value.length || value.length > 200) throw new TypeError('Invalid release tag');
  return value;
}

export function isDownloadPackage(name) {
  return typeof name === 'string' && packageName.test(name);
}

// All pages must be present before a total can be published. Repeated API asset
// IDs count once, even if release pages overlap while a new release is published.
export function aggregateReleasePages(pages) {
  if (!Array.isArray(pages)) throw new TypeError('Invalid release pages');
  const releases = new Map();
  const assets = new Map();
  for (const page of pages) {
    if (!Array.isArray(page)) throw new TypeError('Invalid GitHub releases response');
    for (const release of page) {
      if (!release || typeof release !== 'object' || typeof release.draft !== 'boolean') throw new TypeError('Invalid GitHub release');
      if (release.draft) continue;
      const releaseId = identifier(release.id, 'release ID');
      const releaseTag = tag(release.tag_name);
      if (!Array.isArray(release.assets)) throw new TypeError('Invalid release assets');
      if (releases.has(releaseId) && releases.get(releaseId).tag !== releaseTag) throw new TypeError('Conflicting release ID');
      if (!releases.has(releaseId)) releases.set(releaseId, { releaseId, tag: releaseTag, total: 0, packages: [] });
      for (const asset of release.assets) {
        if (!asset || typeof asset.name !== 'string') throw new TypeError('Invalid release asset');
        if (!isDownloadPackage(asset.name)) continue;
        const id = identifier(asset.id, 'asset ID');
        const downloads = count(asset.download_count, 'asset download count');
        const previous = assets.get(id);
        if (previous) {
          if (previous.name !== asset.name) throw new TypeError('Conflicting asset ID');
          // Counts may increase during pagination; keep the newest high-water mark.
          previous.downloads = Math.max(previous.downloads, downloads);
        } else assets.set(id, { id, name: asset.name, downloads, releaseId });
      }
    }
  }
  let total = 0;
  for (const asset of assets.values()) {
    const release = releases.get(asset.releaseId);
    release.total = add(release.total, asset.downloads);
    release.packages.push({ id: asset.id, name: asset.name, downloads: asset.downloads });
    total = add(total, asset.downloads);
  }
  return { total, releaseCount: releases.size, packageCount: assets.size, breakdown: [...releases.values()] };
}

export function validateSnapshot(value) {
  if (!value || value.schemaVersion !== 1 || value.repo !== DOWNLOAD_REPO) throw new TypeError('Invalid download snapshot');
  const total = count(value.total, 'snapshot total');
  const releaseCount = count(value.releaseCount, 'snapshot release count');
  const packageCount = count(value.packageCount, 'snapshot package count');
  if (typeof value.checkedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value.checkedAt) || !Number.isFinite(Date.parse(value.checkedAt))) throw new TypeError('Invalid checked date');
  const checkedAt = new Date(value.checkedAt).toISOString();
  // Reject normalized impossible dates such as 30 February.
  if (checkedAt.slice(0, 19) !== value.checkedAt.slice(0, 19)) throw new TypeError('Invalid checked date');
  if ((!packageCount && total) || (!releaseCount && packageCount)) throw new TypeError('Inconsistent download snapshot');
  const snapshot = { schemaVersion: 1, total, checkedAt, repo: DOWNLOAD_REPO, releaseCount, packageCount };
  if (value.breakdown !== undefined) {
    if (!Array.isArray(value.breakdown) || value.breakdown.length !== releaseCount) throw new TypeError('Invalid release breakdown');
    const releaseIds = new Set();
    const assetIds = new Set();
    let breakdownTotal = 0;
    snapshot.breakdown = value.breakdown.map(release => {
      if (!release || !Array.isArray(release.packages)) throw new TypeError('Invalid package breakdown');
      const releaseId = identifier(release.releaseId, 'breakdown release ID');
      if (releaseIds.has(releaseId)) throw new TypeError('Duplicate breakdown release ID');
      releaseIds.add(releaseId);
      let releaseTotal = 0;
      const packages = release.packages.map(asset => {
        if (!asset || !isDownloadPackage(asset.name)) throw new TypeError('Invalid breakdown package');
        const id = identifier(asset.id, 'breakdown asset ID');
        if (assetIds.has(id)) throw new TypeError('Duplicate breakdown asset ID');
        assetIds.add(id);
        const downloads = count(asset.downloads, 'breakdown package downloads');
        releaseTotal = add(releaseTotal, downloads);
        return { id, name: asset.name, downloads };
      });
      if (count(release.total, 'breakdown release total') !== releaseTotal) throw new TypeError('Inconsistent release total');
      breakdownTotal = add(breakdownTotal, releaseTotal);
      return { releaseId, tag: tag(release.tag), total: releaseTotal, packages };
    });
    if (breakdownTotal !== total || assetIds.size !== packageCount) throw new TypeError('Inconsistent package total');
  }
  return snapshot;
}

function releasePageUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new TypeError('Invalid pagination URL'); }
  if (url.origin !== 'https://api.github.com' || !apiPaths.has(url.pathname) || url.username || url.password || url.hash) throw new TypeError('Unexpected pagination URL');
  const keys = [...url.searchParams.keys()];
  if (keys.length !== 2 || new Set(keys).size !== 2 || !keys.includes('page') || !keys.includes('per_page') || url.searchParams.get('per_page') !== '100' || !/^[1-9]\d*$/.test(url.searchParams.get('page'))) throw new TypeError('Invalid pagination parameters');
  const page = Number(url.searchParams.get('page'));
  identifier(page, 'page number');
  return { url: url.href, page };
}

export function nextReleasePage(linkHeader, currentPage) {
  if (!linkHeader) return null;
  if (typeof linkHeader !== 'string' || linkHeader.length > 16384) throw new TypeError('Invalid pagination header');
  let next = null;
  for (const entry of linkHeader.split(/,(?=\s*<)/)) {
    const link = /^\s*<([^>]+)>\s*((?:;.*)?)$/.exec(entry);
    if (!link) throw new TypeError('Invalid pagination link');
    const relation = /;\s*rel\s*=\s*(?:"([^"]*)"|([^;\s]+))/i.exec(link[2]);
    if (!relation || !(relation[1] ?? relation[2]).split(/\s+/).includes('next')) continue;
    if (next) throw new TypeError('Multiple next pages');
    next = releasePageUrl(link[1]);
    if (next.page !== currentPage + 1) throw new TypeError('Nonsequential release pages');
  }
  return next?.url ?? null;
}

export async function loadDownloadCount({ fetchImpl = globalThis.fetch, timeoutMs = 8000, maxPages = 20, now = () => new Date() } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Fetch is unavailable');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isSafeInteger(maxPages) || maxPages < 1 || maxPages > 100) throw new TypeError('Invalid download request limits');
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new Error('Download count request timed out')); }, timeoutMs);
  });
  const collect = async () => {
    const pages = [];
    let url = RELEASES_API_URL;
    for (let page = 1; url; page++) {
      if (controller.signal.aborted) throw new Error('Download count request timed out');
      if (page > maxPages) throw new Error('Download count page limit reached');
      const response = await fetchImpl(url, {
        headers: { Accept: 'application/vnd.github+json' },
        credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
        redirect: 'error', signal: controller.signal
      });
      if (!response?.ok) throw new Error(`GitHub download count unavailable (${response?.status ?? 'network'})`);
      pages.push(await response.json());
      url = nextReleasePage(response.headers.get('link'), page);
    }
    const summary = aggregateReleasePages(pages);
    return validateSnapshot({ schemaVersion: 1, repo: DOWNLOAD_REPO, checkedAt: new Date(now()).toISOString(), ...summary });
  };
  try { return await Promise.race([collect(), deadline]); }
  finally { clearTimeout(timer); }
}

export function formatDownloadTotal(total) {
  return new Intl.NumberFormat('en-GB').format(count(total, 'display total'));
}
export function formatCheckedAt(checkedAt) {
  const date = new Date(checkedAt);
  if (!Number.isFinite(date.getTime())) throw new TypeError('Invalid display date');
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/London', timeZoneName: 'short'
  }).format(date);
}

const initializations = new WeakMap();
export function initDownloadCounter(element, options = {}) {
  if (initializations.has(element)) return initializations.get(element);
  const total = element.querySelector('[data-download-total]');
  const checked = element.querySelector('[data-download-checked]');
  const status = element.querySelector('[data-download-status]');
  if (!total || !checked || !status) return Promise.resolve(null);
  const task = (async () => {
    try {
      const snapshot = await loadDownloadCount(options);
      const time = element.ownerDocument.createElement('time');
      time.setAttribute('datetime', snapshot.checkedAt);
      time.textContent = formatCheckedAt(snapshot.checkedAt);
      total.textContent = formatDownloadTotal(snapshot.total);
      checked.replaceChildren('Checked ', time);
      status.textContent = 'Total reported by GitHub';
      return snapshot;
    } catch {
      // The build-time total and its date remain visible if GitHub cannot answer.
      status.textContent = 'Last checked total; live count unavailable';
      return null;
    }
  })();
  initializations.set(element, task);
  return task;
}

if (typeof document !== 'undefined') {
  const counter = document.querySelector('[data-download-counter]');
  if (counter) void initDownloadCounter(counter);
}
