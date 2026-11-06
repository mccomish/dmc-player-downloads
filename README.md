# DMC Player download website

This repository contains the static download website and release information for DMC Player. Application installers and portable packages are attached to GitHub Releases; they are not stored as normal Git files. The player's application source is maintained separately.

The eleven public pages are Home, The player, Films & TV, Live TV, Watch together, Download, Help, About, Mac preview, Privacy and Terms & conditions. Legal-page content lives in `scripts/legal-pages.mjs`; the public contact address is the one explicitly supplied by the creator. They share `dist/site.css` and `dist/app.js`. Page templates live in `scripts/build-pages.mjs`; their generated HTML is committed so GitHub Pages can serve it directly. All pages use relative `.html` links for project-path hosting. The site focuses on DMC Player as a free media player for gaming, its features and how to use it. The About page content lives in `scripts/product-about.mjs`.

## Local preview

Requires Node.js. There are no npm dependencies.

```sh
node scripts/serve.mjs
```

Open the printed localhost address. The server also supports the `/dmc-player-downloads/` prefix so relative links can be checked before GitHub Pages publication.

## Verify

```sh
node verify.mjs
node scripts/verify-demo-carousel.mjs
node scripts/verify-download-count.mjs
```

This checks release sizes, checksums, bundled documentation, screenshot metadata, local links, and the download contract. With the original player workspace available it also compares the local release binaries. `--check-remote` checks external download response headers; it does not claim a full remote SHA-256 verification. Use `--allow-unpublished-downloads` only for an unfinished local preview.

The second command checks the gameplay carousel's navigation, active-video playback, pause controls, reduced-motion preference, visibility and media failures without browser dependencies. Clip details and source credits live in `scripts/gameplay-clips.json`; muted MP4s and their poster images are served locally from `dist/assets/gameplay`. `scripts/demo-gallery.mjs` renders the shared Home and The player demo. Run the page builder after changing that list or template. Only the visible active clip loads and plays; hovering holds the current scene while its footage continues. Pause stops the clip and scene rotation together.

## Homepage download counter

The small line beneath the homepage Download button sums GitHub's `download_count` for named Windows installer/portable and Mac universal ZIP assets across published releases, including prereleases. It includes repeat, update and automated verification downloads. It does not count drafts, page views, unique users, installed copies, checksum files, verification reports, source archives, or downloads shared outside GitHub. Removing or replacing release assets can remove their counts from the current GitHub total.

`dist/download-count.mjs` requests the public GitHub API once per homepage view, follows pagination and updates the number only after the complete response has been validated. It sends no account credentials or referrer, stores nothing in the browser, and does not track download-button clicks. A dated number is built into the HTML as a fallback for API errors, rate limits, disabled JavaScript or unavailable live metadata. GitHub controls how quickly its source counts update.

Refresh that fallback before publishing changes or a new release:

```sh
node scripts/update-download-count.mjs
node scripts/build-pages.mjs
```

The updater writes `dist/assets/download-count.json` only after a successful complete metadata fetch; it never downloads app packages. The counter test command checks filtering, pagination, count validation, failure fallback and browser request privacy. The repository remains a static GitHub Pages site without a counter backend or account credentials in its source.

Watch-together copy describes three source types: local files, direct streams and YouTube video co-watching from DMC Player 2.7. Both players need 2.7 or later for YouTube; every participant loads YouTube independently. The session shares a canonical public video URL, title and playback state, without account sessions or YouTube media bytes. Subscription websites remain unsupported by Watch together. Keep the documented ad/loading/autoplay limits and possible manual Play action when changing this copy.

Watch-session chat requires 2.8 or later on both players. The Watch together page includes a labelled sample-text illustration using `watch-chat-section`, `watch-chat-layout` and `watch-chat-preview` classes. Keep the 280-character limit, three-message/six-second overlay, Chat / Ctrl+Alt+C controls, local hide choice and no automatic saved transcript or late-join replay clear. Privacy describes chat text, sender display name and message time going to the host and connected participants. Disney copy describes the checked UK sign-in page only; it does not certify sign-in or protected playback.

## Update a release

1. Build and verify the new application release in the original player workspace.
2. Publish its installer, portable ZIP and release information as GitHub Release assets.
3. Run `scripts/prepare-release.mjs` from the original workspace with `--download-base` set to that real versioned release URL.
4. Run `node scripts/build-pages.mjs` to regenerate every page's static version, download and checksum fallback values from the prepared release metadata. Run the verifier and inspect the page on desktop and mobile.
5. Commit the site, push `main`, and publish `dist` to the `gh-pages` branch. GitHub Pages serves that branch's root.

The included Render and Vercel configurations are alternatives for hosting the same small static site. Download binaries remain in GitHub Releases.

## Mac preview release

`scripts/mac-page.mjs` holds the Mac guide and feature comparison. Mac downloads are gated by `dist/assets/mac-release.json`. The builder and verifier require a real versioned universal ZIP with matching size and SHA-256 in the original workspace's `Distribution/macOS/<version>` folder, along with passing native release checks and truthful preview/signing metadata. The Windows release manifest and `update.json` remain independent.

`.github/workflows/mac-preview.yml` builds the private Mac source on a standard Apple-silicon macOS runner, then tests the exact same universal ZIP natively on a standard Intel macOS runner. The private source is supplied through encrypted repository secrets, with an explicit input SHA-256. Application source and raw build logs must not be committed here or uploaded as public artifacts. Only the compiled app and small structured verification reports belong on the draft release. Publish the Mac preview only after both jobs pass, with `prerelease=true` and `latest=false` so the Windows stable updater remains on the Windows release. Then add the verified manifest, rebuild and verify the site, and publish `dist` to `gh-pages`.

The first native Mac preview is ad-hoc signed and not notarized. It supports macOS-native media and HTTP/HLS with mini/fullscreen controls and a session M3U browser; Windows Watch together, chat, add-ons, torrents, saved library and automatic updates are not included. Do not imply full Windows feature parity or verified protected-service playback.

## Publishing scope

`dist` contains the public website. Do not publish local preview downloads, environment files, host credentials or private application data. The website has no account system, analytics scripts or tracking pixels. Hosting providers still operate their own security logs.

UI screenshots are synthetic renders of DMC Player with fixture content. The interactive demo uses seven short real gameplay recordings behind a draggable mini player showing a muted Tears of Steel film excerpt. Rocket League, League of Legends, VALORANT, Fortnite, World of Warcraft, Euro Truck Simulator 2 and No Man's Sky are included. Each recording and the film are credited in `dist/assets/gameplay/credits.md`. Only the active gameplay clip and visible film preview load; hidden/offscreen playback pauses, and reduced motion uses posters until Play is chosen. This is an interactive website preview, not a capture of DMC Player running over those games. Compatibility limitations in the app's FAQ are retained on the website.
