const kafka = require('../config/kafka');

const consumer = kafka.consumer({ groupId: 'notification-group' });
const producer = kafka.producer();

const { validateUserEvent } = require('../utils/validator');

async function run() {
    await consumer.connect();
    await producer.connect();

    await consumer.subscribe({ topic: 'user-events' });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const rawValue = message.value.toString();
            let event;

            try {
                event = JSON.parse(rawValue);
            } catch (e) {
                // DLQ for malformed JSON
                await producer.send({
                    topic: 'dead-letter-topic',
                    messages: [{ value: rawValue, headers: { error: 'INVALID_JSON' } }]
                });
                return;
            }

            // Schema Validation
            const validation = validateUserEvent(event);
            if (!validation.success) {
                await producer.send({
                    topic: 'dead-letter-topic',
                    messages: [{ value: rawValue, headers: { error: 'SCHEMA_VALIDATION_FAILED' } }]
                });
                console.log('Invalid event sent to DLQ:', event);
                return;
            }

            const notification = {
                message: `User ${event.user} logged in`,
                time: event.timestamp
            };

            await producer.send({
                topic: 'notifications',
                messages: [{ value: JSON.stringify(notification) }]
            });

            console.log('Notification created:', notification);
        }
    });
}

run();