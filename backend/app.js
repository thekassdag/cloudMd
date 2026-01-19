require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const authenticateToken = require('./middleware/auth'); // Import authentication middleware
const cors = require('cors');

// Import route modules (will be created next)
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const sharingRoutes = require('./routes/sharingRoutes');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Apply authentication middleware to all routes (except signup/login handled within middleware)
app.use(authenticateToken);

// --- API Routes ---
app.use('/auth', authRoutes); // Mount authentication routes
app.use('/documents', documentRoutes); // Mount document routes
app.use('/documents', sharingRoutes); // Mount sharing routes (nested under /documents)

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port http://127.0.0.1:${PORT}`);
});