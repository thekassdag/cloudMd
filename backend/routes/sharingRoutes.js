const express = require('express');
const router = express.Router();
const sharingController = require('../controllers/sharingController'); // Will create this next

// POST /documents/:docId/share - Share document with another user
router.post('/:docId/share', sharingController.shareDocument);

// PUT /documents/:docId/share/:userId - Update collaborator permission
router.put('/:docId/share/:userId', sharingController.updateCollaboratorPermission);

// DELETE /documents/:docId/share/:userId - Remove collaborator
router.delete('/:docId/share/:userId', sharingController.removeCollaborator);

// GET /documents/:docId/collaborators - List collaborators
router.get('/:docId/collaborators', sharingController.listCollaborators);

module.exports = router;
