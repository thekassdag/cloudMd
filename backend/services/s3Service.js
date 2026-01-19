const { s3, S3_BUCKET_NAME } = require('../config/aws');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const generateS3Key = (docId) => `documents/${docId}/content.txt`;

const saveContentToS3 = async (docId, content) => {
    const key = generateS3Key(docId);
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: content,
        ContentType: 'text/plain',
    };
    try {
        await s3.send(new PutObjectCommand(params));
        console.log(`Content saved to S3: ${key}`);
        return key;
    } catch (error) {
        console.error('Error saving content to S3:', error);
        throw new Error('Failed to save content to S3.');
    }
};

const fetchContentFromS3 = async (docId) => {
    const newKey = `documents/${docId}/content.txt`;
    const oldKey = `documents/${docId}/latest.txt`; // Fallback key

    // Try fetching with the new key first
    try {
        const params = {
            Bucket: S3_BUCKET_NAME,
            Key: newKey,
        };
        const { Body } = await s3.send(new GetObjectCommand(params));
        console.log(`Content fetched from S3: ${newKey}`);
        return Body.transformToString();
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            // If new key not found, try fetching with the old key
            try {
                const params = {
                    Bucket: S3_BUCKET_NAME,
                    Key: oldKey,
                };
                const { Body } = await s3.send(new GetObjectCommand(params));
                console.log(`Content fetched from S3 (fallback): ${oldKey}`);
                return Body.transformToString();
            } catch (fallbackError) {
                if (fallbackError.name === 'NoSuchKey') {
                    return ''; // Return empty string if neither key exists
                }
                console.error('Error fetching content from S3 with fallback:', fallbackError);
                throw new Error('Failed to fetch content from S3 with fallback.');
            }
        }
        console.error('Error fetching content from S3:', error);
        throw new Error('Failed to fetch content from S3.');
    }
};

const deleteS3Object = async (key) => {
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: key,
    };
    try {
        await s3.send(new DeleteObjectCommand(params));
        console.log(`S3 object deleted: ${key}`);
    } catch (error) {
        console.error('Error deleting S3 object:', error);
        throw new Error('Failed to delete S3 object.');
    }
};

module.exports = {
    generateS3Key,
    saveContentToS3,
    fetchContentFromS3,
    deleteS3Object,
};
