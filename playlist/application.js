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
  this.replayButton_ = document.getElementById('replay');
  this.replayButton_.addEventListener(
      'click',
      this.bind_(this, this.onReplay_),
      false);
  this.fullscreenButton_ = document.getElementById('fullscreen');
  this.fullscreenButton_.addEventListener(
      'click',
      this.bind_(this, this.onFullscreenClick_),
      false);

  var playlistDiv = document.getElementById('playlistDiv');
  var playlistItems = playlistDiv.childNodes;
  for (var i = 0; i < playlistItems.length; i++) {
    if (playlistItems[i].tagName == 'DIV') {
      playlistItems[i].addEventListener(
          'click',
          this.bind_(this, this.onPlaylistItemClick_),
          false);
    }
  }

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

  this.initialUserActionHappened_ = false;
  this.playing_ = false;
  this.adsActive_ = false;
  this.adsDone_ = false;
  this.fullscreen = false;

  this.videoPlayer_ = new VideoPlayer();
  this.ads_ = new Ads(this, this.videoPlayer_);
  this.adTagUrl_ = 'https://pubads.g.doubleclick.net/' +
      'gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&' +
      'ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&' +
      'unviewed_position_start=1&' +
      'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

  this.videoEndedCallback_ = this.bind_(this, this.onContentEnded_);
  this.setVideoEndedCallbackEnabled(true);

};

Application.prototype.setVideoEndedCallbackEnabled = function(enable) {
  if (enable) {
    this.videoPlayer_.registerVideoEndedCallback(this.videoEndedCallback_);
  } else {
    this.videoPlayer_.removeVideoEndedCallback(this.videoEndedCallback_);
  }
};

Application.prototype.switchButtonToReplay = function() {
  this.playButton_.style.display = 'none';
  this.replayButton_.style.display = 'block';
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
  this.playing_ = false;
  this.updateChrome_();
};

Application.prototype.bind_ = function(thisObj, fn) {
  return function() {
    fn.apply(thisObj, arguments);
  };
};

Application.prototype.onClick_ = function() {
  if (!this.adsDone_) {

    if (!this.initialUserActionHappened_) {
      // The user clicked/tapped - inform the ads controller that this code
      // is being run in a user action thread.
      this.ads_.initialUserAction();
      this.initialUserActionHappened_ = true;
    }
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

Application.prototype.onReplay_ = function() {
  this.switchButtonToPlay_();
  this.videoPlayer_.preloadContent(this.bind_(this, this.loadAds_));
  this.adsDone_ = true;
};

Application.prototype.switchButtonToPlay_ = function() {
  this.replayButton_.style.display = 'none';
  this.playButton_.style.display = 'block';
};

Application.prototype.onFullscreenClick_ = function() {
  if (this.fullscreen) {
    // The video is currently in fullscreen mode
    var cancelFullscreen = document.exitFullscreen ||
        document.exitFullScreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen;
    if (cancelFullscreen) {
      cancelFullscreen.call(document);
    } else {
      this.onFullscreenChange_();
    }
  } else {
    // Try to enter fullscreen mode in the browser
    var requestFullscreen = document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.mozRequestFullscreen ||
        document.documentElement.requestFullScreen ||
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
  this.videoPlayer_.removePreloadListener();
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

Application.prototype.onPlaylistItemClick_ = function(event) {
  // Terms of Service says we can't kill an ad prematurely, so we will only
  // switch videos if there isn't an ad playing.
  if (!this.ads_.linearAdPlaying) {
    this.ads_.destroyAdsManager();
    this.ads_.contentCompleted();
    if (!this.initialUserActionHappened_) {
      this.ads_.initialUserAction();
      this.initialUserActionHappened_ = true;
    }
    this.adsDone_ = true;
    this.videoPlayer_.setContentVideoIndex(event.target.id);
    this.videoPlayer_.preloadContent(this.bind_(this, this.loadAds_));
  }
};
