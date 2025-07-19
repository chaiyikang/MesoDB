"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { getCsvData } from "../utils/csvStorage";
import SummaryTable from "../components/SummaryTable";

const SummaryPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- URL State ---
  const sortColumn = searchParams.get('sortCol') || 'Item';
  const sortDirection = searchParams.get('sortDir') || 'asc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const showAll = searchParams.get('showAll') === 'true';
  const searchTerm = searchParams.get('search') || '';
  const filters = useMemo(() => {
    const newFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        newFilters[key.replace('filter_', '')] = value;
      }
    }
    return newFilters;
  }, [searchParams]);

  // --- Component State ---
  const [data, setData] = useState([]);

  // --- Data Fetching and Processing ---
  useEffect(() => {
    const initialData = getCsvData();
    if (initialData.length > 0) {
      setData(initialData);
    }
  }, []);

  // --- Memoized Calculations ---
  const itemsPerPage = 10;

  const calculateMedian = (prices) => {
    if (prices.length === 0) return 0;
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    if (sortedPrices.length % 2 === 0) {
      return (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
    } else {
      return sortedPrices[mid];
    }
  };

  const getTrend = (chartData) => {
    if (chartData.length < 2) {
      return 'neutral';
    }
    const latestPrice = chartData[chartData.length - 1].price;
    const secondLastPrice = chartData[chartData.length - 2].price;

    if (latestPrice > secondLastPrice) {
      return 'up';
    } else if (latestPrice < secondLastPrice) {
      return 'down';
    } else {
      return 'neutral';
    }
  };

  // --- Event Handlers ---
  const handleDebouncedUrlUpdate = useDebouncedCallback((updates) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
        if (value) {
            newSearchParams.set(key, value);
        } else {
            newSearchParams.delete(key);
        }
    }
    newSearchParams.delete('page');
    router.replace(`/summary?${newSearchParams.toString()}`);
  }, 500);

  const handleImmediateUrlUpdate = useCallback((updates) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
        if (value) {
            newSearchParams.set(key, value);
        } else {
            newSearchParams.delete(key);
        }
    }
    newSearchParams.delete('page');
    router.replace(`/summary?${newSearchParams.toString()}`);
}, [router, searchParams]);

  const handleSearch = useCallback((e) => {
    handleDebouncedUrlUpdate({ search: e.target.value });
  }, [handleDebouncedUrlUpdate]);

  const handleSort = useCallback((column) => {
    const currentSortColumn = searchParams.get('sortCol');
    const currentSortDirection = searchParams.get('sortDir') || 'asc';
    let newSortDirection = 'asc';
    if (currentSortColumn === column) {
      newSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    }
    handleImmediateUrlUpdate({ sortCol: column, sortDir: newSortDirection });
  }, [searchParams, handleImmediateUrlUpdate]);

  const handleFilterChange = useCallback((column, value) => {
    handleDebouncedUrlUpdate({ [`filter_${column}`]: value });
  }, [handleDebouncedUrlUpdate]);

  const handlePageChange = useCallback((pageNumber) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', pageNumber.toString());
    router.replace(`/summary?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const handleShowAll = useCallback((checked) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (checked) {
      newSearchParams.set('showAll', 'true');
    } else {
      newSearchParams.delete('showAll');
    }
    newSearchParams.delete('page');
    router.replace(`/summary?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const processedData = useMemo(() => {
    const summary = data.reduce((acc, currentItem) => {
      if (!acc[currentItem.Item]) {
        acc[currentItem.Item] = [];
      }
      acc[currentItem.Item].push(currentItem);
      return acc;
    }, {});

    return Object.entries(summary).map(([itemName, itemEntries]) => {
      const sortedEntries = itemEntries.sort((a, b) => new Date(a.Date) - new Date(b.Date));

      const dailyPrices = {};
      sortedEntries.forEach((row) => {
        const date = row.Date;
        const price = row["Unit Price"];
        if (!dailyPrices[date]) {
          dailyPrices[date] = [];
        }
        dailyPrices[date].push(price);
      });

      const chartData = Object.keys(dailyPrices).sort().map((date) => {
        const pricesForDate = dailyPrices[date];
        return {
          date,
          price: calculateMedian(pricesForDate),
        };
      });

      const trend = getTrend(chartData);

      return { itemName, itemEntries: sortedEntries, prices: sortedEntries.map(entry => entry['Unit Price']), trend, chartData };
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
        return true;
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
            setShowAll={handleShowAll}
          />
        )}
      </main>
    </div>
  );
};

export default SummaryPageContent;
