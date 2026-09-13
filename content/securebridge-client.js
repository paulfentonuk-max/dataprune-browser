// SecureBridge Protocol Client v0.2.0
// Patent Pending: GB2619170.0

class SecureBridgeClient {
  constructor() {
    this.sessionKey = null;
    this.ws = null;
    this.isConnected = false;
  }
  
  async initialize() {
    // Check if user has SecureBridge feature (Starter+)
    const { tier } = await chrome.storage.sync.get('tier');
    if (tier === 'FREE') return false;
    
    // Generate ephemeral key pair
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      false,
      ['deriveKey']
    );
    
    return true;
  }
  
  async connect() {
    if (!this.keyPair) return false;
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://securebridge.fenton-creative.co/v1');
      
      this.ws.onopen = () => {
        this.isConnected = true;
        resolve(true);
      };
n      this.ws.onerror = (err) => {
        console.error('SecureBridge error:', err);
        resolve(false);
      };
    });
  }
  
  async encryptData(data) {
    if (!this.sessionKey) return data;
    
    const encoder = new TextEncoder();
    const encoded = encoder.encode(JSON.stringify(data));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.sessionKey,
      encoded
    );
    
    return { iv, encrypted };
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionKey = null;
    this.isConnected = false;
  }
}

// Export for use
window.SecureBridge = new SecureBridgeClient();