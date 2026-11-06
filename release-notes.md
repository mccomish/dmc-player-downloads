# DMC Player 2.10.3

Double-click the video to enter fullscreen, then double-click again to return to the normal window. There is also a fullscreen button on the main toolbar and a small button that appears over the picture when you move the mouse.

- Fullscreen playback now has a timeline with elapsed time and total duration. Click or drag to choose the part of a seekable movie you want to watch.
- The fullscreen dock includes play/pause, back/forward, volume and an exit button. It hides after about 2.5 seconds of inactivity and stays available while you use it or drag the timeline.
- F11, Escape and the right-click fullscreen command remain available. Mini mode keeps double-click-to-restore, resizing and click-through locking.
- Embedded browser fullscreen selects the video/player container where supported. YouTube uses its movie player rather than leaving the watch-page sidebars on screen.
- Accessible website media can use the DMC timeline. For live, unseekable or inaccessible media, DMC leaves the provider's bottom controls clear and offers a small exit button instead.
- Seeks respect Watch together permissions, and a drag from an older source cannot seek a newly opened movie. Opening the player retains the background playback initialization and prepared VLC cache introduced in 2.10.2.

## Updating

Use Help > Check for updates, or download the installer. Close the older player when ready to install, then reopen DMC Player. Settings, manual queues, playlist libraries, TV favourites and service sign-ins are retained. Portable users should extract the complete folder. DMC Player remains free; the installer is unsigned.

## Verification

- Native video input: 17 checks, including renderer-child double-clicks, mini restore, click-through and stale-window guards.
- Fullscreen dock: 10 checks, including timeline commits/cancellation, live states, DPI positioning and rendered layouts.
- Fullscreen integration: 8 checks, including real native movie seeking, source-change cancellation, hover timing, button routing and window restoration.
- Existing mini controls, view modes, right-click menus, Help, startup and YouTube Watch together: 78 regression checks.
- Browser timeline/fullscreen: 15 checks using owned local/intercepted media, including actual content-player HTML fullscreen, seeking, ad guards and iframe fallback.

These use isolated temporary profiles, hidden/offscreen owned windows and local or intercepted media. No protected-video capture, forged trusted browser input, user-profile changes or Windows-default changes were used. Provider support still depends on its page, accessible media and playback rules. Installer extraction, release hashes, the deployed download pages and update feed are verified separately.

## SHA-256

```text
e5a5bcb95f3964fffaaf6a197e2383af1dd8480087d0b27cdacebb3788ec42d3  DMC-Player-Setup-2.10.3.exe
0cd5b3256547d02c0951c064af82e6fffd36f148c84ea679e1ca53cde3948858  DMC-Player-2.10.3-win-x64.zip
```
