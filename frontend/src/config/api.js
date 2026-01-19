export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // Default to localhost for development
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/auth/signup',
            LOGIN: '/auth/login',
            CURRENT_USER: '/auth/me',
        },
        DOCUMENTS: {
            CREATE: '/documents',
            GET_OWNED: '/documents/owned',
            GET_SHARED: '/documents/shared',
            GET_ONE: (docId) => `/documents/${docId}`,
            UPDATE: (docId) => `/documents/${docId}`,
            DELETE: (docId) => `/documents/${docId}`,
        },
        VERSIONS: {
            LIST: (docId) => `/documents/${docId}/versions`,
            SAVE: (docId) => `/documents/${docId}/versions`,
            RESTORE: (docId, versionId) => `/documents/${docId}/versions/${versionId}/restore`,
        },
        SHARING: {
            LIST_COLLABORATORS: (docId) => `/documents/${docId}/collaborators`,
            SHARE_DOCUMENT: (docId) => `/documents/${docId}/share`,
            UPDATE_PERMISSION: (docId, userId) => `/documents/${docId}/collaborators/${userId}`,
            REMOVE_COLLABORATOR: (docId, userId) => `/documents/${docId}/collaborators/${userId}`,
        }
    },
};
