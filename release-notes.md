# DMC Player 2.8.0

Watch together now has short chat messages over the video. The Disney+ button opens the current official UK sign-in page directly.

## Watch-session chat

- Use DMC Player 2.8 or later on both players. While connected, choose Chat in Watch together, or press Ctrl+Alt+C when Windows could reserve the shortcut.
- Type up to 280 characters and press Enter to send. A successful send closes the composer and returns to the previous focus; Escape closes it without sending.
- Up to three plain-text messages appear over the picture and fade after about six seconds. Incoming messages do not take keyboard focus or intercept clicks.
- Show messages over video controls your own overlay. Hiding it does not stop connected participants receiving chat.
- Message text, sender display name and message time go through the host to connected room participants over the existing encrypted session connection. There is no automatic saved chat log, central transcript or earlier-chat replay for late joiners. Other participants can still copy or record messages.

## Disney+ entry link

The Disney+ tile now opens the official UK sign-in destination directly. Pasting a bare Disney+ homepage address uses that same entry; specific watch links, login steps and explicit query/fragment values stay intact.

The public root, UK landing page and direct sign-in page loaded in an isolated WebView2 check without entering an account. The reported opening failure did not reproduce in that fresh profile. Public page navigation does not verify signing in or protected programme playback; Disney+'s browser, account and playback requirements still apply.

## Existing watch features

Local-file and direct-stream sessions remain available. YouTube co-watching still starts from version 2.7: each person loads YouTube independently while play/pause, position and rate follow the host. Ads, loading, autoplay and regional or account restrictions can delay playback; wait for ads to finish and press Play in YouTube if needed. Subscription websites such as Netflix, Prime Video and Disney+ remain unsupported by Watch together.

Free test relays last up to 60 minutes with no uptime guarantee. Community channels are not guaranteed to work, and protected service playback remains subject to provider rules.

## Updating

Use Help > Check for updates, then choose Download update and Install update when ready. Versions before 2.6 need the installer from the download website. Close an older running copy before installing. Saved manual queues, TV channels, favourites and service sign-ins are retained. DMC Player is free to download and use.

The installer remains unsigned, so Windows may show an unknown-publisher or reputation prompt. VLC and .NET are included; Setup offers WebView2 when missing. Portable users should extract the complete ZIP into a new folder.

## Verification

- Chat transport: 38/38 checks passed.
- Chat/MainWindow integration: 7/7 checks passed.
- Chat UI and native overlay: 9/9 checks passed.
- Watch dialog: 12/12 checks passed.
- Disney service links: 9/9 checks passed.
- Disney public page navigation: 3/3 checks passed.
- Native opacity, lock and chat shortcut: 8/8 checks passed.
- YouTube watch sessions: 10/10 checks passed.
- Automatic relay lifecycle: 12/12 checks passed.
- Window modes: 6/6 checks passed.
- Help: 9/9 checks passed.
- Installer: 9/9 checks passed.
- Release packages: 3/3 checks passed.
- Website: 10/10 checks passed.

Chat tests use real host/guest connections and isolated offscreen player windows with native click-through/focus checks. Disney checks loaded public pages and the sign-in form without entering credentials. They do not certify protected video playback, a particular game or another household's network. Website links/assets and gameplay controls passed automated checks; the browser preview infrastructure was unavailable for visual website review.

## SHA-256

```text
a500be6809ce64e23b54c8245cb5d144e11ff98fd31d0124d159684725486314  DMC-Player-Setup-2.8.0.exe
8f759ce05e358e7fa87307cead6bce5709ae20080034b2cd5b759210d093ba2d  DMC-Player-2.8.0-win-x64.zip
```
