require('dotenv').config(); // Load environment variables from .env file

const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// LocalStack endpoint (if running locally with LocalStack)
const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const isLocalStack = process.env.NODE_ENV === 'development' && process.env.USE_LOCALSTACK === 'true';

const clientConfig = {
    region: process.env.AWS_REGION,
    ...(isLocalStack && { endpoint: LOCALSTACK_ENDPOINT }),
};

// Initialize DynamoDB Client (v3)
const dynamodbClient = new DynamoDBClient(clientConfig);

const createTable = async (params) => {
    try {
        await dynamodbClient.send(new CreateTableCommand(params));
        console.log(`Created table: ${params.TableName}`);
    } catch (error) {
        if (error.name === 'ResourceInUseException') { // AWS SDK v3 uses error.name
            console.log(`Table already exists: ${params.TableName}`);
        } else {
            console.error(`Error creating table ${params.TableName}:`, error);
            throw error;
        }
    }
};

const initDb = async () => {
    console.log('Initializing DynamoDB tables...');

    // Users Table
    const usersTableParams = {
        TableName: 'Users',
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }, // Partition Key
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        GlobalSecondaryIndexes: [
            {
                IndexName: 'EmailIndex',
                KeySchema: [
                    { AttributeName: 'email', KeyType: 'HASH' }, // Partition Key for GSI
                ],
                Projection: {
                    ProjectionType: 'ALL', // Include all attributes from the main table
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5,
                },
            },
        ],
    };
    await createTable(usersTableParams);

    // Documents Table
    const documentsTableParams = {
        TableName: 'Documents',
        KeySchema: [
            { AttributeName: 'docId', KeyType: 'HASH' }, // Partition Key
        ],
        AttributeDefinitions: [
            { AttributeName: 'docId', AttributeType: 'S' },
            { AttributeName: 'ownerId', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        GlobalSecondaryIndexes: [
            {
                IndexName: 'OwnerIdIndex',
                KeySchema: [
                    { AttributeName: 'ownerId', KeyType: 'HASH' }, // Partition Key for GSI
                ],
                Projection: {
                    ProjectionType: 'ALL',
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5,
                },
            },
        ],
    };
    await createTable(documentsTableParams);

    // SharedDocuments Table
    const sharedDocumentsTableParams = {
        TableName: 'SharedDocuments',
        KeySchema: [
            { AttributeName: 'docId', KeyType: 'HASH' }, // Partition Key
            { AttributeName: 'userId', KeyType: 'RANGE' }, // Sort Key
        ],
        AttributeDefinitions: [
            { AttributeName: 'docId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserIdIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' }, // Partition Key for GSI
                ],
                Projection: {
                    ProjectionType: 'ALL',
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5,
                },
            },
        ],
    };
    await createTable(sharedDocumentsTableParams);

    console.log('DynamoDB table initialization complete.');
};

// Execute initialization
initDb().catch(error => {
    console.error('Failed to initialize DynamoDB:', error);
    process.exit(1);
});
