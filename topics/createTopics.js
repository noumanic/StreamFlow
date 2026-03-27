const kafka = require('../config/kafka');

async function createTopics() {
    const admin = kafka.admin();
    await admin.connect();

    await admin.createTopics({
        topics: [
            { topic: 'user-events', numPartitions: 1 },
            { topic: 'notifications', numPartitions: 1 },
            { topic: 'logs', numPartitions: 1 }
        ]
    });

    console.log('Topics created');
    await admin.disconnect();
}

createTopics();