import { Bell, Search, Plus, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation(); // Use useLocation hook

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      toast.info(`Searching for "${searchValue}"...`);
      // In a real app, this would filter the list or navigate to search results
    }
  };

  // Determine the current section title
  const getSectionTitle = () => {
    if (location.pathname === "/dashboard") {
      return "My Documents";
    } else if (location.pathname === "/shared") {
      return "Shared with Me";
    }
    return ""; // Default or for other pages
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 mr-4 text-gray-400 hover:text-gray-500 md:hidden focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{getSectionTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search bar and other icons can go here if needed */}
      </div>
    </header>
  );
}
