"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Table from "./Table";
import { storeCsvData, getCsvData } from "../utils/csvStorage";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const initialSearchTerm = searchParams.get('search') || '';
  const initialSortColumn = searchParams.get('sortCol') || null;
  const initialSortDirection = searchParams.get('sortDir') || 'asc';
  const initialCurrentPage = parseInt(searchParams.get('page') || '1', 10);
  const initialShowAll = searchParams.get('showAll') === 'true';
  const initialFilters = useMemo(() => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        filters[key.replace('filter_', '')] = value;
      }
    }
    return filters;
  }, [searchParams]);

  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [uploadMessage, setUploadMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState(initialFilters);
  const [showAll, setShowAll] = useState(initialShowAll);

  useEffect(() => {
    const initialData = getCsvData();
    if (initialData.length > 0) {
      setData(initialData);
      setHeaders(Object.keys(initialData[0]));
    }
  }, []);

  // Update URL parameters whenever state changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set('search', searchTerm);
    if (sortColumn) newSearchParams.set('sortCol', sortColumn);
    if (sortDirection !== 'asc') newSearchParams.set('sortDir', sortDirection);
    if (currentPage !== 1) newSearchParams.set('page', currentPage.toString());
    if (showAll) newSearchParams.set('showAll', 'true');
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newSearchParams.set(`filter_${key}`, value);
    });

    const queryString = newSearchParams.toString();
    router.replace(`/${queryString ? `?${queryString}` : ''}`);
  }, [searchTerm, sortColumn, sortDirection, currentPage, showAll, filters, router]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvString = event.target.result;
      const result = storeCsvData(csvString);

      if (result.success) {
        const updatedData = getCsvData();
        setData(updatedData);
        if (updatedData.length > 0) {
          setHeaders(Object.keys(updatedData[0]));
        }
        setUploadMessage(result.message);
      } else {
        setUploadMessage(result.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleSort = useCallback((column) => {
    setSortColumn(prevCol => prevCol === column ? null : column);
    setSortDirection(prevDir => (sortColumn === column ? (prevDir === "asc" ? "desc" : "asc") : "asc"));
    setCurrentPage(1); // Reset to first page on sort
  }, [sortColumn]);

  const handleFilterChange = useCallback((column, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let currentFilteredData = data.filter((row) => {
      const globalSearchMatch = Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const columnFilterMatch = Object.keys(filters).every((column) => {
        const filterValue = filters[column].toLowerCase();
        return String(row[column]).toLowerCase().includes(filterValue);
      });

      return globalSearchMatch && columnFilterMatch;
    });

    if (sortColumn) {
      currentFilteredData.sort((a, b) => {
        const aValue = String(a[sortColumn]).toLowerCase();
        const bValue = String(b[sortColumn]).toLowerCase();

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return currentFilteredData;
  }, [data, searchTerm, sortColumn, sortDirection, filters]);

  const paginatedData = useMemo(() => {
    if (showAll) {
      return filteredAndSortedData;
    }
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, itemsPerPage, filteredAndSortedData, showAll]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedData.length / itemsPerPage);
  }, [filteredAndSortedData, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">MesoDB</h1>
          <Link href="/summary" className="text-blue-400 hover:underline">View Summary</Link>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Upload CSV</h2>
          <p className="text-gray-400 mb-4">
            Upload a CSV file to populate the table. The first row should be the
            header.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
          />
          {uploadMessage && (
            <p className={`mt-2 text-sm ${uploadMessage.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {uploadMessage}
            </p>
          )}
        </div>

        {data.length > 0 && (
          <Table
            data={data}
            headers={headers}
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            handleSort={handleSort}
            filters={filters}
            handleFilterChange={handleFilterChange}
            paginatedData={paginatedData}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            showAll={showAll}
            setShowAll={setShowAll}
          />
        )}
      </main>
    </div>
  );
}
