// LLM DLP Scanner v0.2.0
// Patent Pending: GB2619136.1

class DLPScanner {
  constructor() {
    this.patterns = {
      email: {
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        name: 'Email Address',
        level: 'high'
      },
      ukPhone: {
        regex: /(07\d{3}\s?\d{6}|\+44\s?7\d{3}\s?\d{6})/g,
        name: 'UK Phone Number',
        level: 'high'
      },
      nhsNumber: {
        regex: /\b\d{3}\s?\d{3}\s?\d{4}\b/g,
        name: 'NHS Number',
        level: 'critical',
        validate: (match) => this.validateNHS(match)
      },
      creditCard: {
        regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        name: 'Credit Card',
        level: 'critical',
        validate: (match) => this.validateLuhn(match.replace(/\D/g, ''))
      }
    };
  }
  
  scan(text) {
    const findings = [];
    
    for (const [type, config] of Object.entries(this.patterns)) {
      const matches = text.match(config.regex) || [];
      
      for (const match of matches) {
        if (config.validate && !config.validate(match)) continue;
        
        findings.push({
          type: config.name,
          match: match,
          level: config.level,
          position: text.indexOf(match)
        });
      }
    }
    
    return findings;
  }
  
  redact(text, findings) {
    let redacted = text;
    // Sort by position descending
    findings.sort((a, b) => b.position - a.position);
    
    for (const finding of findings) {
      const redaction = '█'.repeat(finding.match.length);
      redacted = redacted.substring(0, finding.position) + 
                 redaction + 
                 redacted.substring(finding.position + finding.match.length);
    }
    
    return redacted;
  }
  
  validateNHS(number) {
    const digits = number.replace(/\s/g, '');
    if (digits.length !== 10) return false;
    
    const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }
    
    const checkDigit = 11 - (sum % 11);
    return checkDigit === parseInt(digits[9]);
  }
  
  validateLuhn(number) {
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
}

// Auto-scan on input fields
const scanner = new DLPScanner();

document.addEventListener('input', (e) => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
    const findings = scanner.scan(e.target.value);
    if (findings.length > 0) {
      console.log('DLP: PII detected', findings);
      // Optionally notify user
    }
  }
});

window.DLPScanner = scanner;