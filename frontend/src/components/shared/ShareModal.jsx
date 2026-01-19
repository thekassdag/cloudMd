import { X, Globe, Lock, Mail, Trash2, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sharingService } from '../../services/sharingService';

const generateAvatarUrl = (name) => {
    if (!name) name = 'Unknown';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
};

export default function ShareModal({ isOpen, onClose, documentId, documentTitle, isOwner }) {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('view');
    const [sharedUsers, setSharedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen && documentId) {
            loadShareData();
        }
    }, [isOpen, documentId]);

    const loadShareData = async () => {
        setIsLoading(true);
        try {
            const users = await sharingService.getSharedUsers(documentId);
            setSharedUsers(users);
        } catch (error) {
            toast.error('Failed to load sharing settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareWithUser = async (e) => {
        e.preventDefault();
        if (!isOwner || !email) return;
        setIsSending(true);
        try {
            const newUser = await sharingService.shareWithUser(documentId, { email, permission });
            setSharedUsers(prev => [...prev, newUser]);
            setEmail('');
            toast.success(`Shared with ${newUser.name}`);
        } catch (error) {
            toast.error(error.message || 'Failed to share document');
        } finally {
            setIsSending(false);
        }
    };

    const handlePermissionChange = async (userId, newPermission) => {
        if (!isOwner) return;
        try {
            await sharingService.updateUserPermission(documentId, userId, newPermission);
            setSharedUsers(prev => prev.map(u => u.userId === userId ? { ...u, permission: newPermission } : u));
            toast.success('Permission updated');
        } catch (error) {
            toast.error('Failed to update permission');
        }
    };

    const handleRemoveUser = async (userId, userName) => {
        if (!isOwner) return;
        toast.warning(`Are you sure you want to remove ${userName}?`, {
            action: {
                label: 'Remove',
                onClick: async () => {
                    try {
                        await sharingService.removeUserAccess(documentId, userId);
                        setSharedUsers(prev => prev.filter(u => u.userId !== userId));
                        toast.success(`Removed ${userName}'s access`);
                    } catch (error) {
                        toast.error('Failed to remove access');
                    }
                }
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h3 className="text-lg font-medium">Share "{documentTitle}"</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="px-6 py-6 space-y-6">
                        {isOwner && (
                            <form onSubmit={handleShareWithUser}>
                                <div className="flex space-x-2">
                                    <input type="email" placeholder="Enter email address" className="input w-full" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSending} />
                                    <select value={permission} onChange={(e) => setPermission(e.target.value)} className="input" disabled={isSending}>
                                        <option value="view">Viewer</option>
                                        <option value="edit">Editor</option>
                                    </select>
                                    <button type="submit" className="btn btn-primary" disabled={!email || isSending}>{isSending ? 'Sending...' : 'Send'}</button>
                                </div>
                            </form>
                        )}
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-3">People with access</h4>
                            {isLoading ? <div className="text-center py-4">Loading...</div> : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {sharedUsers.map((user) => (
                                        <div key={user.userId} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img className="h-8 w-8 rounded-full" src={generateAvatarUrl(user.name)} alt={user.name} />
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            {user.permission === 'owner' ? <span className="text-sm text-gray-500">Owner</span> : (
                                                <div className="flex items-center">
                                                    <select value={user.permission} onChange={(e) => handlePermissionChange(user.userId, e.target.value)} disabled={!isOwner} className="input text-sm">
                                                        <option value="view">Viewer</option>
                                                        <option value="edit">Editor</option>
                                                    </select>
                                                    {isOwner && (
                                                        <button onClick={() => handleRemoveUser(user.userId, user.name)} className="ml-2 text-gray-400 hover:text-red-600" title="Remove access">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-end items-center">
                        <button onClick={onClose} className="btn btn-primary px-6">Done</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
