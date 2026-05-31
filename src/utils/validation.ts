/**
 * Email validation utilities for Promo Flow submissions.
 */

export interface ValidationDetails {
  isValid: boolean;         // false if the email is invalid/fake and MUST be blocked
  isUnverifiedSample: boolean; // true if it is a valid but unverified sample email requiring manual confirmation
  reason?: string;
}

export function validatePitchEmail(email: string, labelVerificationStatus?: string): ValidationDetails {
  const trimmed = (email || '').trim().toLowerCase();

  // 1. Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, isUnverifiedSample: false, reason: 'Invalid basic format' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, isUnverifiedSample: false, reason: "Incorrect '@' separation" };
  }

  const localPart = parts[0];
  const domain = parts[1];

  // 2. Domain existence / validity check
  // Must contain at least one dot, and valid characters (a-z, 0-9, hyphen, dots)
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { isValid: false, isUnverifiedSample: false, reason: 'Host has no TLD' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, isUnverifiedSample: false, reason: 'TLD too short' };
  }

  // Ensure domain name segment is valid
  if (domainParts.some(part => part.length === 0)) {
    return { isValid: false, isUnverifiedSample: false, reason: 'Empty domain segment' };
  }

  // 3. Block placeholders, mock setups or fake test domains
  const fakeDomains = [
    'example.com',
    'test.com',
    'placeholder.com',
    'mysite.com',
    'yourdomain.com',
    'domain.com',
    'nomail.com',
    'tempmail.com',
    'fakeemail.com',
    'localhost',
    'invalid',
    'sendingmachine.fm',
    'clover.fm',
    'grooves.fm',
    'london.uk'
  ];

  if (fakeDomains.includes(domain) || fakeDomains.some(fd => domain.endsWith('.' + fd))) {
    return { isValid: false, isUnverifiedSample: false, reason: 'Blocked placeholder domain' };
  }

  const fakeLocalParts = [
    'test',
    'placeholder',
    'dummy',
    'fake',
    'noemail',
    'no-reply',
    'noreply'
  ];

  if (fakeLocalParts.includes(localPart)) {
    return { isValid: false, isUnverifiedSample: false, reason: 'Blocked placeholder username' };
  }

  // 4. Identify if it is an unverified sample contact email
  // Let's check if the label verification status is explicitly 'unverified',
  // or if the email address contains unverified-like names or belongs to sample-only patterns.
  // E.g., mochakk.promos@dogghouse.com.br or unverified-looking accounts (promosbeltran@gmail.com, etc.),
  // or if labelVerificationStatus is 'unverified'.
  const isUnverified = 
    labelVerificationStatus === 'unverified' || 
    trimmed.includes('unverified') || 
    trimmed.includes('sample') || 
    domain.includes('dogghouse.com.br') || // make sample/artist promos matching unverified
    trimmed.includes('promosbeltran') ||
    trimmed.includes('promos@hellbentrecords.com');

  return {
    isValid: true,
    isUnverifiedSample: isUnverified,
  };
}
