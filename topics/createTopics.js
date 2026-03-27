const kafka = require('../config/kafka');

async function createTopics() {
    const admin = kafka.admin();
    await admin.connect();

    await admin.createTopics({
        topics: [
            { topic: 'user-events', numPartitions: 3 },
            { topic: 'notifications', numPartitions: 3 },
            { topic: 'logs', numPartitions: 3 },
            { topic: 'analytics', numPartitions: 3 },
            { topic: 'dead-letter-topic', numPartitions: 3 }
        ]
    });

    console.log('Topics created');
    await admin.disconnect();
}

createTopics();