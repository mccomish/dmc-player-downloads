# TV and streaming catalogue

Checked 5 November 2026. **File → Live TV** opens a direct channel browser. Selecting a channel and pressing Watch channel sends its media URL to the native VLC player. **File → Streaming services** retains the separate directory of official provider websites.

## Built-in direct channels

The starter list contains nine broadcaster-origin feeds. The exact feed addresses and primary-source provenance are recorded below. Public availability can change by location, programme, CDN policy or broadcaster decision; a successful check is not an uptime or future-playback guarantee.

| Channel | Official source and provenance | Direct media URL |
| --- | --- | --- |
| Sky News | [Official viewing page](https://news.sky.com/watch-live). Full ad-supported dynamic stream URL in the official live-page HTML; query parameters retained. | [HLS stream](https://linear901-oo-hls0-prd-gtm.delivery.skycdp.com/v1/master/6404a5d732e04991ed59ac7790b61cc065c9aabd/prod-gb-lin-skynews-hls-25-web/master.m3u8?ads.cdn=https://linear901-oo-hls0-prd-gtm.delivery.skycdp.com&ads.csid=sitesection:SkyNews:Web&manifest.mthost=7a38d30e7dd84cd0872ab4f691c38f58&manifest.region=mediatailor.eu-west-1.amazonaws.com) |
| DW English | [Official viewing page](https://www.dw.com/en/live-tv/channel-english). HLS master URL embedded in the official live-page HTML. | [HLS stream](https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8) |
| NHK WORLD-JAPAN | [Official viewing page](https://www3.nhk.or.jp/nhkworld/en/live_tv/). The official live-page script references [hlslive_web.json](https://livepl.nhkworld.jp/hlslive_web.json), whose main.jstrm value is the stream URL. | [HLS stream](https://masterpl.hls.nhkworld.jp/hls/w/live/master.m3u8) |
| TRT World | [Official viewing page](https://www.trtworld.com/live). English live feed embedded in the official live-page HTML. | [HLS stream](https://tv-trtworld.medya.trt.com.tr/master.m3u8) |
| CGTN Documentary | [Official viewing page](https://www.cgtn.com/channel/documentary). Its official player script loads [channel-doc.json](https://news.cgtn.com/tv/channel-doc.json); the first data entry is the direct stream. | [HLS stream](https://english-livebkali.cgtn.com/live/doccgtn.m3u8) |
| Bloomberg Europe | [Official viewing page](https://www.bloomberg.com/live/europe). HLS manifest served directly from the broadcaster's www.bloomberg.com origin. | [HLS stream](https://www.bloomberg.com/media-manifest/streams/eu.m3u8) |
| Classic Arts Showcase | [Official viewing page](https://www.classicartsshowcase.org/watch-classic-arts-showcase/). HLS master URL embedded in the official viewing page. Classical music, ballet, opera and arts. | [HLS stream](https://classicarts.akamaized.net/hls/live/1024257/CAS/master.m3u8) |
| FashionTV Paris L Original | [Official viewing page](https://www.fashiontv.com/). Official site data marks this stream is_live_streaming:true. Fashion and lifestyle; portrait content may be letterboxed. | [HLS stream](https://ftv1.b-cdn.net/bfdbb576-83f7-11f0-9f89-0200170e3e04_1000028043_HLS/manifest.m3u8) |
| TRT Arabi | [Official viewing page](https://www.trtworld.com/live). Arabic live feed embedded alongside the English feed in the official live-page HTML. | [HLS stream](https://tv-trtarabi.medya.trt.com.tr/master.m3u8) |

Each listed master manifest and a child media playlist returned HTTP 200, and a small media-segment sample returned HTTP 206 during source checks. All nine feeds used no encryption: DW and Sky contained an explicit EXT-X-KEY METHOD=NONE declaration; the others contained no key declaration. These HTTP checks do not by themselves prove decoded playback in DMC Player. Separate native VLC playback checks are recorded in the release's test reports when performed. No account cookies, altered access headers, location bypass or removed advertising were used for these checks. DMC Player plays the original feed from its source; the catalogue does not copy or host the video.

## More channels and imported lists

The Live TV browser offers explicit buttons to load community-maintained UK and English-language lists. Nothing is fetched from these lists until the user chooses to load one. The [IPTV-org project](https://github.com/iptv-org/iptv) publishes lists for streaming players and describes them as user-submitted links to publicly available streams.

| Optional list | Address | Entries when checked |
| --- | --- | ---: |
| UK | [M3U channel list](https://iptv-org.github.io/iptv/countries/uk.m3u) | 304 |
| English-language | [M3U channel list](https://iptv-org.github.io/iptv/languages/eng.m3u) | 3,043 |

These counts describe playlist entries, not guaranteed unique, working or locally available channels. A channel may have multiple quality feeds or regional variants; URLs can stop working, be geo-restricted or require an official player. Community entries are labelled as such and have not been individually verified by DMC Player. The project's playlist licence does not grant rights to the TV programmes. Broadcaster requirements still apply.

Users can also import an M3U/M3U8 channel-list file or load an HTTP/HTTPS M3U address supplied by their own provider or network TV tuner. Channel lists stay separate from the optional playback queue. Opening a channel does not add it to that queue. A single HLS manifest is a media stream rather than a channel list; use File ? Open stream for that address.

## Freeview and an aerial lineup

[Freeview explains](https://www.freeview.co.uk/help/what-is-freeview) that its broadcast service uses an aerial and a receiver. Having a channel on a Freeview TV does not mean the broadcaster publishes a permanent unauthenticated internet feed. Freeview's [PC/laptop instructions](https://www.freeview.co.uk/watch-on-your-device) direct viewers to the channels' official players.

To watch an existing household aerial lineup directly in a software player, a compatible network tuner can provide local streams. For example, the [HDHomeRun HTTP API](https://info.hdhomerun.com/info/http_api) documents a lineup.m3u channel list and per-channel HTTP video URLs. In Live TV, load the M3U address for the user's own tuner on their local network. DMC Player does not discover, tune or configure tuner hardware in this release, and no physical tuner or aerial reception was tested. USB tuner driver integration is not included. Device support, channel availability and any licence or protected-channel requirements remain with the tuner/broadcaster.

BBC iPlayer, ITVX, STV and other account-based or protected services remain available through Streaming services. The direct starter list does not promise their full Freeview lineups. It does not extract protected stream URLs or remove sign-in, subscription, geographical or DRM controls.

## Official streaming websites

The following separate directory contains official viewing destinations rather than direct media feeds. Opening one uses WebView2 inside DMC Player. Provider accounts, subscriptions, location rules and supported-device requirements apply. A listing does not guarantee signed-in protected programme playback.

| Provider | Official destination / supporting information |
| --- | --- |
| BBC iPlayer | [Home](https://www.bbc.co.uk/iplayer), [BBC One live](https://www.bbc.co.uk/iplayer/live/bbcone). The live destination is linked by [Freeview](https://www.freeview.co.uk/watch-on-your-device). [BBC programmes and live-TV licensing](https://www.tvlicensing.co.uk/faqs/FAQ33). |
| ITVX | [Home and live TV](https://www.itv.com/watch), [supported desktop browsers](https://help.itv.com/support/solutions/articles/204000073723-what-browsers-are-supported-). Desktop Edge support is not certification of an embedded host. |
| STV Player | [Home](https://player.stv.tv/), [live](https://player.stv.tv/live), [live availability and regional rules](https://support.stv.tv/support/what-live-streams-are-available). STV/STV+1 live access depends on the broadcast region; premium channels have separate requirements. |
| Channel 4 | [Home](https://www.channel4.com/), [live](https://www.channel4.com/now/C4), with the live destination linked by [Freeview](https://www.freeview.co.uk/watch-on-your-device). |
| 5 | [Home](https://www.channel5.com/), [Channel 5 live](https://www.channel5.com/channels/channel-5), [free account](https://help.channel5.com/hc/en-gb/articles/200569472-How-to-Register-for-a-FREE-5-Account), [live channel list](https://help.channel5.com/hc/en-gb/articles/360000885337-Live-channels-on-5). |
| U | [Home](https://u.co.uk/), [FAQ](https://u.co.uk/help/faqs). Listed for on-demand viewing: U says live streaming was removed from its apps. |
| Pluto TV | [UK service](https://pluto.tv/gb/), [live guide](https://pluto.tv/gb/watch/live-tv/). Free viewing with ads; region redirects can change the path. |
| Plex | [Web player](https://watch.plex.tv/), [live guide](https://watch.plex.tv/live-tv), [live-TV FAQ](https://support.plex.tv/articles/faq-live-tv-on-plex/). Free channels are ad-supported and do not require Plex Pass. Pause/rewind is not offered for all live channels. |
| Rakuten TV | [UK service](https://www.rakuten.tv/uk), [live guide](https://www.rakuten.tv/uk/live-tv), [official first steps](https://help.rakuten.tv/hc/en-gb/articles/201547451-First-Steps-at-Rakuten-TV). Free/live sections have ads and may need sign-in; rentals are separate. |
| Tubi | [UK service](https://tubitv.com/en-gb/welcome). Listed for free on-demand movies and shows; the [live-TV help article](https://tubitv.com/help-center/Content/articles/24898743777435) is US-specific, so UK live availability is not promised. |
| Sky News | [Official live player](https://news.sky.com/watch-live). |
| France 24 English | [Official English live page](https://www.france24.com/en/live), [viewing information](https://howtowatch.france24.com/en/). |
| DW English | [Official live page](https://www.dw.com/en/live-tv/channel-english). |
| NASA+ | [NASA+](https://plus.nasa.gov/), [live coverage](https://www.nasa.gov/live/), [ways to watch](https://www.nasa.gov/ways-to-watch/). Live events follow NASA's schedule; the listing does not promise a continuous legacy NASA TV channel. |
| YouTube | [Official website](https://www.youtube.com/). |
| Netflix | [Official website](https://www.netflix.com/). Subscription and provider playback requirements apply. |
| Prime Video | [Official website](https://www.primevideo.com/). Membership, rentals and add-on subscriptions vary. |
| Disney+ | [Official UK sign-in page](https://www.disneyplus.com/en-gb/identity/login). The public sign-in page was checked in WebView2; account sign-in and protected programme playback were not tested. Subscription and provider playback requirements apply. |

WebView2 uses its normal native rendering; [Microsoft documents the protected-video limitation of the separate composition control](https://learn.microsoft.com/en-us/dotnet/api/microsoft.web.webview2.wpf.webview2compositioncontrol), which DMC Player does not use.

Catalogue and UI tests use local fixtures and callbacks. The separate opt-in public navigation report, when run, measures only whether selected public home pages loaded in an isolated WebView2 profile. Account login, live broadcasts and protected programme playback are separate checks and must not be inferred from page navigation.
