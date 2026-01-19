import { useDocuments } from "../contexts/DocumentContext";
import DocumentList from "../components/dashboard/DocumentList";
import { Share2, Grid, List } from "lucide-react";
import { useState, useEffect } from "react"; // Removed useMemo
import { documentService } from "../services/documentService"; // Import documentService

export default function Shared() {
  const { documents, toggleStar, deleteDocument, isLoading, refreshDocuments } = useDocuments(); // Add refreshDocuments
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    refreshDocuments(documentService.getSharedDocuments); // Call refreshDocuments with the specific fetch function
  }, [refreshDocuments]); // Dependency on refreshDocuments

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading documents...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">
              Documents shared by other team members
            </p>
          </div>
        </div>
      </div>

      <DocumentList
        documents={documents} // Pass documents directly
        viewMode={viewMode}
        onStar={toggleStar}
        onDelete={deleteDocument}
      />
    </div>
  );
}
