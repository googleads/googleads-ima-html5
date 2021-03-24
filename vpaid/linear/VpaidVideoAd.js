/**
 * @fileoverview A sample VPAID ad useful for testing a VPAID JS enabled player.
 * This ad will just play a video.
<<<<<<< HEAD
=======
 *
>>>>>>> gh-pages
 */

/**
 * @constructor
 */
var VpaidVideoPlayer = function() {
  /**
   * The slot is the div element on the main page that the ad is supposed to
   * occupy.
   * @type {Object}
   * @private
   */
  this.slot_ = null;

  /**
   * The video slot is the video element used by the ad to render video content.
   * @type {Object}
   * @private
   */
  this.videoSlot_ = null;

  /**
   * An object containing all registered events. These events are all
   * callbacks for use by the VPAID ad.
   * @type {Object}
   * @private
   */
  this.eventsCallbacks_ = {};

  /**
   * A list of getable and setable attributes.
   * @type {Object}
   * @private
   */
  this.attributes_ = {
<<<<<<< HEAD
    'companions': '',
    'desiredBitrate': 256,
    'duration': 10,
    'expanded': false,
    'height': 0,
    'icons': '',
    'linear': true,
    'remainingTime': 10,
    'skippableState': false,
    'viewMode': 'normal',
    'width': 0,
    'volume': 1.0
=======
    'companions' : '',
    'desiredBitrate' : 256,
    'duration' : 10,
    'expanded' : false,
    'height' : 0,
    'icons' : '',
    'linear' : true,
    'remainingTime' : 10,
    'skippableState' : false,
    'viewMode' : 'normal',
    'width' : 0,
    'volume' : 1.0
>>>>>>> gh-pages
  };

  /**
   * A set of ad playback events to be reported.
   * @type {Object}
   * @private
   */
  this.quartileEvents_ = [
<<<<<<< HEAD
    {event: 'AdImpression', value: 0}, {event: 'AdVideoStart', value: 0},
=======
    {event: 'AdImpression', value: 0},
    {event: 'AdVideoStart', value: 0},
>>>>>>> gh-pages
    {event: 'AdVideoFirstQuartile', value: 25},
    {event: 'AdVideoMidpoint', value: 50},
    {event: 'AdVideoThirdQuartile', value: 75},
    {event: 'AdVideoComplete', value: 100}
  ];

  /**
   * @type {number} An index into what quartile was last reported.
   * @private
   */
  this.nextQuartileIndex_ = 0;

  /**
   * Parameters passed in from the AdParameters section of the VAST.
   * Used for video URL and MIME type.
<<<<<<< HEAD
=======
   *
>>>>>>> gh-pages
   * @type {!object}
   * @private
   */
  this.parameters_ = {};
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Returns the supported VPAID verion.
 * @param {string} version
 * @return {string}
 */
VpaidVideoPlayer.prototype.handshakeVersion = function(version) {
  return ('2.0');
};

<<<<<<< HEAD
/**
 * Initializes all attributes in the ad. The ad will not start until startAd is\
 * called.
=======

/**
 * Initializes all attributes in the ad. The ad will not start until startAd is\
 * called.
 *
>>>>>>> gh-pages
 * @param {number} width The ad width.
 * @param {number} height The ad height.
 * @param {string} viewMode The ad view mode.
 * @param {number} desiredBitrate The desired bitrate.
 * @param {Object} creativeData Data associated with the creative.
 * @param {Object} environmentVars Runtime variables associated with the
 *     creative like the slot and video slot.
 */
VpaidVideoPlayer.prototype.initAd = function(
<<<<<<< HEAD
    width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
=======
    width,
    height,
    viewMode,
    desiredBitrate,
    creativeData,
    environmentVars) {
>>>>>>> gh-pages
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  this.attributes_['desiredBitrate'] = desiredBitrate;

  // slot and videoSlot are passed as part of the environmentVars
  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;

  // Parse the incoming ad parameters.
  this.parameters_ = JSON.parse(creativeData['AdParameters']);

<<<<<<< HEAD
  this.log(
      'initAd ' + width + 'x' + height + ' ' + viewMode + ' ' + desiredBitrate);
  this.updateVideoSlot_();
  this.videoSlot_.addEventListener(
      'timeupdate', this.timeUpdateHandler_.bind(this), false);
  this.videoSlot_.addEventListener(
      'loadedmetadata', this.loadedMetadata_.bind(this), false);
  this.videoSlot_.addEventListener('ended', this.stopAd.bind(this), false);
  this.slot_.addEventListener('click', this.clickAd_.bind(this), false);
=======
  this.log('initAd ' + width + 'x' + height +
      ' ' + viewMode + ' ' + desiredBitrate);
  this.updateVideoSlot_();
  this.videoSlot_.addEventListener(
      'timeupdate',
      this.timeUpdateHandler_.bind(this),
      false);
  this.videoSlot_.addEventListener(
      'loadedmetadata',
      this.loadedMetadata_.bind(this),
      false);
  this.videoSlot_.addEventListener(
      'ended',
      this.stopAd.bind(this),
      false);
  this.slot_.addEventListener(
      'click',
      this.clickAd_.bind(this),
      false);
>>>>>>> gh-pages
  this.callEvent_('AdLoaded');
};

/**
 * Called when the ad is clicked.
 * @private
 */
VpaidVideoPlayer.prototype.clickAd_ = function() {
  if ('AdClickThru' in this.eventsCallbacks_) {
<<<<<<< HEAD
    this.eventsCallbacks_['AdClickThru']('', '0', true);
  }
};

=======
    this.eventsCallbacks_['AdClickThru']('','0', true);
  }
};



>>>>>>> gh-pages
/**
 * Called by the video element when video metadata is loaded.
 * @private
 */
VpaidVideoPlayer.prototype.loadedMetadata_ = function() {
  // The ad duration is not known until the media metadata is loaded.
  // Then, update the player with the duration change.
  this.attributes_['duration'] = this.videoSlot_.duration;
  this.callEvent_('AdDurationChange');
};

/**
 * Called by the video element when the video reaches specific points during
 * playback.
 * @private
 */
VpaidVideoPlayer.prototype.timeUpdateHandler_ = function() {
  if (this.nextQuartileIndex_ >= this.quartileEvents_.length) {
    return;
  }
  var percentPlayed =
      this.videoSlot_.currentTime * 100.0 / this.videoSlot_.duration;
  if (percentPlayed >= this.quartileEvents_[this.nextQuartileIndex_].value) {
    var lastQuartileEvent = this.quartileEvents_[this.nextQuartileIndex_].event;
    this.eventsCallbacks_[lastQuartileEvent]();
    this.nextQuartileIndex_ += 1;
  }
  if (this.videoSlot_.duration > 0) {
    this.attributes_['remainingTime'] =
<<<<<<< HEAD
        this.videoSlot_.duration - this.videoSlot_.currentTime;
  }
};

=======
      this.videoSlot_.duration - this.videoSlot_.currentTime;
  }
};


>>>>>>> gh-pages
/**
 * Creates or updates the video slot and fills it with a supported video.
 * @private
 */
VpaidVideoPlayer.prototype.updateVideoSlot_ = function() {
  if (this.videoSlot_ == null) {
    this.videoSlot_ = document.createElement('video');
    this.log('Warning: No video element passed to ad, creating element.');
    this.slot_.appendChild(this.videoSlot_);
  }
  this.updateVideoPlayerSize_();
  var foundSource = false;
  var videos = this.parameters_.videos || [];
  for (var i = 0; i < videos.length; i++) {
    // Choose the first video with a supported mimetype.
    if (this.videoSlot_.canPlayType(videos[i].mimetype) != '') {
      this.videoSlot_.setAttribute('src', videos[i].url);
      foundSource = true;
      break;
    }
  }
  if (!foundSource) {
    // Unable to find a source video.
    this.callEvent_('AdError');
  }
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Helper function to update the size of the video player.
 * @private
 */
VpaidVideoPlayer.prototype.updateVideoPlayerSize_ = function() {
  this.videoSlot_.setAttribute('width', this.attributes_['width']);
  this.videoSlot_.setAttribute('height', this.attributes_['height']);
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Called by the wrapper to start the ad.
 */
VpaidVideoPlayer.prototype.startAd = function() {
  this.log('Starting ad');
  this.videoSlot_.play();

  this.callEvent_('AdStarted');
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Called by the wrapper to stop the ad.
 */
VpaidVideoPlayer.prototype.stopAd = function() {
  this.log('Stopping ad');
  // Calling AdStopped immediately terminates the ad. Setting a timeout allows
  // events to go through.
  var callback = this.callEvent_.bind(this);
  setTimeout(callback, 75, ['AdStopped']);
};

<<<<<<< HEAD
/**
 * Called when the video player changes the width/height of the container.
=======

/**
 * Called when the video player changes the width/height of the container.
 *
>>>>>>> gh-pages
 * @param {number} width The new width.
 * @param {number} height A new height.
 * @param {string} viewMode A new view mode.
 */
VpaidVideoPlayer.prototype.resizeAd = function(width, height, viewMode) {
  this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  this.updateVideoPlayerSize_();
  this.callEvent_('AdSizeChange');
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Pauses the ad.
 */
VpaidVideoPlayer.prototype.pauseAd = function() {
  this.log('pauseAd');
  this.videoSlot_.pause();
  this.callEvent_('AdPaused');
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Resumes the ad.
 */
VpaidVideoPlayer.prototype.resumeAd = function() {
  this.log('resumeAd');
  this.videoSlot_.play();
  this.callEvent_('AdPlaying');
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Expands the ad.
 */
VpaidVideoPlayer.prototype.expandAd = function() {
  this.log('expandAd');
  this.attributes_['expanded'] = true;
  this.callEvent_('AdExpanded');
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Collapses the ad.
 */
VpaidVideoPlayer.prototype.collapseAd = function() {
  this.log('collapseAd');
  this.attributes_['expanded'] = false;
};

<<<<<<< HEAD
=======

>>>>>>> gh-pages
/**
 * Skips the ad.
 */
VpaidVideoPlayer.prototype.skipAd = function() {
  this.log('skipAd');
  var skippableState = this.attributes_['skippableState'];
  if (skippableState) {
    this.callEvent_('AdSkipped');
  }
};

<<<<<<< HEAD
/**
 * Registers a callback for an event.
=======

/**
 * Registers a callback for an event.
 *
>>>>>>> gh-pages
 * @param {Function} aCallback The callback function.
 * @param {string} eventName The callback type.
 * @param {Object} aContext The context for the callback.
 */
VpaidVideoPlayer.prototype.subscribe = function(
<<<<<<< HEAD
    aCallback, eventName, aContext) {
=======
    aCallback,
    eventName,
    aContext) {
>>>>>>> gh-pages
  this.log('Subscribe ' + eventName);
  var callBack = aCallback.bind(aContext);
  this.eventsCallbacks_[eventName] = callBack;
};

<<<<<<< HEAD
/**
 * Removes a callback based on the eventName.
=======

/**
 * Removes a callback based on the eventName.
 *
>>>>>>> gh-pages
 * @param {string} eventName The callback type.
 */
VpaidVideoPlayer.prototype.unsubscribe = function(eventName) {
  this.log('unsubscribe ' + eventName);
  this.eventsCallbacks_[eventName] = null;
};

<<<<<<< HEAD
/**
 * Returns whether the ad is linear.
=======

/**
 * Returns whether the ad is linear.
 *
>>>>>>> gh-pages
 * @return {boolean} True if the ad is a linear, false for non linear.
 */
VpaidVideoPlayer.prototype.getAdLinear = function() {
  return this.attributes_['linear'];
};

/**
 * Returns ad width.
<<<<<<< HEAD
=======
 *
>>>>>>> gh-pages
 * @return {number} The ad width.
 */
VpaidVideoPlayer.prototype.getAdWidth = function() {
  return this.attributes_['width'];
};

<<<<<<< HEAD
/**
 * Returns ad height.
=======

/**
 * Returns ad height.
 *
>>>>>>> gh-pages
 * @return {number} The ad height.
 */
VpaidVideoPlayer.prototype.getAdHeight = function() {
  return this.attributes_['height'];
};

<<<<<<< HEAD
/**
 * Returns true if the ad is expanded.
=======

/**
 * Returns true if the ad is expanded.
 *
>>>>>>> gh-pages
 * @return {boolean}
 */
VpaidVideoPlayer.prototype.getAdExpanded = function() {
  this.log('getAdExpanded');
  return this.attributes_['expanded'];
};

<<<<<<< HEAD
/**
 * Returns the skippable state of the ad.
=======

/**
 * Returns the skippable state of the ad.
 *
>>>>>>> gh-pages
 * @return {boolean}
 */
VpaidVideoPlayer.prototype.getAdSkippableState = function() {
  this.log('getAdSkippableState');
  return this.attributes_['skippableState'];
};

<<<<<<< HEAD
/**
 * Returns the remaining ad time, in seconds.
=======

/**
 * Returns the remaining ad time, in seconds.
 *
>>>>>>> gh-pages
 * @return {number} The time remaining in the ad.
 */
VpaidVideoPlayer.prototype.getAdRemainingTime = function() {
  return this.attributes_['remainingTime'];
};

<<<<<<< HEAD
/**
 * Returns the duration of the ad, in seconds.
=======

/**
 * Returns the duration of the ad, in seconds.
 *
>>>>>>> gh-pages
 * @return {number} The duration of the ad.
 */
VpaidVideoPlayer.prototype.getAdDuration = function() {
  return this.attributes_['duration'];
};

<<<<<<< HEAD
/**
 * Returns the ad volume.
=======

/**
 * Returns the ad volume.
 *
>>>>>>> gh-pages
 * @return {number} The volume of the ad.
 */
VpaidVideoPlayer.prototype.getAdVolume = function() {
  this.log('getAdVolume');
  return this.attributes_['volume'];
};

<<<<<<< HEAD
/**
 * Sets the ad volume.
=======

/**
 * Sets the ad volume.
 *
>>>>>>> gh-pages
 * @param {number} value The volume in percentage.
 */
VpaidVideoPlayer.prototype.setAdVolume = function(value) {
  this.attributes_['volume'] = value;
  this.log('setAdVolume ' + value);
  this.callEvent_('AdVolumeChange');
};

<<<<<<< HEAD
/**
 * Returns a list of companion ads for the ad.
=======

/**
 * Returns a list of companion ads for the ad.
 *
>>>>>>> gh-pages
 * @return {string} List of companions in VAST XML.
 */
VpaidVideoPlayer.prototype.getAdCompanions = function() {
  return this.attributes_['companions'];
};

<<<<<<< HEAD
/**
 * Returns a list of icons.
=======

/**
 * Returns a list of icons.
 *
>>>>>>> gh-pages
 * @return {string} A list of icons.
 */
VpaidVideoPlayer.prototype.getAdIcons = function() {
  return this.attributes_['icons'];
};

<<<<<<< HEAD
/**
 * Logs events and messages.
=======

/**
 * Logs events and messages.
 *
>>>>>>> gh-pages
 * @param {string} message
 */
VpaidVideoPlayer.prototype.log = function(message) {
  console.log(message);
};

<<<<<<< HEAD
/**
 * Calls an event if there is a callback.
=======

/**
 * Calls an event if there is a callback.
 *
>>>>>>> gh-pages
 * @param {string} eventType
 * @private
 */
VpaidVideoPlayer.prototype.callEvent_ = function(eventType) {
  if (eventType in this.eventsCallbacks_) {
    this.eventsCallbacks_[eventType]();
  }
};

<<<<<<< HEAD
/**
 * Main function called by wrapper to get the VPAID ad.
=======

/**
 * Main function called by wrapper to get the VPAID ad.
 *
>>>>>>> gh-pages
 * @return {Object} The VPAID compliant ad.
 */
var getVPAIDAd = function() {
  return new VpaidVideoPlayer();
};
