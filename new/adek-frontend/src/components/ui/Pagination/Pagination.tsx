import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  className = "",
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex justify-between items-center mt-4 ${className}`}>
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50"
            }`}
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === pageNum
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-50"
                }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === totalPages
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
