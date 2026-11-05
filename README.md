# DMC Player download website

This repository contains the static download website and release information for DMC Player. Application installers and portable packages are attached to GitHub Releases; they are not stored as normal Git files. The player's application source is maintained separately.

The seven public pages are Home, The player, Live TV, Watch together, Download, Help and About. They share `dist/site.css` and `dist/app.js`. Page templates live in `scripts/build-pages.mjs`; their generated HTML is committed so GitHub Pages can serve it directly. All pages use relative `.html` links for project-path hosting. The site identifies DMC Player as free software created for gamers by Darryl McComish.

## Local preview

Requires Node.js. There are no npm dependencies.

```sh
node scripts/serve.mjs
```

Open the printed localhost address. The server also supports the `/dmc-player-downloads/` prefix so relative links can be checked before GitHub Pages publication.

## Verify

```sh
node verify.mjs
```

This checks release sizes, checksums, bundled documentation, screenshot metadata, local links, and the download contract. With the original player workspace available it also compares the local release binaries. `--check-remote` checks external download response headers; it does not claim a full remote SHA-256 verification. Use `--allow-unpublished-downloads` only for an unfinished local preview.

## Update a release

1. Build and verify the new application release in the original player workspace.
2. Publish its installer, portable ZIP and release information as GitHub Release assets.
3. Run `scripts/prepare-release.mjs` from the original workspace with `--download-base` set to that real versioned release URL.
4. Run `node scripts/build-pages.mjs` to regenerate every page's static version, download and checksum fallback values from the prepared release metadata. Run the verifier and inspect the page on desktop and mobile.
5. Commit the site, push `main`, and publish `dist` to the `gh-pages` branch. GitHub Pages serves that branch's root.

The included Render and Vercel configurations are alternatives for hosting the same small static site. Download binaries remain in GitHub Releases.

## Publishing scope

`dist` contains the public website. Do not publish local preview downloads, environment files, host credentials or private application data. The website has no account system, analytics scripts or tracking pixels. Hosting providers still operate their own security logs.

UI screenshots are synthetic renders of DMC Player with fixture content. The hero is a labelled illustration, not a captured game. Compatibility limitations in the app's FAQ are retained on the website.
