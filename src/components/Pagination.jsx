// Create a separate Pagination component
import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  disabled
}) => {
  // Helper to create an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show max 5 page numbers at once
    
    // Calculate start and end page numbers to display
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };
  
//   if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center my-8 space-x-2">
      {/* First page button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1 || disabled}
        className={`px-3 py-2 rounded ${
          currentPage === 1 || disabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        &laquo;
      </button>
      
      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className={`px-3 py-2 rounded ${
          currentPage === 1 || disabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        &lsaquo;
      </button>
      
      {/* Page numbers */}
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={disabled}
          className={`px-3 py-2 rounded ${
            currentPage === page
              ? 'bg-blue-600 text-white'
              : disabled
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {page}
        </button>
      ))}
      
      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className={`px-3 py-2 rounded ${
          currentPage === totalPages || disabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        &rsaquo;
      </button>
      
      {/* Last page button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages || disabled}
        className={`px-3 py-2 rounded ${
          currentPage === totalPages || disabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;