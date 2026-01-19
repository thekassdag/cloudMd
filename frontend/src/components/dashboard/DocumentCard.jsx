import {
  FileText,
  MoreVertical,
  Star,
  Trash2,
  Edit,
  Share2,
} from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const statusColors = {
  published: "bg-green-100 text-green-800",
  draft: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
};

export default function DocumentCard({
  id,
  title,
  version,
  updatedAt,
  status,
  isStarred,
  author,
  collaborators = [],
  viewMode = "grid",
  onStar,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Share dialog opened");
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete();
    setShowMenu(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="p-2 mr-3 bg-primary-50 rounded-lg text-primary-600">
            <FileText className="h-6 w-6" />
          </div>
          <Link to={`/document/${id}`} className="block">
            <h3
              className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate"
              title={title}
            >
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">· {updatedAt}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
