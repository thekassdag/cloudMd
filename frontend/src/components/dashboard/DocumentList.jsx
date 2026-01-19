import DocumentCard from './DocumentCard';



export default function DocumentList({ documents, viewMode, onStar, onDelete }) {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-center">
                <div className="p-3 bg-gray-50 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
            </div>
        );
    }

    return (
        <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {documents.map(doc => (
                <DocumentCard
                    key={doc.id}
                    {...doc}
                    viewMode={viewMode}
                    onStar={() => onStar(doc.id)}
                    onDelete={() => onDelete(doc.id, doc.title)}
                />
            ))}
        </div>
    );
}
