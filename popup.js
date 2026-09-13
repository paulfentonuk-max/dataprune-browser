// DataPrune Popup Controller v0.2.0
// Patent Pending: GB2620950.2

document.addEventListener('DOMContentLoaded', async () => {
  // Get license status from background
  const license = await chrome.runtime.sendMessage({ type: 'CHECK_LICENSE' });
  
  updateUI(license);
  
  // Upgrade button handler
  document.getElementById('upgrade-btn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://dataprune.co/pricing' });
  });
  
  // Settings button (if exists)
  document.getElementById('settings-btn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/?options=' + chrome.runtime.id });
  });
});

function updateUI(license) {
  // Update usage bar
  const used = license.maxRequests - license.remaining;
  const percent = (used / license.maxRequests) * 100;
  
  const usageText = document.getElementById('usage-text');
  const usageBar = document.getElementById('usage-bar');
  
  if (usageText && usageBar) {
    usageText.textContent = `${used} / ${license.maxRequests}`;
    usageBar.style.width = `${percent}%`;
    
    // Warning color if >80%
    if (percent > 80) {
      usageBar.style.background = '#ef4444';
    }
  }
  
  // Update tier badge
  const statusBadge = document.querySelector('.status');
  if (statusBadge) {
    statusBadge.textContent = license.tier;
  }
}