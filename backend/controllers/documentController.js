const { v4: uuidv4 } = require('uuid');
const { dynamodb, DOCUMENTS_TABLE, SHARED_DOCUMENTS_TABLE, DOCUMENT_VERSIONS_TABLE } = require('../config/aws');
const { saveContentToS3, fetchContentFromS3, deleteS3Object, generateS3Key } = require('../services/s3Service'); // Import S3 service
const { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb'); // Import v3 commands

// Controller for creating a new document
exports.createDocument = async (req, res) => {
    const { title } = req.body;
    const ownerId = req.user.userId;

    if (!title) {
        return res.status(400).json({ message: 'Document title is required.' });
    }

    try {
        const docId = uuidv4();
        const now = new Date().toISOString();
        const newDocument = {
            docId,
            title,
            ownerId,
            createdAt: now,
            updatedAt: now,
        };

        await dynamodb.send(new PutCommand({
            TableName: DOCUMENTS_TABLE,
            Item: newDocument,
        }));

        // Create initial empty file in S3
        await saveContentToS3(docId, '');

        res.status(201).json({
            docId: newDocument.docId,
            title: newDocument.title,
            ownerId: newDocument.ownerId,
            createdAt: newDocument.createdAt,
            updatedAt: newDocument.updatedAt, // Include updatedAt in the response
        });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Failed to create document.' });
    }
};

// Controller for listing user's owned documents
exports.listOwnedDocuments = async (req, res) => {
    const userId = req.user.userId;

    try {
        const { Items: ownedDocs } = await dynamodb.send(new QueryCommand({
            TableName: DOCUMENTS_TABLE,
            IndexName: 'OwnerIdIndex',
            KeyConditionExpression: 'ownerId = :ownerId',
            ExpressionAttributeValues: { ':ownerId': userId },
        }));

        res.json(ownedDocs || []);
    } catch (error) {
        console.error('Error listing owned documents:', error);
        res.status(500).json({ message: 'Failed to list owned documents.' });
    }
};

// Controller for listing documents shared with the user (but not owned by them)
exports.listSharedDocuments = async (req, res) => {
    const userId = req.user.userId;
    const sharedDocs = [];

    try {
        const { Items: sharedEntries } = await dynamodb.send(new QueryCommand({
            TableName: SHARED_DOCUMENTS_TABLE,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId': userId },
        }));

        if (sharedEntries) {
            for (const entry of sharedEntries) {
                const { Item: doc } = await dynamodb.send(new GetCommand({
                    TableName: DOCUMENTS_TABLE,
                    Key: { docId: entry.docId },
                }));
                // Only add if the document is not owned by the current user
                if (doc && doc.ownerId !== userId) {
                    sharedDocs.push({ ...doc, permission: entry.permission });
                }
            }
        }

        res.json(sharedDocs);
    } catch (error) {
        console.error('Error listing shared documents:', error);
        res.status(500).json({ message: 'Failed to list shared documents.' });
    }
};

// Controller for getting a single document
exports.getDocument = async (req, res) => {
    const { docId } = req.params;
    const userId = req.user.userId;

    try {
        const { Item: document } = await dynamodb.send(new GetCommand({
            TableName: DOCUMENTS_TABLE,
            Key: { docId },
        }));

        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Check ownership or shared permission
        const isOwner = document.ownerId === userId;
        let hasSharedPermission = false;
        if (!isOwner) {
            const { Item: sharedDoc } = await dynamodb.send(new GetCommand({
                TableName: SHARED_DOCUMENTS_TABLE,
                Key: { docId, userId },
            }));
            hasSharedPermission = !!sharedDoc;
        }

        if (!isOwner && !hasSharedPermission) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const content = await fetchContentFromS3(docId);

        res.json({
            docId: document.docId,
            title: document.title,
            ownerId: document.ownerId,
            content: content,
            updatedAt: document.updatedAt,
        });
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).json({ message: 'Failed to get document.' });
    }
};

// Controller for updating document metadata (title and/or content)
exports.updateDocument = async (req, res) => {
    const { docId } = req.params;
    const { title, content } = req.body; // Now expecting content as well
    const userId = req.user.userId;

    if (!title && !content) { // Must provide at least title or content
        return res.status(400).json({ message: 'At least title or content is required for update.' });
    }

    try {
        const { Item: document } = await dynamodb.send(new GetCommand({
            TableName: DOCUMENTS_TABLE,
            Key: { docId },
        }));

        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }
        // Check if user has permission to edit (owner or collaborator with edit rights)
        // For now, only owner can update. This needs to be expanded for sharing permissions.
        if (document.ownerId !== userId) {
            return res.status(403).json({ message: 'Only the owner can update this document.' });
        }

        const now = new Date().toISOString();
        let UpdateExpression = 'SET updatedAt = :updatedAt';
        const ExpressionAttributeValues = {
            ':updatedAt': now,
        };

        if (title) {
            UpdateExpression += ', title = :title';
            ExpressionAttributeValues[':title'] = title;
        }

        // If content is provided, save it to S3
        if (content !== undefined) { // Check for undefined, as content could be an empty string
            await saveContentToS3(docId, content);
            // No need to update DynamoDB for content, as it's stored in S3
        }

        await dynamodb.send(new UpdateCommand({
            TableName: DOCUMENTS_TABLE,
            Key: { docId },
            UpdateExpression,
            ExpressionAttributeValues,
        }));

        res.json({ success: true, updatedAt: now });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Failed to update document.' });
    }
};

// Controller for deleting a document
exports.deleteDocument = async (req, res) => {
    const { docId } = req.params;
    const userId = req.user.userId;

    try {
        const { Item: document } = await dynamodb.send(new GetCommand({
            TableName: DOCUMENTS_TABLE,
            Key: { docId },
        }));

        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }
        if (document.ownerId !== userId) {
            return res.status(403).json({ message: 'Only the owner can delete a document.' });
        }

        // Delete from Documents table
        await dynamodb.send(new DeleteCommand({
            TableName: DOCUMENTS_TABLE,
            Key: { docId },
        }));

        // Delete related SharedDocuments (assuming docId is partition key)
        const { Items: sharedEntries } = await dynamodb.send(new QueryCommand({
            TableName: SHARED_DOCUMENTS_TABLE,
            KeyConditionExpression: 'docId = :docId',
            ExpressionAttributeValues: { ':docId': docId },
        }));

        if (sharedEntries) {
            for (const entry of sharedEntries) {
                await dynamodb.send(new DeleteCommand({
                    TableName: SHARED_DOCUMENTS_TABLE,
                    Key: { docId: entry.docId, userId: entry.userId },
                }));
            }
        }

        // Delete related DocumentVersions (assuming docId is partition key)
        const { Items: versions } = await dynamodb.send(new QueryCommand({
            TableName: DOCUMENT_VERSIONS_TABLE,
            KeyConditionExpression: 'docId = :docId',
            ExpressionAttributeValues: { ':docId': docId },
        }));

        if (versions) {
            for (const version of versions) {
                await dynamodb.send(new DeleteCommand({
                    TableName: DOCUMENT_VERSIONS_TABLE,
                    Key: { docId: version.docId, version: version.version },
                }));
                // Also delete corresponding S3 objects for versions
                await deleteS3Object(version.s3Key);
            }
        }

        // Delete latest content from S3
        await deleteS3Object(generateS3Key(docId, 'latest'));

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document.' });
    }
};
