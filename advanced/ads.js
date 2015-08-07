// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

/**
 * Shows how to use the IMA SDK to request and display ads.
 */
var Ads = function(application, videoPlayer) {
  this.application_ = application;
  this.videoPlayer_ = videoPlayer;
  this.customClickDiv_ = document.getElementById('customClick');
  this.contentCompleteCalled_ = false;
  google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
  // Call setLocale() to localize language text and downloaded swfs
  // google.ima.settings.setLocale('fr');
  this.adDisplayContainer_ =
      new google.ima.AdDisplayContainer(
          this.videoPlayer_.adContainer,
          this.videoPlayer_.contentPlayer,
          this.customClickDiv_);
  this.adsLoader_ = new google.ima.AdsLoader(this.adDisplayContainer_);
  this.adsManager_ = null;

  this.adsLoader_.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded_,
      false,
      this);
  this.adsLoader_.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError_,
      false,
      this);
};

// On iOS and Android devices, video playback must begin in a user action.
// AdDisplayContainer provides a initialize() API to be called at appropriate
// time.
// This should be called when the user clicks or taps.
Ads.prototype.initialUserAction = function() {
  this.adDisplayContainer_.initialize();
  this.videoPlayer_.contentPlayer.load();
};

Ads.prototype.requestAds = function(adTagUrl) {
  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = adTagUrl;
  adsRequest.linearAdSlotWidth = this.videoPlayer_.width;
  adsRequest.linearAdSlotHeight = this.videoPlayer_.height;
  adsRequest.nonLinearAdSlotWidth = this.videoPlayer_.width;
  adsRequest.nonLinearAdSlotHeight = this.videoPlayer_.height;
  this.adsLoader_.requestAds(adsRequest);
};

Ads.prototype.pause = function() {
  if (this.adsManager_) {
    this.adsManager_.pause();
  }
};

Ads.prototype.resume = function() {
  if (this.adsManager_) {
    this.adsManager_.resume();
  }
};

Ads.prototype.resize = function(width, height) {
  if (this.adsManager_) {
    this.adsManager_.resize(width, height, google.ima.ViewMode.FULLSCREEN);
  }
};

Ads.prototype.contentEnded = function() {
  this.contentCompleteCalled_ = true;
  this.adsLoader_.contentComplete();
};

Ads.prototype.onAdsManagerLoaded_ = function(adsManagerLoadedEvent) {
  this.application_.log('Ads loaded.');
  var adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  this.adsManager_ = adsManagerLoadedEvent.getAdsManager(
      this.videoPlayer_.contentPlayer, adsRenderingSettings);
  this.processAdsManager_(this.adsManager_);
};

Ads.prototype.processAdsManager_ = function(adsManager) {
  if (adsManager.isCustomClickTrackingUsed()) {
    this.customClickDiv_.style.display = 'table';
  }
  // Attach the pause/resume events.
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      this.onContentPauseRequested_,
      false,
      this);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      this.onContentResumeRequested_,
      false,
      this);
  // Handle errors.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError_,
      false,
      this);
  var events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                google.ima.AdEvent.Type.CLICK,
                google.ima.AdEvent.Type.COMPLETE,
                google.ima.AdEvent.Type.FIRST_QUARTILE,
                google.ima.AdEvent.Type.LOADED,
                google.ima.AdEvent.Type.MIDPOINT,
                google.ima.AdEvent.Type.PAUSED,
                google.ima.AdEvent.Type.STARTED,
                google.ima.AdEvent.Type.THIRD_QUARTILE];
  for (var index in events) {
    adsManager.addEventListener(
        events[index],
        this.onAdEvent_,
        false,
        this);
  }

  var initWidth, initHeight;
  if (this.application_.fullscreen) {
    initWidth = this.application_.fullscreenWidth;
    initHeight = this.application_.fullscreenHeight;
  } else {
    initWidth = this.videoPlayer_.width;
    initHeight = this.videoPlayer_.height;
  }
  adsManager.init(
    initWidth,
    initHeight,
    google.ima.ViewMode.NORMAL);

  adsManager.start();
};

Ads.prototype.onContentPauseRequested_ = function() {
  this.application_.pauseForAd();
  this.application_.setVideoEndedCallbackEnabled(false);
};

Ads.prototype.onContentResumeRequested_ = function() {
  this.application_.setVideoEndedCallbackEnabled(true);
  // Without this check the video starts over from the beginning on a
  // post-roll's CONTENT_RESUME_REQUESTED
  if (!this.contentCompleteCalled_) {
    this.application_.resumeAfterAd();
  }
};

Ads.prototype.onAdEvent_ = function(adEvent) {
  this.application_.log('Ad event: ' + adEvent.type);

  if (adEvent.type == google.ima.AdEvent.Type.CLICK) {
    this.application_.adClicked();
  } else if (adEvent.type == google.ima.AdEvent.Type.LOADED) {
    var ad = adEvent.getAd();
    if (!ad.isLinear())
    {
      this.onContentResumeRequested_();
    }
  }
};

Ads.prototype.onAdError_ = function(adErrorEvent) {
  this.application_.log('Ad error: ' + adErrorEvent.getError().toString());
  if (this.adsManager_) {
    this.adsManager_.destroy();
  }
  this.application_.resumeAfterAd();
};
