var EventEmitter = require('eventemitter3');

var Types = {
  HLS: 1,
  DASH: 2,
  VIDEO: 3
}

/**
 * Supports regular video URLs (eg. mp4), as well as adaptive manifests like
 * DASH (.mpd) and soon HLS (.m3u8).
 *
 * Events:
 *   load(video): When the video is loaded.
 *   error(message): If an error occurs.
 *
 * To play/pause/seek/etc, please use the underlying video element.
 */
function AdaptivePlayer() {
  this.video = document.createElement('video');
}
AdaptivePlayer.prototype = new EventEmitter();

AdaptivePlayer.prototype.load = function(url) {
  var self = this;
  this.initShaka_().then(function () {
    // TODO(smus): Investigate whether or not differentiation is best done by
    // mimeType after all. Cursory research suggests that adaptive streaming
    // manifest mime types aren't properly supported.
    //
    // For now, make determination based on extension.
    var extension = Util.getExtension(url);
    switch (extension) {
      case 'm3u8': // HLS
        self.type = Types.HLS;
        if (Util.isIOS()) {
          self.loadVideo_(url).then(function() {
            self.emit('load', self.video);
          }).catch(self.onError_.bind(self));
        } else {
          self.onError_('HLS is only supported on iOS.');
        }
        break;
      case 'mpd': // MPEG-DASH
        self.type = Types.DASH;
        self.player.load(url).then(function() {
          console.log('The video has now been loaded!');
          self.emit('load', self.video);
        }).catch(self.onError_.bind(self));
        break;
      default: // A regular video, not an adaptive manifest.
        self.type = Types.VIDEO;
        self.loadVideo_(url).then(function() {
          self.emit('load', self.video);
        }).catch(self.onError_.bind(self));
        break;
    }
  });
};

AdaptivePlayer.prototype.destroy = function() {
  this.video.pause();
  this.video.src = '';
  this.video = null;
};

/*** PRIVATE API ***/

AdaptivePlayer.prototype.initShaka_ = function() {
  var self = this;
  return new Promise (function(resolve, reject) {
    // Load the Shaka player only on demand.
    var script = document.createElement('script');
    script.src = 'node_modules/shaka-player/dist/shaka-player.compiled.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  }).then(function() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      console.error('Shaka is not supported on this browser.');
    }

    self.player = new shaka.Player(self.video);

    // Listen for error events.
    self.player.addEventListener('error', self.onError_);
  }, this.onError_);
};

AdaptivePlayer.prototype.onError_ = function(e) {
  console.error(e);
  this.emit('error', e);
};

AdaptivePlayer.prototype.loadVideo_ = function(url) {
  var video = this.video;
  return new Promise(function(resolve, reject) {
    video.loop = true;
    video.src = url;
    // Enable inline video playback in iOS 10+.
    video.setAttribute('playsinline', true);
    video.setAttribute('crossorigin', 'anonymous');
    video.addEventListener('canplaythrough', resolve);
    video.addEventListener('error', reject);
    video.load();
  });
};

module.exports = AdaptivePlayer;
