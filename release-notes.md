# DMC Player 2.6.0

A free Windows player, created for gamers by Darryl McComish.

## New in 2.6.0

- Automatic update checks at startup and every six hours while the player remains open.
- A small Update button beside the menu appears only when a newer version is available. It stays hidden in mini mode and fullscreen.
- Help > Check for updates provides a manual check.
- Download update verifies the installer's exact size and SHA-256. A separate Install update action checks the file again, opens Setup and closes the player, ending any watch session.
- No update is silently downloaded or installed. Updates, like DMC Player itself, are free.
- Creator attribution is included in About and installer metadata.

The download website has been rebuilt as seven separate pages: Home, The player, Live TV, Watch together, Download, Help and About.

## Updating

Versions before 2.6 do not have the update checker. Close the running player and install 2.6 once from the website. Later releases can be downloaded through the new update button. Your saved queue, channel lists, favourites and service sign-ins are retained. Portable users can use Setup to move to an installed copy, or download and extract the new portable ZIP themselves.

The installer remains unsigned, so Windows may show an unknown-publisher or reputation prompt. VLC and .NET are included; Setup offers WebView2 when missing.

## Existing features and limits

Direct Live TV, M3U import, favourites and optional community lists remain available. Community listings are not a guarantee of availability, permission or playback. Provider account, location, TV Licence, subscription and DRM requirements apply. Protected website playback remains unverified.

Watch together uses a free test relay with sessions up to 60 minutes and no availability guarantee. Website playback is not shared. Normal media opens and channel watching do not add to the optional play queue or history.

## Validation

- 7 update backend checks and 8 isolated update UI checks passed, including separate download/install actions, cancellation, error recovery, miniature/fullscreen notice behavior and rejected launch metadata.
- Existing help (8), queue (6) and visual/layout checks passed.
- Installer (9) and release package (3) checks passed without installing or changing Windows defaults.
- Live public update check/download is verified separately after publication; test suites never execute an installer.

## SHA-256

```text
46a7f19874b3f9125ab699c258f939fcf86c5dabfb5918b69278161d2564934b  DMC-Player-Setup-2.6.0.exe
9ee8b2187a64dcf594caa9140cf2c3a0d49637606f43cf4f9e96b6fd72dd3991  DMC-Player-2.6.0-win-x64.zip
```
