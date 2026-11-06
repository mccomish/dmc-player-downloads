# DMC Player 2.9.0

Browse films and TV episodes, install compatible add-ons and play direct or torrent video sources inside DMC Player.

## Films, TV and add-ons

- Open File > Films & TV / add-ons. Choose a catalogue, search, select a film or episode, choose a source and press Play.
- DMC Open Films includes Sintel, Tears of Steel and a clearly labelled Big Buck Bunny trailer, with Blender credits.
- Add film & TV catalogue installs optional Cinemeta metadata. Metadata alone does not supply streams; install your configured source add-ons separately.
- Paste an HTTPS manifest.json or stremio:// link, check its preview and install. Enable, refresh or remove installed add-ons in the same window.
- The native player supports direct HTTP/HTTPS video, YouTube video results and BitTorrent v1 info-hash/magnet sources with file selection. Existing mini, fullscreen, volume and click-through controls apply.
- This is DMC's own browser and playback integration. It does not bundle the Torrentio service, a movie/TV torrent index, subscriptions or a resolver account. Custom-header sources, archives, DRM, external-player results and unsupported filters are not supported.
- Add-on configuration is encrypted for the Windows user in addons.dat. Add-on selections are temporary and stay out of the queue/history; Add current item does not save them.

## Torrent playback and sharing

The selected video streams through a piece-aware local endpoint into VLC. Seeking waits for the required pieces. Sources need available peers and disk space; the current limits are 32 GiB for the selected video and 64 GiB for the torrent.

BitTorrent uses peer-to-peer connections. Peers and trackers can see your IP address and torrent activity, and uploading can occur while the video is open, including while paused. Stop, source change, playback end, decode failure or app close stops the engine and removes its owned cache. Marked inactive cache folders left after a crash are cleaned on the next torrent start. DMC is not a VPN. Use content and sources you are entitled to access.

Selected add-on video files can use Watch together. The host proxies video through the existing encrypted room without sending configured add-on addresses or signed media URLs to guests. HLS/DASH/PLS playlists are rejected for this sharing route. Ordinary direct links opened outside the add-on browser still share their full address. YouTube results retain independent YouTube playback synchronization.

## Updating

Download the installer or use Help > Check for updates from version 2.6 or later. Install when ready to close playback. Your manual queue, TV channels, favourites and service sign-ins are retained. The installer remains unsigned. DMC Player is free to download and use.

The website now has a Films & TV guide, a native browser screenshot, updated FAQ/privacy information and the 2.9 update feed. The download counter and gameplay demo are retained.

## Verification

- Add-on backend: 15/15; real Cinemeta manifest/catalogue/search/episode protocol: 17/17.
- Native browser UI: 8/8; torrent streaming: 24/24, including actual VLC decoding and seeking from a locally seeded MP4.
- Native playback/private sharing and playlist/error guards: 11/11.
- Optional queue: 6/6; window modes: 6/6; native opacity/lock: 8/8.
- YouTube watch sessions: 10/10; watch/chat protocol: 38/38; Help: 9/9.
- Installer: 9/9; release packages: 3/3; website: 12/12; download counter: 11/11; gameplay controls: 13/13.

Tests used isolated local stores, loopback peers/rooms and unshown UI fixtures. They do not certify every third-party add-on, a public torrent swarm, another household, a specific game or DRM-protected playback. Native browser layout was rendered and inspected; website visual preview infrastructure was unavailable. Free test-relay sessions remain limited to up to 60 minutes with no availability guarantee.

## SHA-256

```text
533a2a456e2fd171d704755b97260a354082390cade8f58d1182b87f17965430  DMC-Player-Setup-2.9.0.exe
d02690696caec1a94328e11d69d7eea14c88eea619eec9d353731467d52aeb95  DMC-Player-2.9.0-win-x64.zip
```
