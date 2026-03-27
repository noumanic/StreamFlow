const kafka = require('../config/kafka');

const producer = kafka.producer();

async function run() {
    await producer.connect();

    let count = 0;

    setInterval(async () => {
        const event = {
            id: count++,
            type: 'USER_LOGIN',
            user: `user_${count}`,
            timestamp: new Date().toISOString()
        };

        await producer.send({
            topic: 'user-events',
            messages: [{ value: JSON.stringify(event) }]
        });

        console.log('Produced:', event);
    }, 3000);
}

run();