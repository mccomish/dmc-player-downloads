# DMC Player 2.6.1

Fixes opacity and click-through lock failing with the Windows error "Windows could not apply the player's opacity."

- Keeps the required native transparency style while fading or locking the player.
- Preserves opacity and lock through resizing and window mode changes.
- Unlocking restores mouse input; returning opacity to 100% clears unnecessary layering.
- Retains native video rendering; the fix does not switch the video to a captured or per-pixel WPF window.

## Updating

Close an older running copy before installing. Versions 2.6 and later can use Help > Check for updates; older versions need this installer once. Your saved queue, TV channels, favourites and service sign-ins are retained. DMC Player is free, created for gamers by Darryl McComish.

The installer remains unsigned, so Windows may show an unknown-publisher or reputation prompt. VLC and .NET are included; Setup offers WebView2 when missing. Portable users should extract the complete ZIP into a new folder.

## Verification

The original Windows error 87 was reproduced before this fix. All 7 native-window regression checks now pass, including native alpha at 35%, 75% and 100%, combined opacity/lock, resize/mode changes, unlock and cleanup. Actual Direct3D11 VLC output continued decoding and presenting frames through the changes in an isolated unshown test window. Existing view-mode (6) and mini-control (34) checks passed. Installer (9) and release-package (3) checks passed without installing or changing Windows defaults. Protected streaming-service video was not retested and remains subject to provider rules.

Existing viewing limits remain: community channels are not guaranteed to work, protected website playback is unverified, and free watch-together test relays last up to 60 minutes with no uptime guarantee. Website playback is not shared.

## SHA-256

```text
66facce574a8744b2f9f7e80d022a4f27a1861b682d9541c627680d9176dc3dc  DMC-Player-Setup-2.6.1.exe
17f5a7157493ce830494e9d4ffe176720ca9f46beefc0303a4c050b36807f3f4  DMC-Player-2.6.1-win-x64.zip
```
