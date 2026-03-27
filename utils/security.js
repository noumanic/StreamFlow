/**
 * Security Undercurrent: Data Masking Utility
 * Ensures sensitive information (like emails) is redacted before 
 * reaching analytics or serving layers.
 */
function maskEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length === 0) return email;
    return `${name[0]}${'*'.repeat(Math.max(0, name.length - 1))}@${domain}`;
}

module.exports = {
    maskEmail
};
