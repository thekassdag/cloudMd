


import apiFetch from './api';
import { API_CONFIG } from '../config/api';

export const sharingService = {
    getSharedUsers: async (documentId) => {
        return apiFetch(API_CONFIG.ENDPOINTS.SHARING.LIST_COLLABORATORS(documentId));
    },

    // Share document with a user via email
    shareWithUser: async (documentId, invitation) => {
        return apiFetch(API_CONFIG.ENDPOINTS.SHARING.SHARE_DOCUMENT(documentId), {
            method: 'POST',
            body: JSON.stringify(invitation),
        });
    },

    // Update user permission
    updateUserPermission: async (
        documentId,
        userId,
        permission
    ) => {
        return apiFetch(API_CONFIG.ENDPOINTS.SHARING.UPDATE_PERMISSION(documentId, userId), {
            method: 'PUT',
            body: JSON.stringify({ permission }),
        });
    },

    // Remove user access
    removeUserAccess: async (documentId, userId) => {
        return apiFetch(API_CONFIG.ENDPOINTS.SHARING.REMOVE_COLLABORATOR(documentId, userId), {
            method: 'DELETE',
        });
    },

    // The following functions are not directly related to the current task but are part of the sharingService.
    // They will remain as mock implementations or require further backend integration.

    // Get share settings for a document
    getShareSettings: async (documentId) => {
        // This would typically fetch from a backend endpoint
        console.warn('getShareSettings is using mock data.');
        return {
            documentId,
            accessLevel: 'restricted',
            allowComments: true,
            allowDownload: true
        };
    },

    // Update share settings
    updateShareSettings: async (documentId, settings) => {
        // This would typically update a backend endpoint
        console.warn('updateShareSettings is using mock data.');
        return { ...settings, documentId };
    },

    // Generate shareable link
    generateShareLink: async (
        documentId,
        permission = 'view',
        expiresAt
    ) => {
        console.warn('generateShareLink is using mock data.');
        const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const baseUrl = window.location.origin;
        return {
            documentId,
            linkId,
            url: `${baseUrl}/shared/${linkId}`,
            accessLevel: 'public',
            permission,
            expiresAt,
            createdAt: new Date(),
            createdBy: 'u1'
        };
    },

    // Validate share link
    validateShareLink: async (linkId) => {
        console.warn('validateShareLink is using mock data.');
        return null;
    },

    // Search users for sharing (autocomplete)
    searchUsers: async (query) => {
        console.warn('searchUsers is using mock data.');
        const mockUsers = [
            { email: 'john@example.com', name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random' },
            { email: 'jane@example.com', name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random' },
            { email: 'bob@example.com', name: 'Bob Johnson', avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=random' }
        ];
        return mockUsers.filter(u =>
            u.email.toLowerCase().includes(query.toLowerCase()) ||
            u.name.toLowerCase().includes(query.toLowerCase())
        );
    }
};
