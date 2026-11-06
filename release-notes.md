# DMC Player 2.10.4

Dropped native streams now reconnect instead of being treated as finished playback. The empty native video surface also stays black while the decoder reconnects, removing the white screen and placeholder caption.

- Live channels reconnect after unexpected EOF, an error or a sustained playback stall. Initial quick retries change to a 30-second cooldown after repeated failures, and continue while the source is still selected. A minute of stable playback restores quick retries.
- Direct live HLS and master links carry confirmed live metadata into native playback. One bounded variant probe distinguishes a master from its media playlist without changing the original playback URL or adaptive quality selection.
- A finite remote movie that stops well before its known ending can reopen and resume its last confirmed position when seeking is supported. Natural movie endings still finish normally and advance only an explicit queue. A clean EOF with no known duration remains a normal ending rather than guessing that every source is live.
- Playback > Live stream mode gives opaque TV/radio links an explicit continuous-playback mode. Leave it off for movies. Explicit film/episode intent is retained through HLS inspection, manual queue copies and saved settings.
- Pause, Stop, source changes, browser mode, watch-session changes and closing invalidate pending retries. Pausing during native startup is honoured, and an unusable pending resume cannot disable recovery indefinitely.
- A previous stream cannot cancel a newly chosen playlist while classification is pending. Timing samples continue during that wait so an ordinary movie's ending is still handled correctly.

Add-on playback and service websites retain their existing paths. Reconnecting cannot renew an expired provider URL or make an unavailable source respond; those links may need replacing. No video quality is deliberately reduced.

## Updating

Use Help > Check for updates, or download the installer. Close the older player when ready to install, then reopen DMC Player. Settings, manual queues, playlist libraries, TV favourites and service sign-ins are retained. Portable users should extract the complete folder. DMC Player remains free; the installer is unsigned.

## Verification

Controlled native tests cut a finite HTTP movie before its ending, observed real VLC EndReached without a native error, reopened the same source and resumed the remembered position. Full finite and unknown-duration media were also played to natural EOF and verified not to reopen.

Other checks cover live cooldown retries, actual live HLS/master reconnection, persisted film/episode intent, queue preservation, deferred source choices, late Pause, unseekable reconnects and version/intent cancellation fences. Repeated real loopback HTTP failures were paired with a supplied monotonic scheduling clock to verify retries beyond the rapid stage; these are controlled fault tests, not a ten-minute real-broadcaster endurance claim. All fixtures use owned local/intercepted media, temporary stores/profiles and hidden/offscreen windows. No user source, credentials, Windows defaults or ongoing playback was changed during testing.

The fullscreen controls and background playback initialization from the previous releases are retained. Installer extraction, every portable payload hash, the public downloads and the deployed update feed are verified separately.

## SHA-256

```text
094cc416036e7b9d098b64cb7a3f2b641932b3dfd504b09564e483244000e1b4  DMC-Player-Setup-2.10.4.exe
6105118dd86edde3c21715ad7511274aad56b9a2eb32a1ac399f447711af6f7f  DMC-Player-2.10.4-win-x64.zip
```
