import {
  Layout,
  FileText,
  Star,
  Clock,
  Trash,
  Settings,
  Folder,
  X,
  LogOut, // Added LogOut icon
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { documentService, mapDoc } from "../../services/documentService"; // Import mapDoc
import { useDocuments } from "../../contexts/DocumentContext";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth
import { toast } from "sonner";

const navigation = [
  { name: "My Documents", href: "/dashboard", icon: FileText },
  { name: "Shared with Me", href: "/shared", icon: Layout },
];

const bottomNav = [
  { name: "Trash", href: "/trash", icon: Trash },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const { addDocument } = useDocuments();
  const { user, logout } = useAuth(); // Get user and logout from AuthContext

  useEffect(() => {
    const fetchFolders = async () => {
      const data = await documentService.getFolders();
      setFolders(data);
    };
    fetchFolders();
  }, []);

  const handleNewDocument = async () => {
    try {
      const newDoc = await documentService.createDocument("Untitled Document");
      toast.success(`Document "${newDoc.title}" created!`);
      
      // Add the formatted new document to the context state
      addDocument(mapDoc(newDoc));
      
      // Navigate to the new document
      navigate(`/document/${newDoc.docId}`);
    } catch (error) {
      toast.error("Failed to create document.");
      console.error(error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden",
          isOpen
            ? "opacity-100 ease-out duration-300"
            : "opacity-0 ease-in duration-200 pointer-events-none"
        )}
        onClick={onClose}
      ></div>

      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-text transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-sidebar">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary-500 mr-2" />
            <span className="text-xl font-bold text-white">CloudMd</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-4">
          <button
            onClick={handleNewDocument}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <span className="mr-2">+</span> New Document
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  isActive
                    ? "bg-sidebar-active text-white"
                    : "text-gray-400 hover:bg-sidebar-hover hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                )}
              >
                <item.icon
                  className={clsx(
                    isActive
                      ? "text-primary-500"
                      : "text-gray-500 group-hover:text-gray-300",
                    "mr-3 flex-shrink-0 h-5 w-5"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        {user && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full flex items-center px-2 py-2 mb-3 text-sm font-medium rounded-md text-gray-400 hover:bg-sidebar-hover hover:text-white transition-colors"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
              Logout
            </button>
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg mr-3">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user.name || user.email}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </>
  );
}
