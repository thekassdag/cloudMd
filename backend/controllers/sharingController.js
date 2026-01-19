const { dynamodb, DOCUMENTS_TABLE, USERS_TABLE, SHARED_DOCUMENTS_TABLE } = require('../config/aws');
const { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

// Helper to get user details
const getUserDetails = async (userId) => {
    const { Item } = await dynamodb.send(new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        ProjectionExpression: 'userId, #nm, email',
        ExpressionAttributeNames: { '#nm': 'name' }
    }));
    return Item;
};

// Controller for listing collaborators, now including the owner
exports.listCollaborators = async (req, res) => {
    const { docId } = req.params;
    const requesterId = req.user.userId;

    try {
        const { Item: document } = await dynamodb.send(new GetCommand({
            TableName: DOCUMENTS_TABLE,
            Key: { docId },
        }));

        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        const isOwner = document.ownerId === requesterId;
        if (!isOwner) {
            const { Item: sharedDoc } = await dynamodb.send(new GetCommand({
                TableName: SHARED_DOCUMENTS_TABLE,
                Key: { docId, userId: requesterId },
            }));
            if (!sharedDoc) {
                return res.status(403).json({ message: 'Access denied.' });
            }
        }

        // 1. Get the owner's user details
        const ownerDetails = await getUserDetails(document.ownerId);
        if (!ownerDetails) {
            return res.status(404).json({ message: 'Owner not found.' });
        }
        const peopleWithAccess = [{ ...ownerDetails, permission: 'owner' }];

        // 2. Get all shared entries
        const { Items: sharedEntries } = await dynamodb.send(new QueryCommand({
            TableName: SHARED_DOCUMENTS_TABLE,
            KeyConditionExpression: 'docId = :docId',
            ExpressionAttributeValues: { ':docId': docId },
        }));

        // 3. Get collaborator user details in a batch for efficiency
        if (sharedEntries && sharedEntries.length > 0) {
            const userIds = sharedEntries.map(entry => ({ userId: entry.userId }));
            const { Responses } = await dynamodb.send(new BatchGetCommand({
                RequestItems: {
                    [USERS_TABLE]: {
                        Keys: userIds,
                        ProjectionExpression: 'userId, #nm, email',
                        ExpressionAttributeNames: { '#nm': 'name' }
                    }
                }
            }));
            
            const collaboratorsDetails = Responses[USERS_TABLE];
            
            collaboratorsDetails.forEach(userDetail => {
                const shareInfo = sharedEntries.find(entry => entry.userId === userDetail.userId);
                peopleWithAccess.push({
                    ...userDetail,
                    permission: shareInfo.permission,
                });
            });
        }

        res.json(peopleWithAccess);
    } catch (error) {
        console.error('Error listing collaborators:', error);
        res.status(500).json({ message: 'Failed to list collaborators.' });
    }
};

// Controller for sharing a document
exports.shareDocument = async (req, res) => {
    const { docId } = req.params;
    const { email, permission } = req.body;
    const ownerId = req.user.userId;

    if (!email || !['view', 'edit'].includes(permission)) {
        return res.status(400).json({ message: 'Email and a valid permission (view/edit) are required.' });
    }

    try {
        const { Item: document } = await dynamodb.send(new GetCommand({ TableName: DOCUMENTS_TABLE, Key: { docId } }));
        if (!document || document.ownerId !== ownerId) {
            return res.status(403).json({ message: 'Only the owner can share this document.' });
        }

        const { Items } = await dynamodb.send(new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        }));

        if (!Items || Items.length === 0) {
            return res.status(404).json({ message: `User with email ${email} not found.` });
        }
        const userToShareWith = Items[0];

        if (userToShareWith.userId === ownerId) {
            return res.status(400).json({ message: 'Cannot share a document with its owner.' });
        }

        await dynamodb.send(new PutCommand({
            TableName: SHARED_DOCUMENTS_TABLE,
            Item: { docId, userId: userToShareWith.userId, permission, createdAt: new Date().toISOString() },
        }));

        res.status(201).json({
            ...userToShareWith,
            permission,
        });
    } catch (error) {
        console.error('Error sharing document:', error);
        res.status(500).json({ message: 'Failed to share document.' });
    }
};

// Controller for removing a collaborator
exports.removeCollaborator = async (req, res) => {
    const { docId, userId: collaboratorId } = req.params;
    const ownerId = req.user.userId;

    try {
        const { Item: document } = await dynamodb.send(new GetCommand({ TableName: DOCUMENTS_TABLE, Key: { docId } }));
        if (!document || document.ownerId !== ownerId) {
            return res.status(403).json({ message: 'Only the owner can remove collaborators.' });
        }

        await dynamodb.send(new DeleteCommand({
            TableName: SHARED_DOCUMENTS_TABLE,
            Key: { docId, userId: collaboratorId },
        }));

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing collaborator:', error);
        res.status(500).json({ message: 'Failed to remove collaborator.' });
    }
};

// Controller for updating collaborator permission
exports.updateCollaboratorPermission = async (req, res) => {
    const { docId, userId: collaboratorId } = req.params;
    const { permission } = req.body;
    const ownerId = req.user.userId;

    if (!['view', 'edit'].includes(permission)) {
        return res.status(400).json({ message: 'Valid permission (view/edit) is required.' });
    }

    try {
        const { Item: document } = await dynamodb.send(new GetCommand({ TableName: DOCUMENTS_TABLE, Key: { docId } }));
        if (!document || document.ownerId !== ownerId) {
            return res.status(403).json({ message: 'Only the owner can update permissions.' });
        }

        await dynamodb.send(new UpdateCommand({
            TableName: SHARED_DOCUMENTS_TABLE,
            Key: { docId, userId: collaboratorId },
            UpdateExpression: 'SET permission = :permission',
            ExpressionAttributeValues: { ':permission': permission },
        }));

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating collaborator permission:', error);
        res.status(500).json({ message: 'Failed to update permission.' });
    }
};
