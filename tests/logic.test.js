const { maskEmail } = require('../utils/security');
const { validateUserEvent } = require('../utils/validator');

describe('Security Undercurrent: Data Masking', () => {
    test('should mask email correctly', () => {
        expect(maskEmail('test@example.com')).toBe('t***@example.com');
    });

    test('should handle invalid email formats gracefully', () => {
        expect(maskEmail('invalidemail')).toBe('invalidemail');
    });
});

describe('Data Management: Schema Validation', () => {
    test('should validate a correct user event', () => {
        const validEvent = {
            id: 1,
            type: 'USER_LOGIN',
            user: 'john_doe',
            timestamp: new Date().toISOString()
        };
        const result = validateUserEvent(validEvent);
        expect(result.success).toBe(true);
    });

    test('should fail validation for missing fields', () => {
        const invalidEvent = { id: 1 };
        const result = validateUserEvent(invalidEvent);
        expect(result.success).toBe(false);
    });
});
