# TV and streaming catalogue

Checked 5 November 2026. The catalogue links to official websites inside DMC Player. These are viewing destinations, not extracted media URLs, a programme search index, or a guarantee that protected titles will play in WebView2. The broadcaster's accounts, subscriptions, location rules and supported-device requirements apply.

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
| Disney+ | [Official website](https://www.disneyplus.com/). Subscription and provider playback requirements apply. |

No stable broadcaster-documented external-player HLS feed was verified for this release. The app therefore opens the official player rather than recycling unverified IPTV playlists. It does not extract account cookies, remove adverts, or change DRM or geographical controls. WebView2 uses its normal native rendering; [Microsoft documents the protected-video limitation of the separate composition control](https://learn.microsoft.com/en-us/dotnet/api/microsoft.web.webview2.wpf.webview2compositioncontrol), which DMC Player does not use.

Catalogue and UI tests use local data and callbacks. The separate opt-in public navigation report, when run, measures only whether selected public home pages loaded in an isolated WebView2 profile. Account login, live broadcasts, and protected programme playback are separate checks and must not be inferred from page navigation.
