const kafka = require('../config/kafka');

const consumer = kafka.consumer({ groupId: 'analytics-group' });
const producer = kafka.producer();

// Analytics state
let loginCount = 0;
const WINDOW_SIZE_MS = 10000; // 10 seconds for better real-time demo

async function run() {
    await consumer.connect();
    await producer.connect();

    await consumer.subscribe({ topic: 'user-events', fromBeginning: false });

    console.log('Analytics Consumer running...');

    // Simple Tumbling Window Implementation
    setInterval(async () => {
        const timestamp = new Date().toISOString();
        const report = {
            window_end: timestamp,
            event_type: 'USER_LOGIN_COUNT',
            count: loginCount,
            unit: 'per_minute'
        };

        if (loginCount > 0) {
            await producer.send({
                topic: 'analytics',
                messages: [{ value: JSON.stringify(report) }]
            });
            console.log('Analytics Report Published:', report);
        }

        // Reset for next window
        loginCount = 0;
    }, WINDOW_SIZE_MS);

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());
            if (event.type === 'USER_LOGIN') {
                loginCount++;
            }
        }
    });
}

run().catch(console.error);

process.on('SIGINT', async () => {
    console.log('Shutting down Analytics Consumer...');
    await consumer.disconnect();
    await producer.disconnect();
    process.exit(0);
});
