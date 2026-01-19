require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const USERS_TABLE = 'Users'; // Assuming your Users table is named 'Users'

// LocalStack endpoint (if running locally with LocalStack)
const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const isLocalStack = process.env.NODE_ENV === 'development' && process.env.USE_LOCALSTACK === 'true';

const clientConfig = {
    region: process.env.AWS_REGION,
    ...(isLocalStack && { endpoint: LOCALSTACK_ENDPOINT }),
};

const dynamodb = new DynamoDBClient(clientConfig);

const createUser = async (name, email, password) => {
    try {
        // Check if user with that email already exists
        const { Items } = await dynamodb.send(new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email },
        }));

        if (Items && Items.length > 0) {
            console.log(`User with email ${email} already exists. Skipping.`);
            return;
        }

        const userId = uuidv4();
        const now = new Date().toISOString();
        const newUser = {
            userId,
            name,
            email,
            passwordHash: password, // Storing as plain text as per MVP requirement
            createdAt: now,
            updatedAt: now,
        };

        await dynamodb.send(new PutCommand({
            TableName: USERS_TABLE,
            Item: newUser,
        }));
        console.log(`Created user: ${name} (${email})`);
    } catch (error) {
        console.error(`Error creating user ${email}:`, error);
    }
};

const seedUsers = async () => {
    console.log('Seeding dummy users...');
    await createUser('Alice Smith', 'alice@example.com', 'password123');
    await createUser('Bob Johnson', 'bob@example.com', 'password123');
    await createUser('Charlie Brown', 'charlie@example.com', 'password123');
    await createUser('Diana Prince', 'diana@example.com', 'password123');
    await createUser('Eve Adams', 'eve@example.com', 'password123');
    console.log('Dummy user seeding complete.');
};

seedUsers().catch(error => {
    console.error('Failed to seed users:', error);
    process.exit(1);
});
