// DataPrune Background Service Worker v0.2.0
// Patent Pending: GB2620950.2, GB2619170.0, GB2619136.1, GB2619169.2

// License tiers configuration (inline - no imports)
const LICENSE_TIERS = {
  FREE: {
    requestsPerDay: 100,
    features: ['arol', 'basic_dlp'],
    price: 0
  },
  STARTER: {
    requestsPerDay: 10000,
    features: ['arol', 'advanced_dlp', 'securebridge'],
    price: 29
  },
  PROFESSIONAL: {
    requestsPerDay: 100000,
    features: ['arol', 'advanced_dlp', 'securebridge', 'mtavs'],
    price: 99
  }
};

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('DataPrune v0.2.0 installed');
    
    // Set default free tier
    chrome.storage.sync.set({
      tier: 'FREE',
      installDate: Date.now(),
      requestsToday: 0,
      version: '0.2.0'
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://dataprune.co/welcome'
    });
  }
});

// Daily reset alarm
chrome.alarms.create('dailyReset', { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    chrome.storage.sync.set({ requestsToday: 0 });
    console.log('Daily counters reset');
  }
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.type === 'CHECK_LICENSE') {
    checkLicense().then(sendResponse);
    return true; // Keep channel open for async
  }
  
  if (request.type === 'TRACK_REQUEST') {
    trackRequest().then(sendResponse);
    return true;
  }
  
  if (request.type === 'ACTIVATE_LICENSE') {
    activateLicense(request.licenseKey).then(sendResponse);
    return true;
  }
});

// Check license status
async function checkLicense() {
  try {
    const data = await chrome.storage.sync.get(['tier', 'requestsToday']);
    const tier = data.tier || 'FREE';
    const requestsToday = data.requestsToday || 0;
    const tierConfig = LICENSE_TIERS[tier];
    
    return {
      tier: tier,
      canProcess: requestsToday < tierConfig.requestsPerDay,
      remaining: tierConfig.requestsPerDay - requestsToday,
      maxRequests: tierConfig.requestsPerDay,
      features: tierConfig.features
    };
  } catch (error) {
    console.error('License check error:', error);
    return {
      tier: 'FREE',
      canProcess: true,
      remaining: 100,
      maxRequests: 100,
      features: ['arol']
    };
  }
}

// Track usage
async function trackRequest() {
  try {
    const data = await chrome.storage.sync.get('requestsToday');
    const current = data.requestsToday || 0;
    await chrome.storage.sync.set({ requestsToday: current + 1 });
    return { success: true, requestsToday: current + 1 };
  } catch (error) {
    console.error('Track request error:', error);
    return { success: false };
  }
}

// Activate license (called from success.html)
async function activateLicense(licenseKey) {
  try {
    // Validate with server
    const response = await fetch('https://api.fenton-creative.co/v1/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });
    
    const result = await response.json();
    
    if (result.valid) {
      await chrome.storage.sync.set({
        tier: result.tier,
        licenseKey: licenseKey,
        expiry: result.expiry,
        requestsToday: 0
      });
      return { success: true };
    }
    
    return { success: false, error: 'Invalid license' };
  } catch (error) {
    console.error('Activation error:', error);
    return { success: false, error: 'Network error' };
  }
}

console.log('DataPrune background service worker loaded v0.2.0');