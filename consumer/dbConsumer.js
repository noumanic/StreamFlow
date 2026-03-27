const kafka = require('../config/kafka');
const { Pool } = require('pg');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'db-group' });

// PostgreSQL Setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function initDb() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                event_id INT,
                type TEXT,
                username TEXT,
                timestamp TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('PostgreSQL Table Initialized');
    } finally {
        client.release();
    }
}

async function run() {
    await initDb();
    await consumer.connect();
    await consumer.subscribe({ topics: ['user-events', 'analytics'] });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const data = JSON.parse(message.value.toString());
            
            const client = await pool.connect();
            try {
                if (topic === 'user-events') {
                    await client.query(
                        'INSERT INTO events (event_id, type, username, timestamp) VALUES ($1, $2, $3, $4)',
                        [data.id, data.type, data.user, data.timestamp]
                    );
                    console.log('Event persisted to DB:', data.id);
                }
            } catch (err) {
                console.error('DB Persistence Error:', err);
            } finally {
                client.release();
            }
        }
    });
}

run().catch(console.error);

process.on('SIGINT', async () => {
    console.log('Shutting down DB Consumer...');
    await consumer.disconnect();
    await pool.end();
    process.exit(0);
});
