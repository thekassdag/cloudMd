const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');

// Configure AWS clients
// Credentials and region are automatically loaded from environment variables by default
// (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)

// LocalStack endpoint (if running locally with LocalStack)
const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const isLocalStack = process.env.NODE_ENV === 'development' && process.env.USE_LOCALSTACK === 'true';

const clientConfig = {
    region: process.env.AWS_REGION,
    ...(isLocalStack && { endpoint: LOCALSTACK_ENDPOINT, forcePathStyle: true }), // forcePathStyle for S3 with LocalStack
};

// Initialize DynamoDB Client (v3)
const dbClient = new DynamoDBClient(clientConfig);

// Initialize DynamoDB DocumentClient (v3) for easier data manipulation
const dynamodb = DynamoDBDocumentClient.from(dbClient, {
    marshallOptions: {
        removeUndefinedValues: true, // Remove undefined values from objects
    },
    unmarshallOptions: {
        wrapNumbers: false, // Return numbers as JavaScript numbers, not BigInt
    },
});

// Initialize S3 Client (v3)
const s3 = new S3Client(clientConfig);

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// DynamoDB Table Names (ensure these tables exist in your AWS account)
const USERS_TABLE = 'Users';
const DOCUMENTS_TABLE = 'Documents';
const SHARED_DOCUMENTS_TABLE = 'SharedDocuments';
const DOCUMENT_VERSIONS_TABLE = 'DocumentVersions';

module.exports = {
    dynamodb, // DocumentClient for CRUD operations
    s3,       // S3 Client
    S3_BUCKET_NAME,
    USERS_TABLE,
    DOCUMENTS_TABLE,
    SHARED_DOCUMENTS_TABLE,
    DOCUMENT_VERSIONS_TABLE,
};
