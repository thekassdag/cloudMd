const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use the same secret as in app.js

const authenticateToken = (req, res, next) => {
    // Allow signup and login without authentication
    if (req.path === '/auth/signup' || req.path === '/auth/login') {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.sendStatus(401); // If no token, unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // If token is invalid, forbidden
        }
        req.user = user; // Attach user payload to request
        next();
    });
};

module.exports = authenticateToken;
