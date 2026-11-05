# DMC Player 2.5.0

Live TV now opens direct channel streams in the native player instead of sending every channel to a website.

- Choose File > Live TV, select a channel and press Watch channel, or double-click it.
- Nine starter broadcaster-origin streams have passed actual native VLC video decoding checks, including Sky News, DW, NHK WORLD-JAPAN and CGTN Documentary.
- Optional one-click UK and English community lists from IPTV-org provide hundreds or thousands of submitted public stream entries. Listings are not a guarantee of permission, availability or playback in your country.
- Import an M3U channel list from a file or URL, including a supported lineup from your own network TV tuner.
- Search, category filters and favourites. Channel lists stay separate from the optional play queue; watching does not add history.
- Direct TV uses DMC Player's normal volume, fullscreen, mini window and click-through controls.

Freeview aerial channels still require a TV tuner; they do not all have unrestricted internet streams. Services requiring their own signed-in web player remain under File > Streaming services. Sign-in, location, subscription, TV Licence and DRM requirements apply. Protected website playback remains unverified.

## Downloads and updating

Use the Setup EXE for a normal per-user Windows x64 installation, or extract the complete portable ZIP and run DMCPlayer.exe. Close any older running DMC Player before updating. Your manually selected queue and embedded service sign-ins are retained. The installer includes VLC and .NET and offers WebView2 when missing.

This build is unsigned; Windows may show an unknown-publisher or reputation prompt. Watch together still uses a free test relay with sessions up to 60 minutes and no availability guarantee. Website playback is not shared.

## Validation

- 9/9 starter channels decoded real video through LibVLC using silent dummy outputs.
- 8 parser/download/storage checks and 5 isolated UI/native playback checks passed.
- Existing queue (6), help (8), provider catalog (8), visual/layout, installer (9) and release-package (3) checks passed.
- Individual community streams are not playback-verified.

## SHA-256

```text
296687498de81c9e0cbee9418cc08ea21d535337dcfc6704e3a98a31898bab36  DMC-Player-Setup-2.5.0.exe
85e9357ac6da64dd50ae5607db92cd726523a50b7a275084fcae30e876125060  DMC-Player-2.5.0-win-x64.zip
```
