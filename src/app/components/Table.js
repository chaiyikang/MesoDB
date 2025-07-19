"use client";
import Link from "next/link";

export default function Table({
  data,
  headers,
  searchTerm,
  handleSearch,
  sortColumn,
  sortDirection,
  handleSort,
  filters,
  handleFilterChange,
  paginatedData,
  currentPage,
  totalPages,
  handlePageChange,
  showAll,
  setShowAll,
}) {
  return (
    <>
      {data.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Search Table</h2>
          <input
            type="text"
            placeholder="Search all columns..."
							defaultValue={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={showAll}
                onChange={() => setShowAll(!showAll)}
              />
              <span className="ml-2 text-gray-300">Show All Entries</span>
            </label>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    <div
                      onClick={() => handleSort(header)}
                      className="cursor-pointer hover:bg-gray-700 p-1 rounded"
                    >
                      {header}
                      {sortColumn === header && (
                        <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={`Filter ${header}...`}
                      value={filters[header] || ""}
                      onChange={(e) =>
                        handleFilterChange(header, e.target.value)
                      }
                      className="w-full p-1 mt-1 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:border-blue-500 text-sm normal-case"
                      onClick={(e) => e.stopPropagation()} // Prevent sort when clicking filter input
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {paginatedData.map((row, i) => (
                <tr key={i}>
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="px-6 py-4 text-sm text-gray-200"
                    >
                      {header === "Item" ? (
                        <Link href={`/items/${encodeURIComponent(row[header])}`} className="text-blue-400 hover:underline">
                          {row[header]}
                        </Link>
                      ) : header === "Unit Price" ? (
                        row[header].toLocaleString()
                      ) : (
                        row[header]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.length > 0 && totalPages > 1 && !showAll && (
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-2 text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
