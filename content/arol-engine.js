// AROL Engine v0.2.0
class AROLEngine {
  optimize(text) {
    // Simple split by sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    // Keep first half
    const half = Math.ceil(sentences.length / 2);
    return sentences.slice(0, half).join('. ') + '.';
  }
}
window.AROLEngine = new AROLEngine();
console.log('AROL loaded');
