const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController'); // Will create this next

// POST /documents - Create a new document
router.post('/', documentController.createDocument);

// GET /documents/owned - List user's owned documents
router.get('/owned', documentController.listOwnedDocuments);

// GET /documents/shared - List documents shared with the user
router.get('/shared', documentController.listSharedDocuments);

// GET /documents/:docId - Get document metadata + latest content
router.get('/:docId', documentController.getDocument);

// PUT /documents/:docId - Update document metadata (title only)
router.put('/:docId', documentController.updateDocument);

// DELETE /documents/:docId - Delete document
router.delete('/:docId', documentController.deleteDocument);

module.exports = router;
