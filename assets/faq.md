# DMC Player FAQ

## How do I connect AllDebrid?

From Windows version 2.11, open File → Films & TV / add-ons and press Connect AllDebrid. Press Connect, then open the AllDebrid authorization page and approve the displayed code in your browser. DMC updates when approval finishes. You do not enter your AllDebrid password into DMC Player. A masked API-key option is available under Use an API key instead. AllDebrid account shows the account and membership status; Disconnect removes the encrypted connection saved on this Windows account. It does not revoke a key at AllDebrid or delete your remote transfers. AllDebrid is a separate service with its own account and access requirements.

## How is My library organised?

From Windows version 2.12, File → Films & TV / add-ons opens My library automatically when an AllDebrid connection is saved. It loads the ready videos in that account as film and TV cards, with clean titles and release years. Versions of the same film sit under one title; TV shows have seasons, episodes and versions. Use Films, TV shows or Other, title search and page controls to browse. Each page holds up to 24 cards. Choose a card, pick the exact episode or version and press Play. File details is collapsed until you want the original filename. Unknown files, samples, trailers and ambiguous episode packs remain available under Other rather than being guessed as a film or exact episode. Refresh reloads ready account videos; it does not add or delete remote transfers.

## Does My library load posters and details automatically?

Yes. Posters & details is on by default in My library; turn it off to stop artwork requests and use the local title cards. DMC searches Cinemeta using cleaned film/show titles and the media type, then checks the release year and identity before attaching a description or poster. A missing or ambiguous match leaves the local card available. The AllDebrid key, private stream addresses and full release filenames are not sent to Cinemeta or poster hosts. Opening the main player does not index the account or download a catalogue. Artwork loads only while using My library, with 24 cards on a page and bounded memory caches. This is a Windows feature; Mac preview 0.1.0 does not include it.

## Does My library keep my filenames or watch history?

Ready-file listings, cleaned titles, descriptions and poster caches stay in memory rather than a saved cloud library. Only the Posters & details on/off preference is saved in library-view.json. Your AllDebrid connection is still saved separately in encrypted alldebrid.dat. There is no Continue watching list, automatic queue or saved viewing history for these videos. My library's automatic account request is a read-only listing when you open Films & TV with a saved connection; Refresh requests the listing again. Pressing Play resolves only the file you selected.

## Does DMC have its own automatic source search?

Windows version 2.11 includes DMC Sources. Browse films & TV loads the optional Cinemeta metadata catalogue. Choosing a film or episode searches the public Torrents CSV API using its title and year or episode, without sending an AllDebrid key. Results require matching release years and episodes; season packs, collections and ambiguous filenames are excluded. Index coverage and filenames can be incomplete and seeder counts can be stale. Matching a listing does not guarantee that it is available through AllDebrid. Only pressing Play adds the selected magnet to your AllDebrid account and resolves its selected video. Other compatible add-ons remain optional. Disable DMC Sources in Add-ons to stop its searches. The first Mac release has no DMC Sources or AllDebrid integration.

## Why is a source still opening?

The opening message now shows whether DMC is finding torrent peers, waiting for AllDebrid to prepare a source, or starting video playback. Uncached torrents may still need to download on AllDebrid; raw torrent playback depends on peers. Cancel opening stops DMC waiting and leaves a remote AllDebrid transfer intact. Waiting is bounded so a stalled source returns a retryable message. Choose another source, or open My library and press Refresh to pick a ready video. Multi-video torrents require you to choose their exact file there; DMC does not guess an episode from incompatible file indices. File details reveals the original filename if you need to check it. Selecting a source and seeing progress does not certify that the source will become available.

## Why did a streamed movie say finished before its ending?

From version 2.10.4, a remote video with a known duration can reconnect if the native player stops well before its remembered ending. DMC keeps the last playback position in memory and resumes it when the source supports seeking. A movie that actually reaches its ending still finishes normally and may advance an explicit queue. A clean ending with no known duration is ambiguous, so DMC does not assume it was a live channel; use Playback → Live stream mode only for continuous TV or radio. Repeated connection failures slow to a 30-second retry interval. Stop or Pause cancels reconnecting. A new source or watch-session change cannot be replaced by an older pending retry. Add-on and service websites retain their own playback paths; expired or inaccessible links may need replacement.

## Why did the player take a long time to open?

Version 2.10.2 lets the window appear before loading the VLC playback engine on a background worker, and includes a prepared native plug-in cache. A file opened immediately waits for that same engine to finish preparing. Update checks begin after the window has opened. Service browsers, playlist imports and torrent engines still start only when needed. The first launch after extraction, a slow disk or security scanning can take longer; this does not change stream buffering or download speed.

## Why did my M3U file open a blank screen?

Before version 2.10, normal file opening handed an M3U container directly to the native player, which could immediately finish without playing its entries. Update to DMC Player 2.10 or later and open the M3U again. A one-video playlist starts its video automatically. A larger playlist opens the saved playlist library so you can select an entry. The original links must still be accessible; DMC cannot renew expired provider links or bypass sign-in requirements.

## How do I build a library from my playlists?

Choose File → Playlist library and import an M3U file or HTTP/HTTPS playlist URL. DMC indexes every supported entry actually listed in that playlist, using its titles and groups, and offers search, source, type and group filters, favourites and double-click playback. Import multiple lists, refresh a source when its entries change, or remove a list without deleting any local media files. The library holds up to 64 lists, 100,000 entries per list and 250,000 entries overall; each imported playlist can be up to 50 MiB. Opening a one-video M3U also saves that entry. A single-video playlist does not describe the provider's wider catalogue; import a complete channel or video list to browse those other items. M3U8 HLS manifests play as one stream and are not indexed into segments. No media files are downloaded into the library and watching does not add anything to your queue.

## Are playlist links and credentials saved?

Imported playlist collections and favourites are saved locally as playlist-library.dat and playlist-favorites.dat in the player data folder, compressed and protected for your Windows user. This includes full source addresses and provider tokens needed to refresh or play your lists. These files are separate from library.json, the optional queue, and the older Live TV channel lists. Opening the library does not refresh remote lists or fetch logo images automatically. Remove a source from the library to remove its saved entries. A disk-full or read-only error leaves the previous saved library intact and makes the new import available for the current session. If you explicitly add an entry to the optional queue, that queue's normal full-address storage applies. Watch together for an ordinary direct stream shares its full address with guests; only share it when you intend friends to receive that address.

## Why does a live channel freeze, and what should I do?

Version 2.10.4 reconnects live channels after an unexpected ending, error or sustained playback stall. It tries quickly at first, then retries every 30 seconds while the same channel is still selected. A minute of stable playback restores the quicker retries. Pause, Stop, changing source, entering browser mode and closing cancel pending recovery. Confirmed live HLS links opened through Open stream or a playlist use this behavior too; HLS masters are checked through one bounded media-playlist probe. For an opaque channel link that cannot be identified automatically, choose Playback → Live stream mode. Leave this off for movies. Live channels keep the existing roughly 30-second adaptive delay and finite network read deadlines. Reconnecting cannot renew an expired provider link, change access rules or make an unavailable broadcast respond.

## Does live TV stay in exact sync in Watch together?

Use version 2.9.1 or later on both players for the live-stream buffer and live-source marker. Live channel guests follow the live broadcast independently instead of repeatedly seeking to the host's sliding DVR time. A delay between viewers is possible. Play and pause still follow the host; local retry handles a guest's interrupted connection without changing everyone else's playback. Files and on-demand video retain position synchronization.

## How do films, TV and add-ons work?

Choose File → Films & TV / add-ons. In Windows 2.12, a saved AllDebrid connection opens My library first with your ready films and episodes. Use Browse for catalogue searches and new sources. DMC Open Films is included; Add-ons lets you install the optional Cinemeta catalogue and your own compatible providers. Paste the provider's configured manifest.json or stremio:// link and inspect the preview before installing. Enable, disable, refresh or remove installed add-ons there. Browse a catalogue, search, choose a film or TV episode, find sources and press Play. Movies and episodes play on their own, without queue or history entries. Add-on sources are temporary and cannot be saved with Add current item; choose the title again to resolve a fresh source.

## Is this Torrentio, and will every add-on work?

DMC Sources is DMC Player's own automatic source-search and AllDebrid integration, using public Torrents CSV metadata and your account. The player also has its own compatible add-on browser and playback integration. It supports the Stremio manifest/catalog/meta/stream JSON protocol, direct HTTP/HTTPS media, YouTube video results and BitTorrent v1 info-hash or magnet results with optional file selection. You supply configured add-ons; DMC does not bundle a movie/TV torrent index or a paid resolver account. A catalogue entry is not a promise of a playable source. Add-ons requiring custom HTTP headers, DRM, external players, archives or unsupported filters are not playable here. Availability and access depend on the source and provider.

## What happens when I play a torrent source?

Only the selected video is streamed through a temporary local endpoint into the VLC engine. DMC needs available peers, metadata and enough disk space; buffering and seeking can take time. BitTorrent uses peer-to-peer connections, so peers and trackers can see your IP address and torrent activity. Uploading can occur while the video is open, including while paused. Selected videos are limited to 32 GiB and total torrent size to 64 GiB. Stop/Close media, switching source, reaching the end or closing DMC stops the torrent engine and removes its owned temporary cache. After a crash, marked inactive cache folders are removed when the next torrent starts. DMC is not a VPN or anonymity service. Use sources you are entitled to access.

## Can I watch an add-on source with friends?

From version 2.9, selected add-on video files, including torrent sources, can use Watch together. DMC proxies the selected video through the host's existing encrypted room, so guests receive a temporary room media ID rather than the add-on's configured address or signed media URL. The host needs upload bandwidth for each guest. A torrent still depends on peers, buffering and the host's disk space. Add-on HLS/DASH playlists are not shared; leave the room to watch those locally. Normal direct streams opened outside the add-on browser continue to share their full media address. YouTube sources use the existing independent-player synchronization.

## Which files and links can I play?

The VLC engine handles many common video and audio formats, including MP4, MKV, AVI, MOV, MP3 and FLAC. Open stream accepts direct media links, including supported HTTP/HLS and RTSP streams. YouTube links open in the embedded browser; use Services for other supported website watch pages. A file still needs a supported codec and a usable source.

## Does everything I watch go into a queue or history?

No. Opening a file or direct stream, dropping it on the player, or opening it from Windows plays it on its own. Those ordinary opens are not saved as a playback history. Showing the queue does not enable automatic additions. Choose File → Add to queue, then Add files…, Add stream… or Add current item when you want to keep an item. A manual queue survives a restart; lists from older automatic-queue versions are not restored.

## When does the queue play the next item?

Double-click a queue entry to start queue playback; the next queued item then plays when it ends. A video opened on its own stops at the end, even when a queue is visible. Adding the current video to the queue does not restart it or turn its current standalone playback into queue playback. Adding, removing or clearing queue entries does not interrupt the video already playing.

## Can I watch and search YouTube inside DMC Player?

Choose File → YouTube to open YouTube inside the player and use its normal search. You can also paste an HTTPS YouTube watch, Shorts, live, playlist or youtu.be share link into Open stream. Video, playlist and timestamp details stay in the address during ordinary browsing. Use YouTube's video fullscreen control, then Ctrl+Alt+O to watch in mini mode. From version 2.7, Watch together can synchronize a public video's play/pause, position and rate. Each person loads YouTube independently with their own access; DMC Player does not extract or relay YouTube video bytes or share account sessions. Playback and Google sign-in depend on YouTube's rules; account access is not guaranteed or automated.

## How do I watch YouTube with friends?

Update both players to DMC Player 2.7 or later. Start an actual YouTube video, then choose Tools → Watch together → Host and send the invite link. Home, search, account and playlist-only pages cannot be hosted. The session shares the video's canonical public URL, its title and playback state; extra URL parameters, cookies and sign-ins are not shared. Each guest opens the normal YouTube page independently. Ads, loading, autoplay and regional or account restrictions can delay playback; wait for ads to finish and press Play in YouTube if needed. The host controls synchronization; enabled guest requests from DMC's controls can change play/pause, seek and rate. Subscription websites remain unsupported by Watch together.

## Can I watch Netflix, Prime Video or Disney+?

Services opens the provider's site inside the player using standard WebView2. Sign in with your own account. Playback depends on the provider's embedded-browser, DRM, account, device and output rules; listing a service does not guarantee every title will play. DMC Player does not bypass these rules or supply subscriptions. The WebView2 sign-in profile is separate from your normal browser.

## Where does the Disney+ button open?

From version 2.8, Disney+ opens its official UK sign-in page directly. Pasting a bare Disney+ homepage address uses that entry point too; specific title links and login steps are preserved. Public sign-in-page navigation was checked without entering an account. That check does not verify signing in or protected programme playback. Complete sign-in yourself; Disney+'s browser, account and playback rules still apply.

## How do I find live TV and free channels?

Choose File → Live TV, search or filter the channel list and press Watch channel. Direct channels play in the VLC engine, with DMC's normal volume and mini controls. Open More channels / import a playlist for the optional UK and English community lists from IPTV-org, an M3U file or a playlist URL. Community entries are public submitted links, not broadcaster-verified listings; availability, adverts and location restrictions vary. Add to favourites saves a channel separately from the play queue. File → Streaming services opens official provider websites when a service requires its own web player.

## Can I get all my Freeview channels here?

A Freeview TV receives many channels through its aerial and tuner. That does not mean each channel has an unrestricted internet stream. BBC iPlayer, ITVX and similar services may require their own signed-in player. If you already have a network TV tuner or Tvheadend server, import its M3U channel-list URL in Live TV to play its supported channels directly. DMC Player does not turn a PC without TV tuner hardware into an aerial receiver.

## Will every TV channel or service play here?

No. A public stream can stop working, restrict your country or require a different player. Community lists are not a guarantee of availability, permission or a complete Freeview lineup. Protected service websites use WebView2 and their DRM, account and subscription rules still apply; DMC Player does not guarantee embedded playback. Live viewing may have local TV licence requirements. The app does not bypass sign-in, location or content protection. YouTube video playback can be synchronized from version 2.7, with each person loading YouTube independently; subscription websites are not relayed or synchronized. Imported channel directives for DRM keys, cookies and custom player options are not executed.

## How do I put the picture over FiveM?

Use FiveM in borderless windowed mode, then press Ctrl+Alt+O. Drag the mini picture to move it and stretch its edges to resize. Double-click, or press Ctrl+Alt+O again, to restore the full player. For a service, first use its own video fullscreen control so the video fills the embedded view.

## How do I use fullscreen and the right-click menu?

From version 2.10.3, double-click the video or use the fullscreen button over the picture or on the bottom toolbar. Right-click the player and choose Full screen, use View → Fullscreen, or press F11. The player fills the display and hides its window controls. Moving the mouse reveals play/pause, skip, sound, exit and a timeline with elapsed time and duration. Click or drag the timeline to seek in a movie; the controls hide after about 2.5 seconds without movement, and stay visible during interaction. Live or unseekable sources do not offer arbitrary seeking. Embedded websites expose a DMC timeline only when their media timing and seekable ranges are accessible; use the provider's own controls otherwise. Press F11 again, double-click, click the exit button or press Escape to restore the previous normal or maximized window. Choosing mini mode leaves fullscreen, and choosing fullscreen leaves mini mode. In mini mode, double-click restores the normal player.

## How do I stop accidental clicks while gaming?

Press Ctrl+Alt+L to lock the mini player. Clicks then pass through to the game, and hover controls disappear. Press Ctrl+Alt+L again to unlock. The lock cannot be enabled if Windows could not reserve that unlock shortcut. Restoring full size also unlocks the player.

## Where did the mini controls go?

They appear when the pointer is over the unlocked mini picture and collapse when you move away. They stay hidden while click-through is locked. The skip buttons move ten seconds for files and direct streams; service commands require an accessible media element and may be restricted by the provider or a separate-origin frame.

## Why is the picture behind my game or blank?

Exclusive fullscreen games can cover ordinary always-on-top desktop windows; switch the game to borderless windowed mode. For a service, check that the installed WebView2 Runtime is available and that its own page can start playback. DRM or output restrictions can prevent a protected picture from appearing. A valid login alone does not remove those restrictions.

## How can friends watch with me over the internet?

Open a file or direct stream, or start a YouTube video, then choose Tools → Watch together and press Host. Choose Copy link when the invitation is ready and send it to friends. Use DMC Player 2.7 or later on both players for YouTube synchronization. An installed copy opens invite links; otherwise, select Join and paste the link. A host can have up to eight guests. Keep the host player open while watching. Stopping hosting expires the link. Free test links last up to 60 minutes; start a new room to keep watching.

## How do I chat while watching with friends?

Use DMC Player 2.8 or later on both players. While connected, choose Chat in Watch together, or press Ctrl+Alt+C if Windows could reserve the shortcut. Type up to 280 characters and press Enter to send. The composer closes after a successful send; Escape closes it without sending. Up to three plain-text messages appear over the video and fade after about six seconds. Incoming messages do not take keyboard focus or intercept clicks. Turn off Show messages over video to hide the overlay on your own player; this does not stop the room receiving messages. The app does not automatically save a transcript or replay earlier messages to late joiners. Other participants can still copy or record what they receive.

## Is the automatic relay always available?

Automatic hosting uses a free test relay for this pre-release build. The current Pinggy free relay limits sessions to up to 60 minutes. Start a new room to keep watching afterward. Availability, speed and capacity are not guaranteed, and a session can disconnect if the relay stops. No relay account is required. Configure and operate your own relay before a public release or when you need a dependable service. Advanced direct connection remains available as an alternative.

## Can I use a direct connection instead?

Expand Advanced direct connection in Watch together. Internet mode needs a public address and a forwarded TCP port (52180 by default), with the firewall allowing that port. LAN/VPN mode works when friends can reach your PC on that network. Choose Host with direct connection to use those settings instead of the automatic relay.

## Do friends need the file or a subscription?

Local media streams from the host, so guests do not need their own copy; the host needs upload capacity for each guest. For a direct network stream, every guest needs permission to open that source. For YouTube, each person loads the normal video page independently and needs their own access; no account session or video bytes are sent from the host. Embedded subscription services are not relayed or synchronized by Watch together. Volume, subtitles and window size remain local.

## How do I make DMC Player my default media app?

Install DMC Player with Setup so Windows knows its supported file types. Then choose Tools → Default media player, or open Windows Settings, find DMC Player and choose the file types you want it to open. Windows keeps the final choice with you. The portable player does not register itself or force default associations.

## Where are my queue and service sign-ins stored?

Player data normally lives in %LOCALAPPDATA%\DMC Player. If an older %LOCALAPPDATA%\Sidecar folder exists and the new folder contains neither a library.json file nor a WebProfile folder, the player keeps using Sidecar. An empty new folder or Relay-only metadata does not change that choice. The library.json file stores your manually chosen queue, its resume positions, volume and preferences, including full queued stream addresses. Older automatic-queue lists are not restored. Explicitly loaded TV lists and favourites are saved separately in tv-channels.json and tv-favorites.json, including their full stream addresses. Watching a channel does not create history or add it to the queue. WebProfile stores the browser session; DMC Player does not read your account passwords or cookies.

## Why are a global shortcut or mouse lock unavailable?

Another application may already own the key combination. Close an older DMC Player or Sidecar instance, or the conflicting application, then restart the player. Additional normal launches of DMC Player send their files to the existing instance. Mouse lock stays disabled when the unlock shortcut is unavailable.

## How do I update, and why might Windows warn about Setup?

DMC Player checks its public release information when it starts and every six hours while it remains open. When a newer version is available, an Update button appears beside the menu in the full player; mini mode stays clear. Choose Help → Check for updates to check manually. Download update saves the installer and verifies its size and published SHA-256; Install update verifies it again, opens Setup and closes the player, ending any watch session. Choose when to install and relaunch the player after Setup. Your saved queue, channels and service sign-ins are retained. DMC Player and its updates are free. The installer is currently unsigned, so Windows may show an unknown-publisher or reputation warning. Nothing is silently downloaded or installed. Versions before 2.6 need a manual update from the DMC Player download website to get this feature.

