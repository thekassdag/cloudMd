import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorToolbar from '../components/editor/EditorToolbar';
import ShareModal from '../components/shared/ShareModal';
import { useState, useEffect, useCallback } from 'react';
import { Share2, Save, Loader2, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { documentService } from '../services/documentService';
import { useAuth } from '../contexts/AuthContext';
import { useDocuments } from '../contexts/DocumentContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Move StatusIndicator outside the component
const StatusIndicator = ({ status }) => {
    switch (status) {
        case 'saved':
            return <span className="text-sm text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Saved</span>;
        case 'unsaved':
            return <span className="text-sm text-yellow-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Unsaved changes</span>;
        case 'saving':
            return <span className="text-sm text-blue-600 flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</span>;
        case 'error':
            return <span className="text-sm text-red-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Error</span>;
        default:
            return null;
    }
};

export default function DocumentEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { updateDocumentInList, deleteDocument } = useDocuments();

    const [doc, setDoc] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [permissions, setPermissions] = useState({ canEdit: false });

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [status, setStatus] = useState('loading');
    const [contentDirty, setContentDirty] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
            if (!contentDirty) setContentDirty(true);
            setStatus('unsaved');
        },
    });

    useEffect(() => {
        const fetchDocument = async () => {
            if (!id || !user) return;
            setStatus('loading');
            try {
                const fetchedDoc = await documentService.getDocument(id);
                setDoc(fetchedDoc);
                setTitle(fetchedDoc.title);
                setContent(fetchedDoc.content || '');

                const owner = fetchedDoc.ownerId === user.userId;
                setIsOwner(owner);
                const canEdit = owner;
                setPermissions({ canEdit });

                if (editor) {
                    editor.setEditable(canEdit);
                    editor.commands.setContent(fetchedDoc.content || '');
                }
                setStatus('saved');
                setContentDirty(false);
            } catch (_error) { // Changed error to _error
                toast.error("Failed to load document.");
                setStatus('error');
            }
        };
        fetchDocument();
    }, [id, user, editor]);

    const handleTitleSave = async () => {
        if (!permissions.canEdit || title === doc.title) return;
        const originalTitle = doc.title;
        try {
            await documentService.updateDocument(id, { title });
            const now = new Date();
            setDoc(prev => ({ ...prev, title, updatedAt: now.toISOString() }));
            updateDocumentInList(id, { 
                title,
                updatedAt: formatDistanceToNow(now, { addSuffix: true }),
                updatedAtDate: now,
            });
            toast.success('Title saved!');
        } catch (_error) { // Changed error to _error
            setTitle(originalTitle);
            toast.error('Failed to save title.');
        }
    };

    const handleContentSave = useCallback(async () => {
        if (!contentDirty || status === 'saving' || !permissions.canEdit) return;
        setStatus('saving');
        toast.promise(
            documentService.updateDocument(id, { content }),
            {
                loading: 'Saving content...',
                success: () => {
                    const now = new Date();
                    setDoc(prev => ({ ...prev, content, updatedAt: now.toISOString() }));
                    setContentDirty(false);
                    setStatus('saved');
                    updateDocumentInList(id, { 
                        updatedAt: formatDistanceToNow(now, { addSuffix: true }),
                        updatedAtDate: now,
                    });
                    return `Content saved.`;
                },
                error: (_err) => { // Changed err to _err
                    setStatus('error');
                    return "Failed to save content.";
                },
            }
        );
    }, [id, content, contentDirty, status, permissions.canEdit, updateDocumentInList]);

    const handleDelete = () => {
        if (!isOwner) return;
        toast.error(`Are you sure you want to delete "${title}"?`, {
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        await deleteDocument(id, title);
                        navigate('/dashboard');
                    } catch (_error) { // Changed error to _error
                        // The context handles error display
                    }
                },
            },
            duration: 5000,
        });
    };

    if (status === 'loading' && !doc) return <div>Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)] flex flex-col">
            {/* New combined header */}
            <div className="sticky top-0 z-10 bg-white flex flex-col border-b border-gray-100">
                {/* Top row: Title, Status, and Action Buttons */}
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            readOnly={!permissions.canEdit}
                            className={`text-xl font-semibold text-gray-900 bg-transparent focus:outline-none rounded px-2 py-1 ${permissions.canEdit ? 'focus:bg-gray-100' : 'cursor-default'}`}
                        />
                        <div className="mt-1"><StatusIndicator status={status} /></div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {permissions.canEdit && (
                            <button onClick={handleContentSave} disabled={!contentDirty || status === 'saving'} className="btn btn-primary flex items-center px-3 sm:px-4 py-2">
                                {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin sm:mr-2" /> : <Save className="w-4 h-4 sm:mr-2" />}
                                <span className="hidden sm:inline">{status === 'saving' ? 'Saving...' : 'Save'}</span>
                            </button>
                        )}
                        <button onClick={() => setIsShareModalOpen(true)} className="btn btn-secondary flex items-center px-3 sm:px-4 py-2">
                            <Share2 className="w-4 h-4 sm:mr-2" />
                        </button>
                        {isOwner && (
                            <button onClick={handleDelete} className="btn btn-danger flex items-center px-3 py-2" title="Delete Document">
                                <Trash2 className="w-4 h-4 sm:mr-2" />
                            </button>
                        )}
                    </div>
                </div>
                {/* Editor Toolbar */}
                <EditorToolbar editor={editor} readOnly={!permissions.canEdit} />
            </div>

            {/* Content area remains the same */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
                <div className="min-h-full">
                    <EditorContent editor={editor} />
                </div>
            </div>

            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} documentId={id} documentTitle={doc?.title || ''} isOwner={isOwner} />
        </div>
    );
}
