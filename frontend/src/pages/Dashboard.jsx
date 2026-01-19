import {
  FileText,
  Users,
  Clock,
  Database,
  Grid,
  List,
  Filter,
} from "lucide-react";
import DocumentList from "../components/dashboard/DocumentList";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useDocuments } from "../contexts/DocumentContext";
import { activityService } from "../services/activityService";
import { documentService } from "../services/documentService"; // Import documentService

export default function Dashboard() {
  const { documents, toggleStar, deleteDocument, isLoading, refreshDocuments } = useDocuments(); // Add refreshDocuments
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    activityService.getActiveUsers().then(setActiveUsers);
  }, []);

  useEffect(() => {
    refreshDocuments(documentService.getOwnedDocuments); // Call refreshDocuments with the specific fetch function
  }, [refreshDocuments]); // Dependency on refreshDocuments

  // Calculate Stats
  const stats = useMemo(() => {
    const total = documents.length;

    const collaborators = new Set();
    documents.forEach((doc) => {
      if (doc.collaborators) {
        doc.collaborators.forEach((c) => collaborators.add(c.name));
      }
    });
    const activeCollaborators = collaborators.size;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const editsThisWeek = documents.filter(
      (doc) => new Date(doc.updatedAtDate) > oneWeekAgo
    ).length;

    return {
      total,
      collaborators: activeCollaborators,
      editsThisWeek,
    };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    let result = documents.filter((doc) => doc.status !== "archived");
    if (filterType !== "all") {
      result = result.filter((doc) => doc.type === filterType);
    }
    return result;
  }, [documents, filterType]);

  const handleSort = (type) => {
    toast.success(`Sorted by ${type}`);
    // Sorting logic is handled by service mostly or we can add local sort state here
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading documents...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">
                Documents created by you
              </p>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <DocumentList
          documents={filteredDocuments}
          viewMode={viewMode}
          onStar={toggleStar}
          onDelete={deleteDocument}
        />
      </div>
    </div>
  );
}
