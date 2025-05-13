// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

// [START init_player]
let adsManager;
let adsLoader;
let adDisplayContainer;
let isAdPlaying;
let isContentFinished;
let playButton;
let videoContent;
let adContainer;

// On window load, attach an event to the play button click
// that triggers playback of the video element.
window.addEventListener('load', function(event) {
  videoContent = document.getElementById('contentElement');
  adContainer = document.getElementById('adContainer');
  adContainer.addEventListener('click', adContainerClick);
  playButton = document.getElementById('playButton');
  playButton.addEventListener('click', playAds);
  setUpIMA();
});
// [END init_player]

// [START ima_setup]
/**
 * Sets up IMA ad display container, ads loader, and makes an ad request.
 */
function setUpIMA() {
  // Create the ad display container.
  createAdDisplayContainer();
  // Create ads loader.
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  // Listen and respond to ads loaded and error events.
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded, false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

  // An event listener to tell the SDK that our content video
  // is completed so the SDK can play any post-roll ads.
  const contentEndedListener = function() {
    // An ad might have been playing in the content element, in which case the
    // content has not actually ended.
    if (isAdPlaying) return;
    isContentFinished = true;
    adsLoader.contentComplete();
  };
  videoContent.onended = contentEndedListener;

  // Request video ads.
  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
      'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
      'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&' +
      'output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 400;

  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 150;

  adsLoader.requestAds(adsRequest);
}
// [END ima_setup]

// [START create_ad_display_container]
/**
 * Sets the 'adContainer' div as the IMA ad display container.
 */
function createAdDisplayContainer() {
  adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'), videoContent);
}
// [END create_ad_display_container]

// [START play_ads]
/**
 * Loads the video content and initializes IMA ad playback.
 */
function playAds() {
  // Initialize the container. Must be done through a user action on mobile
  // devices.
  videoContent.load();
  adDisplayContainer.initialize();

  try {
    // Initialize the ads manager. This call starts ad playback for VMAP ads.
    adsManager.init(640, 360);
    // Call play to start showing the ad. Single video and overlay ads will
    // start at this time; the call will be ignored for VMAP ads.
    adsManager.start();
  } catch (adError) {
    // An error may be thrown if there was a problem with the VAST response.
    videoContent.play();
  }
}
// [END play_ads]

// [START ads_loader_events]
/**
 * Handles the ad manager loading and sets ad event listeners.
 * @param {!google.ima.AdsManagerLoadedEvent} adsManagerLoadedEvent
 */
function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Get the ads manager.
  const adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  // videoContent should be set to the content video element.
  adsManager =
      adsManagerLoadedEvent.getAdsManager(videoContent, adsRenderingSettings);

  // Add listeners to the required events.
  // [START ads_manager_error_handler]
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  // [END ads_manager_error_handler]
  // [START ads_manager_play_pause_handlers]
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  // [END ads_manager_play_pause_handlers]
  // [START ads_manager_loaded_handler]
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded);
  // [END ads_manager_loaded_handler]
}

/**
 * Handles ad errors.
 * @param {!google.ima.AdErrorEvent} adErrorEvent
 */
function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  adsManager.destroy();
}
// [END ads_loader_events]

// [START ad_container_click]
/**
 * Handles clicks on the ad container to support expected play and pause
 * behavior on mobile devices.
 * @param {!Event} event
 */
function adContainerClick(event) {
  console.log("ad container clicked");
  if(videoContent.paused) {
    videoContent.play();
  } else {
    videoContent.pause();
  }
}
// [END ad_container_click]

// [START play_pause_responses]
/**
 * Pauses video content and sets up ad UI.
 */
function onContentPauseRequested() {
  isAdPlaying = true;
  videoContent.pause();
  // This function is where you should setup UI for showing ads (for example,
  // display ad timer countdown, disable seeking and more.)
  // setupUIForAds();
}

/**
 * Resumes video content and removes ad UI.
 */
function onContentResumeRequested() {
  isAdPlaying = false;
  if (!isContentFinished) {
    videoContent.play();
  }
  // This function is where you should ensure that your UI is ready
  // to play content. It is the responsibility of the Publisher to
  // implement this function when necessary.
  // setupUIForContent();
}
// [END play_pause_responses]

// [START ad_loaded_handler]
/**
 * Handles ad loaded event to support non-linear ads. Continues content playback
 * if the ad is not linear.
 * @param {!google.ima.AdEvent} adEvent
 */
function onAdLoaded(adEvent) {
  let ad = adEvent.getAd();
  if (!ad.isLinear()) {
    videoContent.play();
  }
}
// [END ad_loaded_handler]

// [START resize_handler]
window.addEventListener('resize', function(event) {
  console.log("window resized");
  if(adsManager) {
    let width = videoContent.clientWidth;
    let height = videoContent.clientHeight;
    adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
});
// [END resize_handler]
