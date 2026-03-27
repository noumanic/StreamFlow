const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
    clientId: 'streamflow-app',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

module.exports = kafka;