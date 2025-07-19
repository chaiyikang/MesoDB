"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Table from "./Table";
import { storeCsvData, getCsvData } from "../utils/csvStorage";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";

export default function HomePageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [data, setData] = useState([]);
	const [headers, setHeaders] = useState([]);
	const [uploadMessage, setUploadMessage] = useState("");

	// Derive state directly from URL parameters
	const searchTerm = searchParams.get("search") || "";
	const sortColumn = searchParams.get("sortCol") || null;
	const sortDirection = searchParams.get("sortDir") || "asc";
	const currentPage = parseInt(searchParams.get("page") || "1", 10);
	const showAll = searchParams.get("showAll") === "true";

	const filters = useMemo(() => {
		const filters = {};
		for (const [key, value] of searchParams.entries()) {
			if (key.startsWith("filter_")) {
				filters[key.replace("filter_", "")] = value;
			}
		}
		return filters;
	}, [searchParams]);

	const itemsPerPage = 10;

	useEffect(() => {
		const initialData = getCsvData();
		if (initialData.length > 0) {
			setData(initialData);
			setHeaders(Object.keys(initialData[0]));
		}
	}, []);

	const handleFileUpload = e => {
		const file = e.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = event => {
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

	const handleSearch = useDebouncedCallback(e => {
		const newSearchTerm = e.target.value;
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (newSearchTerm) {
			newSearchParams.set("search", newSearchTerm);
		} else {
			newSearchParams.delete("search");
		}
		newSearchParams.delete("page"); // Reset page on search
		router.replace(`/?${newSearchParams.toString()}`);
	}, 500);

	const handleSort = useCallback(
		column => {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			const currentSortColumn = newSearchParams.get("sortCol");
			const currentSortDirection = newSearchParams.get("sortDir") || "asc";

			let newSortDirection = "asc";
			if (currentSortColumn === column) {
				newSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
			}

			newSearchParams.set("sortCol", column);
			newSearchParams.set("sortDir", newSortDirection);
			newSearchParams.delete("page"); // Reset page on sort
			router.replace(`/?${newSearchParams.toString()}`);
		},
		[router, searchParams]
	);

	const handleFilterChange = useDebouncedCallback((column, value) => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (value) {
			newSearchParams.set(`filter_${column}`, value);
		} else {
			newSearchParams.delete(`filter_${column}`);
		}
		newSearchParams.delete("page"); // Reset page on filter change
		router.replace(`/?${newSearchParams.toString()}`);
	}, 500);

	const handlePageChange = useCallback(
		pageNumber => {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			newSearchParams.set("page", pageNumber.toString());
			router.replace(`/?${newSearchParams.toString()}`);
		},
		[router, searchParams]
	);

	const handleShowAll = useCallback(
		checked => {
			const newSearchParams = new URLSearchParams(searchParams.toString());
			if (checked) {
				newSearchParams.set("showAll", "true");
			} else {
				newSearchParams.delete("showAll");
			}
			newSearchParams.delete("page"); // Reset page on showAll change
			router.replace(`/?${newSearchParams.toString()}`);
		},
		[router, searchParams]
	);

	const filteredAndSortedData = useMemo(() => {
		let currentFilteredData = data.filter(row => {
			const globalSearchMatch = Object.values(row).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase()));

			const columnFilterMatch = Object.keys(filters).every(column => {
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

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<nav className="bg-gray-800 p-4">
				<div className="container mx-auto flex justify-between items-center">
					<h1 className="text-2xl font-bold">MesoDB</h1>
					<Link href="/summary" className="text-blue-400 hover:underline">
						View Summary
					</Link>
				</div>
			</nav>
			<main className="container mx-auto p-4">
				<div className="mb-4">
					<h2 className="text-xl font-semibold mb-2">Upload CSV</h2>
					<p className="text-gray-400 mb-4">Upload a CSV file to populate the table. The first row should be the header.</p>
					<input
						type="file"
						accept=".csv"
						onChange={handleFileUpload}
						className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
					/>
					{uploadMessage && <p className={`mt-2 text-sm ${uploadMessage.includes("Error") ? "text-red-400" : "text-green-400"}`}>{uploadMessage}</p>}
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
						setShowAll={handleShowAll}
					/>
				)}
			</main>
		</div>
	);
}
