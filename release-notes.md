# DMC Player 2.9.1

This update addresses intermittent picture and sound freezes on live TV, including the built-in Sky News channel.

## Live TV playback

- Live channels use a 30-second adaptive buffer target and 3-second network cache to give segment downloads more breathing room. This means the picture can run a little further behind the broadcast.
- A managed local HLS transport bounds stalled downloads and releases them before the native player stops or reconnects. The original broadcaster address, query parameters, advertising, encryption and adaptive quality selection are retained.
- If a live channel stops making progress, DMC can reopen the same source. Retries are limited to three within five minutes, with a backoff; a continuing outage asks you to press Play. Pause, Stop, changing source, closing the player or changing rooms cancels a pending retry.
- Live channels no longer resume at an old DVR position. Explicitly adding a channel to your queue still preserves its live status; watching alone does not automatically add anything to your queue.
- Watch together passes the live-channel marker to guests and avoids repeatedly seeking their independent live streams. File and on-demand synchronization remains available as before. Update both players to 2.9.1 for this behavior.

The managed transport applies to live HTTP/HTTPS links whose path ends in .m3u8, including the current built-in Sky News source. Ordinary files and on-demand streams keep their existing buffering behavior.

## Updating

Use Help > Check for updates or download the installer. Install when ready to close playback, then reopen Sky News from Live TV. Your manual queue, channels, favourites and service sign-ins are retained. Portable users should extract the complete new folder. DMC Player is free to download and use; this installer remains unsigned.

## Verification

The existing Sky configuration reproduced a 37.8-second picture freeze and 42.4-second playback-clock freeze during a 210-second native playback test. A 210-second test with the new buffer profile, followed by another 210-second test with the final managed transport, showed no measured picture or clock gap of two seconds or more after startup. The managed run averaged 24.976 displayed frames per second with no lost pictures or audio buffers.

A controlled interrupted-download test also passed: while the original remote response remained held open, DMC released it, stopped the native player and reopened the same source. Playback time and presented frames resumed. Disposal plus native Stop took 54 ms in that fixture. The old native-only held-response paths remain documented as failing diagnostic baselines.

- Live recovery, buffering and store policy: 22/22.
- Native MainWindow playback and recovery integration: 15/15.
- Managed HLS HTTP, cancellation, bounds and request guards: 12/12.
- Queue: 6/6; add-on playback/private sharing: 11/11.
- View modes: 6/6; opacity and lock: 8/8.
- YouTube watch sessions: 10/10; watch/chat protocol: 38/38; Help: 9/9.
- Installer extraction and payload checks: 9/9; release package checks: 3/3.

Native tests used isolated stores and unshown windows or timed dummy video/audio outputs. They do not certify GPU composition over a particular game, another household's connection, every channel or future broadcaster availability. Internet and broadcaster outages can still interrupt playback.

## SHA-256

```text
b0b2ad6e8920dda619bf6dd2bad5eea01cb4019965582090667c55c0e73f033f  DMC-Player-Setup-2.9.1.exe
6a39abfdcc6bf46b97cc6e018012a2204415655d4eec3befa6a9540e032af850  DMC-Player-2.9.1-win-x64.zip
```
