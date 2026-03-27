const kafka = require('../config/kafka');

const consumer = kafka.consumer({ groupId: 'logging-group' });

async function run() {
    await consumer.connect();

    await consumer.subscribe({ topic: 'user-events' });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());
            console.log('Log:', event);
        }
    });
}

run();