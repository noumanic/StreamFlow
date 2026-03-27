const { z } = require('zod');

// Schema for User Login Events
const UserEventSchema = z.object({
    id: z.number(),
    type: z.string(),
    user: z.string(),
    timestamp: z.string().datetime() // Ensures ISO format
});

function validateUserEvent(data) {
    return UserEventSchema.safeParse(data);
}

module.exports = {
    validateUserEvent
};
