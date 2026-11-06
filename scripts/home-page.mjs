export function homePage({ download, downloadCounter, banner, frame, demo, arrow, releaseVersion }) {
  return `
<section class="home-hero shell">
  <div class="hero-copy">
    <p class="eyebrow">Free Windows media player</p>
    <h1>DMC Player</h1>
    <p class="hero-subtitle">Watch while you play.</p>
    <p class="hero-lead">Keep a film, a show or live TV in a small window over your game. Open your own files, stream links or streaming services, then move the picture where it suits you.</p>
    <div class="hero-actions">${download()}<a class="text-link" href="./features.html">How it works ${arrow}</a></div>
    ${downloadCounter()}
    <p class="hero-meta"><span data-version>Version ${releaseVersion}</span><span>Windows x64</span><span>Free to use</span></p>
  </div>
  ${demo}
</section>

<section class="shell home-overview">
  <div class="section-title"><h2>A media player built for gaming</h2></div>
  <div class="overview-columns">
    <div class="editorial-list">
      <article><div><h3>Resizable mini player</h3><p>Drag it to a corner and resize it to fit. Hover over the picture for playback and volume controls.</p></div></article>
      <article><div><h3>Click-through lock</h3><p>Press Ctrl + Alt + L to send mouse clicks through to your game. Press it again when you want to use the player.</p></div></article>
      <article><div><h3>Optional queue</h3><p>Opening a video plays it on its own. Add files to a queue yourself when you want to watch a few in order.</p></div></article>
    </div>
    ${frame('dmc-player.png', 'DMC Player desktop interface with file menus and playback controls.', 'The full player, with familiar menus and playback controls.')}
  </div>
</section>

<section class="explore-section">
  <div class="shell">
    <div class="section-title"><h2>More ways to watch</h2></div>
    <div class="explore-links">
      <a href="./add-ons.html"><h3>Films &amp; TV</h3><p>Browse titles and episodes, install compatible add-ons and choose a source.</p><span class="explore-more">Browse films and TV ${arrow}</span></a>
      <a href="./live-tv.html"><h3>Live TV</h3><p>Choose a direct channel stream, save favourites or import your own channel list.</p><span class="explore-more">Find channels ${arrow}</span></a>
      <a href="./watch-together.html"><h3>Watch together</h3><p>Host a session, send friends the invite link and chat over the video.</p><span class="explore-more">Watch with friends ${arrow}</span></a>
    </div>
  </div>
</section>
${banner('Download DMC Player')}`;
}
