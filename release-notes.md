# DMC Player 2.10.2

DMC Player now opens its window before loading the VLC playback engine, so native initialization no longer holds up the first screen.

- Playback prepares on a background worker. A file opened immediately waits for that same engine; selecting something else or pressing Stop cancels the older pending selection.
- Closing during initialization does not wait for native loading, and a late-created engine is released safely.
- Installer and portable releases include VLC's plug-in cache. Missing or changed cache metadata triggers regeneration; normal native validation remains enabled. Installer timestamps are preserved in UTC, and portable extractions with changed timezones recover safely.
- Right-click menus are created when first requested, the main window reuses the application theme, and automatic update checks begin after the window has opened.
- Files, playlist libraries, service browsers and torrent engines are not scanned or started in advance.

The website's light theme, small download counter and gameplay demo are retained.

## Updating

Use Help > Check for updates, or download the installer. Close the older player when ready to install, then reopen DMC Player. Settings, manual queues, playlist libraries, TV favourites and service sign-ins are retained. Portable users should extract the complete folder. DMC Player remains free; the installer is unsigned.

## Startup measurements

Five fresh-process observations per version on this PC measured a median first render of 620 ms before the change and 555 ms afterward, with about 154 MiB versus 123 MiB of working set at first paint. All five updated runs painted before playback initialization completed.

These are warm-filesystem-cache measurements of an offscreen window with an empty temporary profile. The baseline models the previous synchronous native startup. The fixtures exclude singleton activation, global shortcuts and external integrations. They are not a cold-boot or low-spec-PC guarantee, and first paint is distinct from playback readiness. Disk speed, security scanning and stream buffering can still affect launch or playback.

## Verification

Startup resource lifecycle, pending-open cancellation, native playback, playlist/add-on playback, YouTube Watch together, view controls, Help, single-instance activation, installer extraction and release hashes were checked in isolated fixtures. No user installation, profile, Windows default or ongoing playback was changed during testing.

## SHA-256

```text
f08b3f138aa3a95bf24a0093c6d9e43bde4a592ead12ca8004580aeee5ae0e6f  DMC-Player-Setup-2.10.2.exe
4ca4011cace9ac92000d30702f32af4663cbf6a0a90fb1b8b94eb109ebc32530  DMC-Player-2.10.2-win-x64.zip
```
