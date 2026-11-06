import assert from 'node:assert/strict';
import {
  DOWNLOAD_REPO, RELEASES_API_URL, aggregateReleasePages, formatCheckedAt,
  formatDownloadTotal, initDownloadCounter, isDownloadPackage, loadDownloadCount,
  nextReleasePage, validateSnapshot
} from '../dist/download-count.mjs';

const checkedAt = '2026-11-06T10:15:00.000Z';
const packageAsset = (id, downloads, name = `DMC-Player-Setup-2.${id}.0.exe`) => ({ id, name, download_count: downloads });
const release = (id, assets = [], options = {}) => ({ id, tag_name: `v2.${id}.0`, draft: false, prerelease: false, assets, ...options });
const pageUrl = page => `https://api.github.com/repos/${DOWNLOAD_REPO}/releases?per_page=100&page=${page}`;
const response = (body, link = null, status = 200) => ({ ok: status === 200, status, json: async () => body, headers: { get: name => name.toLowerCase() === 'link' ? link : null } });
const fixture = () => {
  const nodes = {
    '[data-download-total]': { textContent: '26' },
    '[data-download-checked]': { textContent: 'Checked 6 Nov 2026, 09:00 GMT', replaceChildren(...children) { this.children = children; this.textContent = children.map(child => typeof child === 'string' ? child : child.textContent).join(''); } },
    '[data-download-status]': { textContent: 'Total reported by GitHub' },
    '[data-download-source]': { href: `https://github.com/${DOWNLOAD_REPO}/releases` }
  };
  const element = {
    querySelector: selector => nodes[selector],
    ownerDocument: { createElement(name) { return { name, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; } }; } }
  };
  return { element, nodes, total: nodes['[data-download-total]'], checked: nodes['[data-download-checked]'], status: nodes['[data-download-status]'] };
};
const checks = [];
async function check(name, run) { await run(); checks.push(name); }

await check('Only named Windows and universal Mac packages with semantic versions qualify', () => {
  for (const name of [
    'DMC-Player-Setup-2.8.0.exe', 'DMC-Player-2.8.0-win-x64.zip',
    'DMC-Player-2.8.0-beta.1-win-arm64.zip', 'DMC-Player-Setup-2.8.0+build.12.exe',
    'DMC-Player-2.8.0-win-x86.zip', 'Sidecar-1.0.0-win-x64.zip',
    'DMC-Player-0.1.0-macos-universal.zip', 'DMC-Player-0.2.0-beta.1-macos-universal.zip'
  ]) assert.equal(isDownloadPackage(name), true, name);
  for (const name of [
    'source.zip', 'sha256SUMS.txt', 'release.json', 'DMC-Player-2.8.0.zip',
    'DMC-Player-2.8.0-linux-x64.zip', 'DMC-Player-Setup-2.8.exe',
    'DMC-Player-Setup-02.8.0.exe', 'DMC-Player-Setup-2.8.0-01.exe',
    'DMC-Player-Setup-2.8.0.exe.bak', 'DMC-Player-Setup-2.8.0.exe\n',
    'DMC-Player-0.1.0-macos.zip', 'DMC-Player-0.1.0-macos-universal.zip.sha256',
    'Sidecar-0.1.0-macos-universal.zip', 'DMC-Player-0.1-macos-universal.zip', null
  ]) assert.equal(isDownloadPackage(name), false, String(name));
});

await check('Mac preview downloads share the small aggregate total while draft Mac assets remain excluded', () => {
  const result = aggregateReleasePages([[
    release(1, [packageAsset(1, 8), packageAsset(2, 3, 'DMC-Player-2.10.4-win-x64.zip')]),
    release(2, [packageAsset(3, 4, 'DMC-Player-0.1.0-macos-universal.zip'), packageAsset(4, 900, 'mac-release.json')], { tag_name: 'v0.1.0', prerelease: true }),
    release(3, [packageAsset(5, 1000, 'DMC-Player-0.2.0-macos-universal.zip')], { draft: true })
  ]]);
  assert.equal(result.total, 15);
  assert.equal(result.packageCount, 3);
  assert.equal(result.breakdown[1].total, 4);
  const snapshot = { schemaVersion: 1, repo: DOWNLOAD_REPO, checkedAt, ...result };
  assert.deepEqual(validateSnapshot(snapshot), snapshot);
});

await check('Totals use actual repeat downloads, include prereleases, and exclude drafts and metadata', () => {
  const result = aggregateReleasePages([[
    release(1, [packageAsset(1, 8), packageAsset(2, 3, 'DMC-Player-2.8.0-win-x64.zip'), packageAsset(3, 900, 'release.json')]),
    release(2, [packageAsset(4, 5)], { prerelease: true }),
    release(3, [packageAsset(5, 1000)], { draft: true }), release(4)
  ]]);
  assert.equal(result.total, 16);
  assert.equal(result.packageCount, 3);
  assert.equal(result.releaseCount, 3);
  assert.equal(result.breakdown[0].total, 11);
});

await check('Overlapping pages count asset IDs once and keep the most recent reported high-water mark', () => {
  const asset = packageAsset(1, 8);
  const result = aggregateReleasePages([[release(1, [asset])], [release(1, [{ ...asset, download_count: 9 }]), release(2, [packageAsset(2, 6)])]]);
  assert.equal(result.total, 15);
  assert.equal(result.packageCount, 2);
  assert.equal(result.releaseCount, 2);
  assert.throws(() => aggregateReleasePages([[release(1, [asset, { ...asset, name: 'DMC-Player-2.8.0-win-x64.zip' }])]]), /Conflicting asset/);
});

await check('Malformed, negative, fractional, and unsafe values never produce a partial total', () => {
  for (const invalid of [-1, 0.2, '4', null, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => aggregateReleasePages([[release(1, [packageAsset(1, invalid)])]]), /Invalid asset download count/);
  }
  assert.throws(() => aggregateReleasePages([[release(1, [packageAsset(1, Number.MAX_SAFE_INTEGER), packageAsset(2, 1)])]]), /aggregate/);
  assert.throws(() => aggregateReleasePages([[release(1, [{ name: 'DMC-Player-Setup-2.8.0.exe', download_count: 1 }])]]), /asset ID/);
  assert.throws(() => aggregateReleasePages([{}]), /response/);
});

await check('Every page is loaded serially with public, credential-free requests', async () => {
  const calls = [];
  const snapshot = await loadDownloadCount({ now: () => checkedAt, fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1 ? response([release(1, [packageAsset(1, 7)])], '<https://api.github.com/repositories/1447566970/releases?per_page=100&page=2>; rel="next", <https://api.github.com/repositories/1447566970/releases?per_page=100&page=2>; rel="last"') : response([release(2, [packageAsset(2, 4)])]);
  } });
  assert.deepEqual(calls.map(call => call.url), [RELEASES_API_URL, 'https://api.github.com/repositories/1447566970/releases?per_page=100&page=2']);
  assert.equal(snapshot.total, 11);
  assert.equal(snapshot.checkedAt, checkedAt);
  for (const { options } of calls) {
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Accept, 'application/vnd.github+json');
    assert.deepEqual(Object.keys(options.headers), ['Accept']);
    assert.ok(options.signal instanceof AbortSignal);
  }
});

await check('Pagination rejects foreign origins, other paths, unexpected parameters, skipped pages and loops', () => {
  for (const url of [
    'https://attacker.test/next',
    `https://api.github.com/repos/${DOWNLOAD_REPO}/issues?per_page=100&page=2`,
    'https://api.github.com/repositories/999999/releases?per_page=100&page=2',
    `http://api.github.com/repos/${DOWNLOAD_REPO}/releases?per_page=100&page=2`,
    `https://user@api.github.com/repos/${DOWNLOAD_REPO}/releases?per_page=100&page=2`,
    `${pageUrl(2)}&token=secret`, `${pageUrl(2)}#next`, pageUrl(1), pageUrl(3),
    `https://api.github.com/repos/${DOWNLOAD_REPO}/releases?per_page=50&page=2`
  ]) assert.throws(() => nextReleasePage(`<${url}>; rel="next"`, 1), undefined, url);
  assert.throws(() => nextReleasePage(`<${pageUrl(2)}>; rel="next", <${pageUrl(2)}>; rel="next"`, 1), /Multiple/);
  assert.equal(nextReleasePage(`<${pageUrl(1)}>; rel="prev"`, 2), null);
});

await check('A bounded page limit and an overall timeout reject the whole result', async () => {
  let calls = 0;
  await assert.rejects(loadDownloadCount({ maxPages: 1, fetchImpl: async () => { calls++; return response([release(1, [packageAsset(1, 2)])], `<${pageUrl(2)}>; rel="next"`); } }), /page limit/);
  assert.equal(calls, 1);
  let signal;
  await assert.rejects(loadDownloadCount({ timeoutMs: 10, fetchImpl: async (_, options) => { signal = options.signal; return new Promise(() => {}); } }), /timed out/);
  assert.equal(signal.aborted, true);
});

await check('Validated snapshots preserve an auditable breakdown and reject inconsistent or malformed data', () => {
  const snapshot = { schemaVersion: 1, repo: DOWNLOAD_REPO, checkedAt, ...aggregateReleasePages([[release(1, [packageAsset(1, 26)])]]) };
  assert.deepEqual(validateSnapshot(snapshot), snapshot);
  assert.throws(() => validateSnapshot({ ...snapshot, total: 27 }), /Inconsistent package total/);
  for (const patch of [
    { schemaVersion: 2 }, { repo: 'other/repo' }, { total: -1 }, { packageCount: 0 },
    { checkedAt: '2026-02-30T12:00:00.000Z' }, { checkedAt: 'not a date' }, { checkedAt: '2026-11-06' }
  ]) assert.throws(() => validateSnapshot({ ...snapshot, ...patch }));
});

await check('The visible total and UK checked time update once per page without touching the release link', async () => {
  const dom = fixture(); let calls = 0;
  const options = { now: () => checkedAt, fetchImpl: async () => { calls++; return response([release(1, [packageAsset(1, 12345)])]); } };
  const first = initDownloadCounter(dom.element, options);
  assert.equal(initDownloadCounter(dom.element, options), first);
  await first;
  assert.equal(calls, 1);
  assert.equal(dom.total.textContent, '12,345');
  assert.match(dom.checked.textContent, /^Checked 6 Nov 2026, 10:15 GMT$/);
  assert.equal(dom.checked.children[1].name, 'time');
  assert.equal(dom.checked.children[1].attributes.datetime, checkedAt);
  assert.equal(dom.status.textContent, 'Total reported by GitHub');
  assert.equal(dom.nodes['[data-download-source]'].href, `https://github.com/${DOWNLOAD_REPO}/releases`);
});

await check('Network, rate limit, invalid pagination and late-page failures keep the static fallback number and date', async () => {
  const failures = [
    async () => { throw new Error('Offline'); },
    async () => response({ message: 'API rate limit exceeded' }, null, 403),
    async () => response([release(1, [packageAsset(1, 100)])], '<https://attacker.test/next>; rel="next"'),
    (() => { let calls = 0; return async () => ++calls === 1 ? response([release(1, [packageAsset(1, 100)])], `<${pageUrl(2)}>; rel="next"`) : response({}, null, 502); })(),
    async () => response([release(1, [packageAsset(1, -1)])]),
    async () => ({ ...response([]), json: async () => { throw new SyntaxError('Invalid JSON'); } })
  ];
  for (const fetchImpl of failures) {
    const dom = fixture();
    assert.equal(await initDownloadCounter(dom.element, { fetchImpl }), null);
    assert.equal(dom.total.textContent, '26');
    assert.equal(dom.checked.textContent, 'Checked 6 Nov 2026, 09:00 GMT');
    assert.equal(dom.status.textContent, 'Last checked total; live count unavailable');
  }
});

await check('A real zero remains zero and number/date formatting use Britain and London daylight saving', async () => {
  const dom = fixture();
  await initDownloadCounter(dom.element, { now: () => checkedAt, fetchImpl: async () => response([]) });
  assert.equal(dom.total.textContent, '0');
  assert.equal(dom.status.textContent, 'Total reported by GitHub');
  assert.equal(formatDownloadTotal(1000000), '1,000,000');
  assert.match(formatCheckedAt('2026-07-01T12:00:00.000Z'), /13:00 BST$/);
  assert.match(formatCheckedAt(checkedAt), /10:15 GMT$/);
});

console.log(`${checks.length} download counter checks passed.`);
for (const name of checks) console.log(`  ✓ ${name}`);
