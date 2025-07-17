"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useRouter, useSearchParams } from 'next/navigation';
import { getCsvData } from "../utils/csvStorage";
import SummaryTable from "../components/SummaryTable";

const SummaryPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState([]);

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
    router.replace(`/summary${queryString ? `?${queryString}` : ''}`);
  }, [searchTerm, sortColumn, sortDirection, currentPage, showAll, filters, router]);

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

  const getTrend = (prices) => {
    if (prices.length < 2) {
      return 'neutral'; // Not enough data to determine trend
    }
    const latestPrice = prices[prices.length - 1];
    const secondLastPrice = prices[prices.length - 2];

    if (latestPrice > secondLastPrice) {
      return 'up';
    } else if (latestPrice < secondLastPrice) {
      return 'down';
    } else {
      return 'neutral';
    }
  };

  const calculateAverage = (prices) => {
    if (prices.length === 0) return 0;
    const sum = prices.reduce((acc, price) => acc + parseFloat(price), 0);
    return sum / prices.length;
  };

  const processedData = useMemo(() => {
    // Group data by item name
    const summary = data.reduce((acc, currentItem) => {
      if (!acc[currentItem.Item]) {
        acc[currentItem.Item] = [];
      }
      acc[currentItem.Item].push(currentItem);
      return acc;
    }, {});

    // Convert summary object to an array of objects for easier filtering/sorting
    return Object.entries(summary).map(([itemName, itemEntries]) => {
      const sortedEntries = itemEntries.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      const prices = sortedEntries.map(entry => entry['Unit Price']);
      const trend = getTrend(prices);

      const dailyPrices = {};
      itemEntries.forEach((row) => {
        const date = row.Date;
        const price = parseFloat(String(row["Unit Price"]).replace(/,/g, ''));
        if (!dailyPrices[date]) {
          dailyPrices[date] = [];
        }
        dailyPrices[date].push(price);
      });

      const chartData = Object.keys(dailyPrices).sort().map((date) => {
        const prices = dailyPrices[date];
        return {
          date,
          price: calculateAverage(prices),
        };
      });

      return { itemName, itemEntries: sortedEntries, prices, trend, chartData };
    });
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let currentFilteredData = processedData.filter((item) => {
      const globalSearchMatch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());

      const columnFilterMatch = Object.keys(filters).every((column) => {
        const filterValue = filters[column].toLowerCase();
        // For summary table, we only filter by item name for now
        if (column === 'Item') {
          return item.itemName.toLowerCase().includes(filterValue);
        }
        return true; // Other columns not directly filterable in summary
      });

      return globalSearchMatch && columnFilterMatch;
    });

    if (sortColumn) {
      currentFilteredData.sort((a, b) => {
        let aValue, bValue;
        if (sortColumn === 'Item') {
          aValue = a.itemName.toLowerCase();
          bValue = b.itemName.toLowerCase();
        } else if (sortColumn === 'Price Trend') {
          // Sort by latest price for price trend column
          aValue = a.prices[a.prices.length - 1] || 0;
          bValue = b.prices[b.prices.length - 1] || 0;
        } else if (sortColumn === 'Trend Indicator') {
          // Sort by trend (up > neutral > down)
          const trendOrder = { 'up': 2, 'neutral': 1, 'down': 0 };
          aValue = trendOrder[a.trend];
          bValue = trendOrder[b.trend];
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return currentFilteredData;
  }, [processedData, searchTerm, sortColumn, sortDirection, filters]);

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
          <h1 className="text-2xl font-bold">MesoDB Summary</h1>
          <Link href="/" className="text-blue-400 hover:underline">Back to Full Table</Link>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {data.length > 0 && (
          <SummaryTable
            data={data}
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
};

export default SummaryPageContent;
