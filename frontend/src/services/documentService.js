
import apiFetch from './api';
import { API_CONFIG } from '../config/api';
import { formatDistanceToNow } from 'date-fns';

export const mapDoc = (doc) => ({
    id: doc.docId,
    title: doc.title,
    updatedAt: formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true }),
    updatedAtDate: new Date(doc.updatedAt),
    status: 'published', // Mocked
    isStarred: false, // Mocked
    author: { name: 'Unknown' }, // Mocked, ownerId is available
    collaborators: [], // Mocked
    type: 'doc', // Mocked
    tags: [], // Mocked
    permission: doc.permission || 'owner', // Add permission
});

export const documentService = {
    getOwnedDocuments: async () => {
        const docs = await apiFetch(API_CONFIG.ENDPOINTS.DOCUMENTS.GET_OWNED);
        return docs.map(mapDoc);
    },

    getSharedDocuments: async () => {
        const docs = await apiFetch(API_CONFIG.ENDPOINTS.DOCUMENTS.GET_SHARED);
        return docs.map(mapDoc);
    },

    getDocument: async (id) => {
        const doc = await apiFetch(API_CONFIG.ENDPOINTS.DOCUMENTS.GET_ONE(id));
        // Note: getDocument returns raw data, not mapped data. This is intentional
        // as the editor component handles the raw fields directly.
        return doc;
    },

    createDocument: async (title) => {
        const newDoc = await apiFetch(API_CONFIG.ENDPOINTS.DOCUMENTS.CREATE, {
            method: 'POST',
            body: JSON.stringify({ title }),
        });
        return newDoc;
    },

    updateDocument: async (id, updates) => {
        const updatedDoc = await apiFetch(API_CONFIG.ENDPOINTS.DOCUMENTS.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return updatedDoc;
    },

    delete: async (id) => {
        await apiFetch(API_CONFIG.ENDPOINTS.DOCUMENTS.DELETE(id), {
            method: 'DELETE',
        });
        return true;
    },

    // Keep other functions as mock for now to avoid breaking UI completely
    getStarred: async () => { return []; },
    getRecent: async () => { return []; },
    getTrash: async () => { return []; },
    toggleStar: async (id) => { return null; },
    getFolders: async () => { return []; }
};
