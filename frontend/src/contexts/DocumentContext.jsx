import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const DocumentContext = createContext(undefined);

export function DocumentProvider({ children }) {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const refreshDocuments = useCallback(async (fetchFunction) => {
        if (!user) {
            setDocuments([]); // Clear documents if no user
            return;
        }
        setIsLoading(true);
        try {
            const data = await fetchFunction(); // Use the provided fetchFunction
            setDocuments(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch documents');
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const deleteDocument = async (id, title) => {
        const originalDocuments = [...documents];
        setDocuments(docs => docs.filter(doc => doc.id !== id));
        
        try {
            await documentService.delete(id);
            toast.success(`"${title}" moved to Trash`);
        } catch (err) {
            toast.error(`Failed to delete "${title}"`);
            setDocuments(originalDocuments);
        }
    };

    const addDocument = (newDoc) => {
        // This function assumes the newDoc should be added to the currently displayed list.
        // In a more complex scenario, this might need to be more intelligent
        // (e.g., check if newDoc is owned and we are on the owned documents page).
        setDocuments(prevDocs => [newDoc, ...prevDocs]);
    };

    const updateDocumentInList = useCallback((docId, updatedFields) => {
        setDocuments(prevDocs => 
            prevDocs.map(doc => 
                doc.id === docId ? { ...doc, ...updatedFields } : doc
            )
        );
    }, []);

    return (
        <DocumentContext.Provider value={{ documents, isLoading, error, deleteDocument, refreshDocuments, addDocument, updateDocumentInList }}>
            {children}
        </DocumentContext.Provider>
    );
}

export function useDocuments() {
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
}
