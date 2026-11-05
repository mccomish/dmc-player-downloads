# DMC Player 2.7.0

YouTube videos can now use Watch together. Open a video, press Host and send the invite link to friends. Everyone needs DMC Player 2.7 or later.

- Synchronizes the video's play/pause state, playback position and rate.
- Each participant loads the normal YouTube page independently with their own access.
- Shares a canonical public video URL, title and playback state. Extra URL parameters, fragments, account sessions, passwords, cookies and YouTube video bytes are not sent to friends.
- Keeps volume, subtitles, window size and mini mode local to each player.
- Retains local-file and direct-stream watch sessions.

## Getting started

1. Update both players to version 2.7 or later.
2. Choose File > YouTube and start an actual video. Home, search, account and playlist-only pages cannot be hosted.
3. Choose Tools > Watch together > Host, then Copy link and send the invitation to friends.
4. Friends open the invitation with DMC Player, or paste it into Watch together > Join.

Ads, loading, autoplay and regional or account restrictions can delay playback. Wait for ads to finish and press Play in YouTube if needed. DMC Player does not bypass YouTube's access or playback rules. Subscription websites such as Netflix, Prime Video and Disney+ remain unsupported by Watch together and are not relayed or synchronized.

## Updating

Use Help > Check for updates, then choose Download update and Install update when ready. Older versions can use the installer from the download website. Close an older running copy before installing. Saved manual queues, TV channels, favourites and service sign-ins are retained. DMC Player is free to download and use.

The installer remains unsigned, so Windows may show an unknown-publisher or reputation prompt. VLC and .NET are included; Setup offers WebView2 when missing. Portable users should extract the complete ZIP into a new folder.

Free watch-together test relays last up to 60 minutes with no uptime guarantee. Community channels are not guaranteed to work, and protected service playback remains subject to provider rules.

## Verification

- YouTube MainWindow integration: 10/10 checks passed.
- YouTube/embedded WebView playback: 16/16 checks passed.
- Watch protocol: 27/27 checks passed.
- Automatic relay lifecycle: 12/12 checks passed.
- Native VLC sharing: 8/8 checks passed.
- Mini controls: 34/34 checks passed.
- Watch dialog: 12/12 checks passed.
- Help: 8/8 checks passed.
- Installer: 9/9 checks passed.
- Release packages: 3/3 checks passed.
- Website: 10/10 checks passed.

The YouTube tests used two isolated players, actual WebView2 playback and locally intercepted fixture pages/media. They do not certify YouTube's public site, account or ad behaviour, another household's network, or free relay availability. No user sign-ins or installed-player data were changed.

## SHA-256

```text
02f70e9e2ed11dd899667314247f5bc1b02149355af6f64c15ec1f5051e32505  DMC-Player-Setup-2.7.0.exe
194a61e3cb6f31d3d377d7db4d6bfc083d1f43a2dae2c396b49b357d7906aa01  DMC-Player-2.7.0-win-x64.zip
```
