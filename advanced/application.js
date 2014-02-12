// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

/**
 * Handles user interaction and creates the player and ads controllers.
 */
var Application = function() {
  this.console_ = document.getElementById('console');
  this.playButton_ = document.getElementById('playpause');
  this.playButton_.addEventListener(
      'click',
      this.bind_(this, this.onClick_),
      false);
  this.fullscreenButton_ = document.getElementById('fullscreen');
  this.fullscreenButton_.addEventListener(
      'click',
      this.bind_(this, this.onFullscreenClick_),
      false);

  this.fullscreenWidth = null;
  this.fullscreenHeight = null;

  var fullScreenEvents = [
      'fullscreenchange',
      'mozfullscreenchange',
      'webkitfullscreenchange'];
  for (key in fullScreenEvents) {
    document.addEventListener(
        fullScreenEvents[key],
        this.bind_(this, this.onFullscreenChange_),
        false);
  }

  this.playing_ = false;
  this.adsActive_ = false;
  this.adsDone_ = false;
  this.fullscreen = false;

  this.videoPlayer_ = new VideoPlayer();
  this.ads_ = new Ads(this, this.videoPlayer_);
  this.adTagUrl_ = 'http://pubads.g.doubleclick.net/gampad/ads?sz=400x300&iu=%2F6062%2Fiab_vast_samples&ciu_szs=300x250%2C728x90&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]&cust_params=iab_vast_samples%3Dlinear';

  this.videoPlayer_.registerVideoEndedCallback(
      this.bind_(this, this.onContentEnded_));
};

Application.prototype.log = function(message) {
  console.log(message);
  this.console_.innerHTML = this.console_.innerHTML + '<br/>' + message;
};

Application.prototype.resumeAfterAd = function() {
  this.videoPlayer_.play();
  this.adsActive_ = false;
  this.updateChrome_();
};

Application.prototype.pauseForAd = function() {
  this.adsActive_ = true;
  this.playing_ = true;
  this.videoPlayer_.pause();
  this.updateChrome_();
};

Application.prototype.adClicked = function() {
  this.updateChrome_();
};

Application.prototype.bind_ = function(thisObj, fn) {
  return function() {
    fn.apply(thisObj, arguments);
  };
};

Application.prototype.onClick_ = function() {
  if (!this.adsDone_) {

    // The user clicked/tapped - inform the ads controller that this code
    // is being run in a user action thread.
    this.ads_.initialUserAction();
    // At the same time, initialize the content player as well.
    // When content is loaded, we'll issue the ad request to prevent it
    // from interfering with the initialization. See
    // https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/ads#iosvideo
    // for more information.
    this.videoPlayer_.preloadContent(this.bind_(this, this.loadAds_));
    this.adsDone_ = true;
    return;
  }

  if (this.adsActive_) {
    if (this.playing_) {
      this.ads_.pause();
    } else {
      this.ads_.resume();
    }
  } else {
    if (this.playing_) {
      this.videoPlayer_.pause();
    } else {
      this.videoPlayer_.play();
    }
  }

  this.playing_ = !this.playing_;

  this.updateChrome_();
};

Application.prototype.onFullscreenClick_ = function() {
  if (this.fullscreen) {
    // The video is currently in fullscreen mode
    var cancelFullscreen = document.exitFullScreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen;
    if (cancelFullscreen) {
      cancelFullscreen.call(document);
    } else {
      this.onFullscreenChange_();
    }
  } else {
    // Try to enter fullscreen mode in the browser
    var requestFullscreen = document.documentElement.requestFullScreen ||
        document.documentElement.webkitRequestFullScreen ||
        document.documentElement.mozRequestFullScreen;
    if (requestFullscreen) {
      this.fullscreenWidth = window.screen.width;
      this.fullscreenHeight = window.screen.height;
      requestFullscreen.call(document.documentElement);
    } else {
      this.fullscreenWidth = window.innerWidth;
      this.fullscreenHeight = window.innerHeight;
      this.onFullscreenChange_();
    }
  }
  requestFullscreen.call(document.documentElement);
};

Application.prototype.updateChrome_ = function() {
  if (this.playing_) {
    this.playButton_.textContent = 'II';
  } else {
    // Unicode play symbol.
    this.playButton_.textContent = String.fromCharCode(9654);
  }
};

Application.prototype.loadAds_ = function() {
  this.ads_.requestAds(this.adTagUrl_);
};

Application.prototype.onFullscreenChange_ = function() {
  if (this.fullscreen) {
    // The user just exited fullscreen
    // Resize the ad container
    this.ads_.resize(
        this.videoPlayer_.width,
        this.videoPlayer_.height);
    // Return the video to its original size and position
    this.videoPlayer_.resize(
        'relative',
        '',
        '',
        this.videoPlayer_.width,
        this.videoPlayer_.height);
    this.fullscreen = false;
  } else {
    // The fullscreen button was just clicked
    // Resize the ad container
    var width = this.fullscreenWidth;
    var height = this.fullscreenHeight;
    this.makeAdsFullscreen_();
    // Make the video take up the entire screen
    this.videoPlayer_.resize('absolute', 0, 0, width, height);
    this.fullscreen = true;
  }
};

Application.prototype.makeAdsFullscreen_ = function() {
  this.ads_.resize(
      this.fullscreenWidth,
      this.fullscreenHeight);
};

Application.prototype.onContentEnded_ = function() {
  this.ads_.contentEnded();
};
