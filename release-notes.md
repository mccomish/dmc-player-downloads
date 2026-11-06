# DMC Player 2.10.1

The player's right-click menu now has a complete custom frame, removing the white strip left by Windows' default menu gutter.

- Rounded charcoal surfaces, clear monochrome icons, consistent 34px rows and aligned shortcuts.
- Full screen, Mini player, Always on top and Click-through lock remain directly available.
- Playback, Volume, Open and Queue group related commands into shorter submenus. Open includes files, streams, Live TV, playlist libraries, films/add-ons, YouTube and streaming services.
- Chat appears when a watch session is connected. Checked, disabled, highlighted and keyboard-focus states remain distinct.
- The same menu surfaces apply to nested popups and the player's speed/track menus. Compact top-menu labels remain in place, with high-contrast colours and scrolling support.

Playback, queues, saved libraries, streaming links and window shortcuts retain their existing behavior. The website's light theme, compact download counter and seven-game demo are retained.

## Updating

Use Help > Check for updates or download this installer. Close the older running player when ready to install, then reopen DMC Player and right-click the picture. Your settings, manual queue, playlist libraries, TV favourites and service sign-ins are retained. Portable users should extract the complete folder. DMC Player remains free to download and use; the installer is unsigned.

## Verification

- Native menu checks: 8/8, including command availability, recursive states, real pin/queue and fullscreen/F11 actions, icon rendering, shortcut alignment, nested menus and a short scrolling viewport.
- Main menu rendered at 96, 120 and 144 DPI; Open, Playback, Volume and Queue submenus inspected. The pale vertical gutter is absent.
- Window/view controls: 6/6; Help: 9/9.
- Installer extraction and payload checks: 9/9; release package checks: 3/3; website: 12/12.

Menu tests render closed production controls and detached submenu contents in isolated WPF fixtures with temporary stores. No popup was opened over the user's movie, no global shortcuts were registered and no user playback, profile, account, Windows default or installation was changed. DPI renders verify the layout at those scales; they do not certify moving a live popup between every monitor configuration.

## SHA-256

```text
e12d00b4595bcb80b5f58add338c9817b0d2ebc2a90e1277e434eab41d742c2c  DMC-Player-Setup-2.10.1.exe
9f0ca01c806e8c75e40cecac88190589352d9083a8432b11ac7dc2458198213f  DMC-Player-2.10.1-win-x64.zip
```
