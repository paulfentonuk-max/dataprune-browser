class LicenseManager {
  async validate() {
    const data = await chrome.storage.sync.get(["tier", "requestsToday"]);
    const tier = data.tier || "FREE";
    const used = data.requestsToday || 0;
    const max = tier === "FREE" ? 100 : 10000;
    return { tier, canProcess: used < max, remaining: max - used, maxRequests: max };
  }
}
window.LicenseManager = new LicenseManager();
