/**
 * Log & Code Anonymizer Logic
 * Handles detection and replacement of sensitive information.
 */
export class Anonymizer {
  constructor() {
    this.patterns = {
      // IPv4: Basic pattern, avoiding version numbers like "1.2.3" if possible, but greedy enough for logs
      ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,

      // Email: Standard email regex
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

      // MAC Address: MM:MM:MM:SS:SS:SS or MM-MM-MM-SS-SS-SS
      mac: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g,

      // API Keys / Secrets (Heuristic):
      // Look for long random strings often associated with keys.
      // "sk-..." (OpenAI), "AKIA..." (AWS), generic high-entropy strings.
      // This is tricky to get right without false positives.
      // We'll target specific known prefixes and generic "Key-like" patterns.
      // generic_key: /(?<=key|token|secret|password|pwd|api_key)['":=\s]+([A-Za-z0-9_\-\.]{16,})/gi

      // AWS Access Key ID
      aws_key_id: /\bAKIA[0-9A-Z]{16}\b/g,

      // IPv6: Standard colon-hex format (simplified but effective for logs)
      // IPv6: Matches full and compressed addresses.
      // IPv6: Heuristic supporting :: (prefix::suffix)
      ipv6: /(?:[0-9a-fA-F]{1,4}:){3,}[0-9a-fA-F]{1,4}|[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4})*::[0-9a-fA-F:]{1,}|::[0-9a-fA-F:]{1,}|fe80::[0-9a-fA-F:]{1,}/gi,

      // Phone: JP (090-xxxx-xxxx, 03-xxxx-xxxx) and generic International
      phone: /(?:\+|0)[0-9]{1,4}[-\s]?[0-9]{1,4}[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4}/g,

      // Credit Card: Visa, Mastercard, Amex, Diners, Discover, JCB (Simple check)
      credit_card: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,

      // SSN (US): xxx-xx-xxxx
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,

      // My Number (JP): 12 digits
      my_number: /\b\d{12}\b/g,

      // GitHub Token: ghp_, github_pat_
      github_token: /\b(gh[pousr]_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/g,

      // Slack Token: xoxb-, xoxp-
      // Slack Token: xoxb-, xoxp- + alphanumeric/hyphens
      slack_token: /\bxox[baprs]-[a-zA-Z0-9-]{10,88}\b/g,

      // Google API Key: AIza...
      google_key: /\bAIza[0-9A-Za-z\\-_]{35}\b/g,

      // Private Key Block
      private_key: /-----BEGIN (?:.* )?PRIVATE KEY-----[\s\S]*?-----END (?:.* )?PRIVATE KEY-----/g,

      // UUID
      uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,

      // Date: ISO YYYY-MM-DD
      date: /\b\d{4}-\d{2}-\d{2}\b/g,

      // Bearer Token
      bearer_token: /Bearer\s+([a-zA-Z0-9\-\._~\+\/]+=*)/g,
    };

    // Store the mapping of original -> placeholder for the current session
    this.mapping = new Map();
    this.counts = {
      ipv4: 0,
      email: 0,
      mac: 0,
      aws_key_id: 0,
      bearer_token: 0,
      ipv6: 0,
      phone: 0,
      credit_card: 0,
      ssn: 0,
      my_number: 0,
      github_token: 0,
      slack_token: 0,
      google_key: 0,
      private_key: 0,
      uuid: 0,
      date: 0,
      generic: 0,
    };
  }

  /**
   * Resets the mapping and counts.
   */
  reset() {
    this.mapping.clear();
    this.counts = {
      ipv4: 0,
      email: 0,
      mac: 0,
      aws_key_id: 0,
      bearer_token: 0,
      ipv6: 0,
      phone: 0,
      credit_card: 0,
      ssn: 0,
      my_number: 0,
      github_token: 0,
      slack_token: 0,
      google_key: 0,
      private_key: 0,
      uuid: 0,
      date: 0,
      generic: 0,
    };
  }

  /**
   * Gets or creates a placeholder for a given value and type.
   * Ensures consistent replacement (same IP = same placeholder).
   * @param {string} value The sensitive value
   * @param {string} type The type (ipv4, email, etc.)
   * @returns {string} The placeholder (e.g., "[IP_1]")
   */
  getPlaceholder(value, type) {
    if (this.mapping.has(value)) {
      return this.mapping.get(value);
    }

    this.counts[type]++;

    let label = type.toUpperCase();
    if (type === "ipv4") label = "IP";
    if (type === "ipv6") label = "IPV6";
    if (type === "phone") label = "PHONE";
    if (type === "aws_key_id") label = "AWS_KEY";
    if (type === "credit_card") label = "CC";
    if (type === "ssn") label = "SSN";
    if (type === "my_number") label = "MYNUM";
    if (type === "github_token") label = "GITHUB";
    if (type === "slack_token") label = "SLACK";
    if (type === "google_key") label = "G_KEY";
    if (type === "private_key") label = "PRIV_KEY";
    if (type === "uuid") label = "UUID";
    if (type === "date") label = "DATE";

    const placeholder = `[${label}_${this.counts[type]}]`;
    this.mapping.set(value, placeholder);
    return placeholder;
  }

  /**
   * Scrubs the text based on enabled filters.
   * @param {string} text Input text
   * @param {Object} options Toggle options for each type { ipv4: true, email: true ... }
   * @returns {string} Scrubbed text
   */
  scrub(text, options = {}) {
    let scrubbed = text;

    // Default options: all true if not specified
    const defaultedOptions = {
      ipv4: true,
      email: true,
      mac: true,
      ipv6: true,
      phone: true,
      credit_card: true,
      ssn: true,
      my_number: true,
      github_token: true,
      slack_token: true,
      google_key: true,
      private_key: true,
      uuid: true,
      date: true,
      aws_key_id: true,
      bearer_token: true,
      ...options,
    };

    // Helper to replace generic matches
    const replaceMatch = (type) => {
      scrubbed = scrubbed.replace(this.patterns[type], (match) => {
        return this.getPlaceholder(match, type);
      });
    };

    // Priority 1: Large blocks and Specific Tokens (Prevent partial matches by generic regexes)
    if (defaultedOptions.private_key) replaceMatch("private_key");
    if (defaultedOptions.github_token) replaceMatch("github_token");
    if (defaultedOptions.slack_token) replaceMatch("slack_token");
    if (defaultedOptions.google_key) replaceMatch("google_key");
    if (defaultedOptions.aws_key_id) replaceMatch("aws_key_id");
    if (defaultedOptions.bearer_token) {
       // Bearer handles its own logic below, but we should do it early to avoid partial token masking
    }

    // Priority 2: Unique IDs and Numbers
    if (defaultedOptions.uuid) replaceMatch("uuid");
    if (defaultedOptions.credit_card) replaceMatch("credit_card");
    if (defaultedOptions.ssn) replaceMatch("ssn");
    if (defaultedOptions.my_number) replaceMatch("my_number");

    // Priority 3: Network & Comm
    if (defaultedOptions.email) replaceMatch("email");
    if (defaultedOptions.mac) replaceMatch("mac");
    if (defaultedOptions.ipv6) replaceMatch("ipv6");
    if (defaultedOptions.ipv4) replaceMatch("ipv4");
    
    // Priority 4: Generic Formats (Date, Phone)
    if (defaultedOptions.date) replaceMatch("date");
    if (defaultedOptions.phone) replaceMatch("phone");

    // Complex logic for Bearer token to only capture the actual token part if needed
    // But simple replace works if the regex covers the whole target.
    // For Bearer, the regex is /Bearer\s+.../ which includes "Bearer ".
    // We usually want to keep "Bearer " and only mask the token.
    if (defaultedOptions.bearer_token) {
      scrubbed = scrubbed.replace(
        this.patterns.bearer_token,
        (match, token) => {
          const placeholder = this.getPlaceholder(token, "bearer_token");
          return `Bearer ${placeholder}`;
        },
      );
    }

    return scrubbed;
  }

  /**
   * Returns the current mapping as an object (for display/debug).
   */
  getMapping() {
    return Object.fromEntries(this.mapping);
  }
}
