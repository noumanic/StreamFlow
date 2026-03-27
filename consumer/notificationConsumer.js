const kafka = require('../config/kafka');

const consumer = kafka.consumer({ groupId: 'notification-group' });
const producer = kafka.producer();

async function run() {
    await consumer.connect();
    await producer.connect();

    await consumer.subscribe({ topic: 'user-events' });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());

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