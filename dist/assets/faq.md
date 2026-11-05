# DMC Player FAQ

## Which files and links can I play?

The VLC engine handles many common video and audio formats, including MP4, MKV, AVI, MOV, MP3 and FLAC. Open stream accepts direct media links, including supported HTTP/HLS and RTSP streams. YouTube links open in the embedded browser; use Services for other supported website watch pages. A file still needs a supported codec and a usable source.

## Does everything I watch go into a queue or history?

No. Opening a file or direct stream, dropping it on the player, or opening it from Windows plays it on its own. Those ordinary opens are not saved as a playback history. Showing the queue does not enable automatic additions. Choose File → Add to queue, then Add files…, Add stream… or Add current item when you want to keep an item. A manual queue survives a restart; lists from older automatic-queue versions are not restored.

## When does the queue play the next item?

Double-click a queue entry to start queue playback; the next queued item then plays when it ends. A video opened on its own stops at the end, even when a queue is visible. Adding the current video to the queue does not restart it or turn its current standalone playback into queue playback. Adding, removing or clearing queue entries does not interrupt the video already playing.

## Can I watch and search YouTube inside DMC Player?

Choose File → YouTube to open YouTube inside the player and use its normal search. You can also paste an HTTPS YouTube watch, Shorts, live, playlist or youtu.be share link into Open stream. Video, playlist and timestamp details stay in the address. Use YouTube's video fullscreen control, then Ctrl+Alt+O to watch in mini mode. DMC Player opens YouTube pages; it does not download videos or relay them through watch together. Playback and Google sign-in depend on YouTube's embedded-browser rules; account access is not guaranteed or automated.

## Can I watch Netflix, Prime Video or Disney+?

Services opens the provider's site inside the player using standard WebView2. Sign in with your own account. Playback depends on the provider's embedded-browser, DRM, account, device and output rules; listing a service does not guarantee every title will play. DMC Player does not bypass these rules or supply subscriptions. The WebView2 sign-in profile is separate from your normal browser.

## How do I find live TV and free channels?

Choose File → Live TV, search or filter the channel list and press Watch channel. Direct channels play in the VLC engine, with DMC's normal volume and mini controls. Open More channels / import a playlist for the optional UK and English community lists from IPTV-org, an M3U file or a playlist URL. Community entries are public submitted links, not broadcaster-verified listings; availability, adverts and location restrictions vary. Add to favourites saves a channel separately from the play queue. File → Streaming services opens official provider websites when a service requires its own web player.

## Can I get all my Freeview channels here?

A Freeview TV receives many channels through its aerial and tuner. That does not mean each channel has an unrestricted internet stream. BBC iPlayer, ITVX and similar services may require their own signed-in player. If you already have a network TV tuner or Tvheadend server, import its M3U channel-list URL in Live TV to play its supported channels directly. DMC Player does not turn a PC without TV tuner hardware into an aerial receiver.

## Will every TV channel or service play here?

No. A public stream can stop working, restrict your country or require a different player. Community lists are not a guarantee of availability, permission or a complete Freeview lineup. Protected service websites use WebView2 and their DRM, account and subscription rules still apply; DMC Player does not guarantee embedded playback. Live viewing may have local TV licence requirements. The app does not bypass sign-in, location or content protection. Website playback is not relayed through watch together. Imported channel directives for DRM keys, cookies and custom player options are not executed.

## How do I put the picture over FiveM?

Use FiveM in borderless windowed mode, then press Ctrl+Alt+O. Drag the mini picture to move it and stretch its edges to resize. Double-click, or press Ctrl+Alt+O again, to restore the full player. For a service, first use its own video fullscreen control so the video fills the embedded view.

## How do I use fullscreen and the right-click menu?

Right-click the player and choose Fullscreen, use View → Fullscreen, or press F11. The player fills the display and hides its window controls. Press F11 again or Escape to restore the previous normal or maximized window. Choosing mini mode leaves fullscreen, and choosing fullscreen leaves mini mode. For a website, its own video fullscreen button selects the video view; F11 controls DMC Player's window.

## How do I stop accidental clicks while gaming?

Press Ctrl+Alt+L to lock the mini player. Clicks then pass through to the game, and hover controls disappear. Press Ctrl+Alt+L again to unlock. The lock cannot be enabled if Windows could not reserve that unlock shortcut. Restoring full size also unlocks the player.

## Where did the mini controls go?

They appear when the pointer is over the unlocked mini picture and collapse when you move away. They stay hidden while click-through is locked. The skip buttons move ten seconds for files and direct streams; service commands require an accessible media element and may be restricted by the provider or a separate-origin frame.

## Why is the picture behind my game or blank?

Exclusive fullscreen games can cover ordinary always-on-top desktop windows; switch the game to borderless windowed mode. For a service, check that the installed WebView2 Runtime is available and that its own page can start playback. DRM or output restrictions can prevent a protected picture from appearing. A valid login alone does not remove those restrictions.

## How can friends watch with me over the internet?

Open a file or direct stream, choose Tools → Watch together, then press Host. Choose Copy link when the invitation is ready and send it to friends. They need DMC Player 2.3 or later. An installed copy opens invite links; otherwise, select Join and paste the link. A host can have up to eight guests. Keep the host player open while watching. Stopping hosting expires the link. Free test links last up to 60 minutes; start a new room to keep watching.

## Is the automatic relay always available?

Automatic hosting uses a free test relay for this pre-release build. The current Pinggy free relay limits sessions to up to 60 minutes. Start a new room to keep watching afterward. Availability, speed and capacity are not guaranteed, and a session can disconnect if the relay stops. No relay account is required. Configure and operate your own relay before a public release or when you need a dependable service. Advanced direct connection remains available as an alternative.

## Can I use a direct connection instead?

Expand Advanced direct connection in Watch together. Internet mode needs a public address and a forwarded TCP port (52180 by default), with the firewall allowing that port. LAN/VPN mode works when friends can reach your PC on that network. Choose Host with direct connection to use those settings instead of the automatic relay.

## Do friends need the file or a subscription?

Local media streams from the host, so guests do not need their own copy; the host needs upload capacity for each guest. For a direct network stream, every guest needs permission to open that source. Embedded subscription services are not relayed or synchronized by watch together. Volume, subtitles and window size remain local.

## How do I make DMC Player my default media app?

Install DMC Player with Setup so Windows knows its supported file types. Then choose Tools → Default media player, or open Windows Settings, find DMC Player and choose the file types you want it to open. Windows keeps the final choice with you. The portable player does not register itself or force default associations.

## Where are my queue and service sign-ins stored?

Player data normally lives in %LOCALAPPDATA%\DMC Player. If an older %LOCALAPPDATA%\Sidecar folder exists and the new folder contains neither a library.json file nor a WebProfile folder, the player keeps using Sidecar. An empty new folder or Relay-only metadata does not change that choice. The library.json file stores your manually chosen queue, its resume positions, volume and preferences, including full queued stream addresses. Older automatic-queue lists are not restored. Explicitly loaded TV lists and favourites are saved separately in tv-channels.json and tv-favorites.json, including their full stream addresses. Watching a channel does not create history or add it to the queue. WebProfile stores the browser session; DMC Player does not read your account passwords or cookies.

## Why are a global shortcut or mouse lock unavailable?

Another application may already own the key combination. Close an older DMC Player or Sidecar instance, or the conflicting application, then restart the player. Additional normal launches of DMC Player send their files to the existing instance. Mouse lock stays disabled when the unlock shortcut is unavailable.

## How do I update, and why might Windows warn about Setup?

This build has no automatic update checker or configured website link. To update, use a newer installer or portable package from a source you trust. The current installer is unsigned, so Windows may show an unknown-publisher or reputation warning. DMC Player does not silently download or install updates.

