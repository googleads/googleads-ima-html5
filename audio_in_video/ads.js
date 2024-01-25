let videoElement;
let playButton;
let adsLoaded = false;
let adContainer;
let adDisplayContainer;
let adsLoader;
let adsManager;
let adsActive;
let isPlaying;
let contentCompleted = false;
const RIGHT_POINTING_TRIANGLE_CHAR_CODE = 9654;
const adTagUrl =
    'https://pubads.g.doubleclick.net/gampad/ads?iu=/6075/Rahul_AdUnit_Test_1&description_url=[placeholder]&tfcd=0&npa=0&ad_type=audio_video&sz=640x360&ciu_szs=640x360&cust_params=yt_channel_id%3Drtryuyuu&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';

// On window load, attach an event to the play button click
// that triggers playback on the video element
window.addEventListener('load', function(event) {
  videoElement = document.getElementById('video-element');
  videoElement.addEventListener('play', function(event) {
    loadAds(event);
  });
  initializeIMA();
  playButton = document.getElementById('play-pause');
  playButton.addEventListener('click', playPause);
});

window.addEventListener('resize', function(event) {
  console.log('window resized');
  if (adsManager) {
    let width = videoElement.clientWidth;
    let height = videoElement.clientHeight;
    adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
});

/** Implementing play&pause functionality for player control */
function playPause() {
  if (adsActive) {
    if (isPlaying) {
      adsManager.pause();
    } else {
      adsManager.resume();
    }
  } else {
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  }

  isPlaying = !isPlaying;

  if (isPlaying) {
    playButton.textContent = '||';
  } else {
    playButton.textContent =
        String.fromCharCode(RIGHT_POINTING_TRIANGLE_CHAR_CODE);
  }
}

/** Initializing IMA SDK */
function initializeIMA() {
  console.log('initializing IMA');
  adContainer = document.getElementById('ad-container');
  adDisplayContainer =
      new google.ima.AdDisplayContainer(adContainer, videoElement);

  // Set the feature flag and default image URL for the audio poster feature.
  google.ima.settings.setFeatureFlags(
    {
      'audioPosterImageEnabled': true,
      'audioPosterImageDefaultUrl':
        'https://storage.googleapis.com/interactive-media-ads/images/ima_default_audio_sample.png'
    });
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded, false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

  // Let the AdsLoader know when the video has ended
  videoElement.addEventListener('ended', function() {
    adsLoader.contentComplete();
    contentCompleted = true;
  });

  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = adTagUrl;
  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
}

/**
 * Loading Ads
 * @param {!event} event The event triggering ad loading
 */
function loadAds(event) {
  // Prevent this function from running on if there are already ads loaded
  if (adsLoaded) {
    return;
  }
  adsLoaded = true;

  // Prevent triggering immediate playback when ads are loading
  event.preventDefault();

  console.log('loading ads');

  // Initialize the container. Must be done through a user action on mobile
  // devices.
  videoElement.load();
  adDisplayContainer.initialize();

  const width = videoElement.clientWidth;
  const height = videoElement.clientHeight;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    // Play the video without ads, if an error occurs
    console.log('AdsManager could not be started');
    videoElement.play();
    isPlaying = true;
  }
}

/**
 * Handling adsManagerLoaded event
 * @param {!adsManagerLoadedEvent} adsManagerLoadedEvent The event indicating
 *     adsManager has been loaded
 */
function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Instantiate the AdsManager from the adsLoader response and pass it the
  // video element
  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);

  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded);
  adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.RESUMED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);
}

/**
 * Handing error event
 * @param {!adErrorEvent} adErrorEvent Event indicating ad error
 */
function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
}

/** Handing content pause */
function onContentPauseRequested() {
  videoElement.pause();
  isPlaying = false;
}

/** Handing content resume */
function onContentResumeRequested() {
  adsActive = false;
  // condition to disable replaying of content video after post-roll ads
  if (!contentCompleted) {
    videoElement.play();
    isPlaying = true;
  }
}

/**
 * Handing ad loaded event
 * @param {!adEvent} adEvent Ad Event
 */
function onAdLoaded(adEvent) {
  const ad = adEvent.getAd();
  if (!ad.isLinear()) {
    videoElement.play();
    isPlaying = true;
  }
}

/**
 * Handing ad play-related events
 * @param {!adEvent} adEvent Ad Event
 */
function onAdEvent(adEvent) {
  // Retrieve the ad from the event. Some events (for example,
  // ALL_ADS_COMPLETED) don't have ad object associated.
  const ad = adEvent.getAd();
  switch (adEvent.type) {
    case google.ima.AdEvent.Type.LOADED:
      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (!ad.isLinear()) {
        // Position AdDisplayContainer correctly for overlay.
        // Use ad.width and ad.height.
        videoContent.play();
      }
      break;
    case google.ima.AdEvent.Type.STARTED:
      adsActive = true;
      isPlaying = true;
      break;
    case google.ima.AdEvent.Type.PAUSED:
      isPlaying = false;
      break;
    case google.ima.AdEvent.Type.RESUMED:
      isPlaying = true;
      break;
    case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
      // reset the play button after all ads and content have completed
      if (contentCompleted) {
        isPlaying = false;
        playButton.textContent = String.fromCharCode(9654);
      }
      break;
  }
}
