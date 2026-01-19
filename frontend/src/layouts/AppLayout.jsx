import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useState, useEffect } from 'react';

export default function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Check if the current path is the document editor page
    const isDocumentEditorPage = location.pathname.startsWith('/document/');

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                {!isDocumentEditorPage && (
                    <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                )}
                <main className={`flex-1 relative overflow-y-auto focus:outline-none ${isDocumentEditorPage ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
