# DMC Player 2.10.0

M3U files now open their actual videos or channels, with a saved playlist library for browsing larger lists. This fixes normal file opening finishing on a blank video surface after handing an M3U container directly to the native engine.

## Open and browse your playlists

- Open an M3U file, drop it onto DMC or open it from Windows. A one-video list starts its video automatically. A larger list opens the library so you can choose an entry.
- Choose File > Playlist library to import M3U/M3U8 files or HTTP/HTTPS playlist URLs. Browse saved sources, search the complete imported list, filter by group or media type, save favourites and double-click or press Play.
- Refresh a source manually when its list changes, or remove it without deleting any media files. Watching remains separate from the optional play queue. Existing queued playlist containers also use the new import route.
- Names, groups, durations and supported relative paths are read from the list. Films, series, videos, audio and live channels are classified from available metadata. An on-demand MKV with EXTINF:-1 is treated as video, rather than assumed to be live TV.
- HLS master and segment manifests remain single streams. Their media segments are never turned into library entries. Nested playlist catalogues open in the library; choosing an actual video starts playback.

The library contains the entries actually supplied by your playlist. A single-video M3U does not describe a provider's full catalogue; import its complete channel or video list to browse those other items. Source availability, account access and expired links still depend on the provider.

## Storage and limits

Collections and favourites are compressed and protected for the current Windows user in playlist-library.dat and playlist-favorites.dat. These files contain full refresh/playback addresses and any provider tokens. Network errors displayed by the importer omit private addresses. Opening the library does not fetch logos, refresh remote sources or download the media files automatically.

Imports support up to 50 MiB and 100,000 entries per list, with 64 saved lists and 250,000 entries overall. The list is virtualized and searches run off the UI thread. A failed save preserves the previous stored library and offers the new import for the session. An explicit Add current item still uses the queue's normal storage; ordinary direct-stream Watch together still sends the full selected media address to guests.

## Updating

Use Help > Check for updates or download the installer. Close the older running copy when ready to install, then reopen your M3U. Your existing settings, manual queue, Live TV channels, favourites and service sign-ins are retained. Portable users should extract the complete new folder. DMC Player is free to download and use; this installer remains unsigned.

## Verification

The reported container failure was reproduced with zero decoded frames and an immediate Ended state. The extracted entry played in a separate 15-second native CPU-decoding probe, presenting 321 pictures with no lost pictures or audio buffers. This was a finite playback check; one native error counter was recorded without capturing private log messages. It does not certify every source, a full film, a particular game or GPU composition.

- Parser, encrypted store, bounds, source handling and failure preservation: 12/12.
- Native playlist browser, search, filters, favourites and visible-window lifecycle: 11/11. Normal and minimum layouts were rendered and inspected.
- Native MainWindow integration: 12/12, including real entry playback, saved reload, HLS separation, nested catalogues, old queue entries and Stop/source-change cancellation.
- Existing queue: 6/6; view modes: 6/6; Help: 9/9.
- Live playback integration: 15/15; add-on playback/private sharing: 11/11; YouTube watch sessions: 10/10.
- Installer extraction/payload: 9/9; release packages: 3/3; website: 12/12.

Fixtures used isolated stores, loopback media/rooms, dummy video/audio and normally unshown native windows, with one controlled offscreen browser lifecycle fixture. Tests did not install a runtime, change Windows defaults, access a user account or interrupt the user's player. The website retains its existing design and small download counter, with new library instructions, a native screenshot and updated FAQ/privacy information.

## SHA-256

```text
ccd8caebf06bac2aea5e54d222191e0492561da828754e08af96ade1c4ef01c5  DMC-Player-Setup-2.10.0.exe
194b6554975aa8540c3ebd55ce865e95d4781d8f3d7c6588acfa3cac7f2e2781  DMC-Player-2.10.0-win-x64.zip
```
