const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { dynamodb, USERS_TABLE } = require('../config/aws'); // Import DynamoDB client and table name
const { QueryCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb'); // Import v3 commands

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Controller for user signup
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        // Check if user with that email already exists
        const { Items } = await dynamodb.send(new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: 'EmailIndex', // Assuming you have a GSI on email
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email },
        }));

        if (Items && Items.length > 0) {
            return res.status(409).json({ message: 'User with that email already exists.' });
        }

        const userId = uuidv4();
        const now = new Date().toISOString();
        const newUser = {
            userId,
            name,
            email,
            passwordHash: password, // In a real app, hash this password!
            createdAt: now,
            updatedAt: now,
        };

        await dynamodb.send(new PutCommand({
            TableName: USERS_TABLE,
            Item: newUser,
        }));

        res.status(201).json({
            userId: newUser.userId,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt,
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

// Controller for user login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const { Items } = await dynamodb.send(new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: 'EmailIndex', // Assuming you have a GSI on email
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email },
        }));

        const user = Items && Items.length > 0 ? Items[0] : null;

        if (!user || user.passwordHash !== password) { // In a real app, compare hashed passwords
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            userId: user.userId,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Failed to login.' });
    }
};

// Controller to get current user info
exports.getMe = async (req, res) => {
    try {
        const { Item: user } = await dynamodb.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId: req.user.userId },
        }));

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({
            userId: user.userId,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Failed to fetch user info.' });
    }
};
