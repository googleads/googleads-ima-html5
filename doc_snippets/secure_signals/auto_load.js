console.log("initializing IMA");
adContainer = document.getElementById('ad-container');
adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);

const NETWORK_CODE = '21775744923';

/**
 * Sample signal collector function.
 * @return {!Promise<string>} A promise that resolves to the encoded signals.
 */
const signalCollector = () => {
 return new Promise((resolve, reject) => {
   resolve("My encoded signal string");
 });
};
if (!googletag) googletag = {};
if (!googletag.secureSignalProviders) googletag.secureSignalProviders = [];
googletag.secureSignalProviders.push({
 networkCode: NETWORK_CODE,
 collectorFunction: signalCollector
});

adsLoader = new google.ima.AdsLoader(adDisplayContainer);
