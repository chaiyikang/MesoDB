// src/app/components/SummaryTable.js
import React from "react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

const SummaryTable = ({
	data,
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
}) => {
	const [hasAnimated, setHasAnimated] = React.useState(false);

	React.useEffect(() => {
		// Set hasAnimated to true after the initial render to disable animation on subsequent renders
		setHasAnimated(true);
	}, []);
	const getTrend = prices => {
		if (prices.length < 2) {
			return "neutral"; // Not enough data to determine trend
		}
		const latestPrice = prices[prices.length - 1];
		const secondLastPrice = prices[prices.length - 2];

		if (latestPrice > secondLastPrice) {
			return "up";
		} else if (latestPrice < secondLastPrice) {
			return "down";
		} else {
			return "neutral";
		}
	};

	return (
		<>
			{data.length > 0 && (
				<div className="mb-4">
					<h2 className="text-xl font-semibold mb-2">Search Summary</h2>
					<input
						type="text"
						placeholder="Search items..."
							defaultValue={searchTerm}
						onChange={handleSearch}
						className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
					/>
					<div className="mt-2">
						<label className="inline-flex items-center">
							<input type="checkbox" className="form-checkbox" checked={showAll} onChange={() => setShowAll(!showAll)} />
							<span className="ml-2 text-gray-300">Show All Entries</span>
						</label>
					</div>
					<button
						onClick={() => console.log(data.map(item => item.item))}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
					>
						Log All Item Names
					</button>
				</div>
			)}

			{data.length > 0 && (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white dark:bg-gray-800">
						<thead>
							<tr>
								<th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
									<div onClick={() => handleSort("Item")} className="cursor-pointer hover:bg-gray-700 p-1 rounded">
										Item
										{sortColumn === "Item" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
									</div>
									<input
										type="text"
											placeholder={`Filter...`}
											defaultValue={filters["Item"] || ""}
										onChange={e => handleFilterChange("Item", e.target.value)}
										className="w-full p-1 mt-1 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:border-blue-500 text-sm normal-case"
										onClick={e => e.stopPropagation()} // Prevent sort when clicking filter input
									/>
								</th>
								<th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
									<div onClick={() => handleSort("Price Trend")} className="cursor-pointer hover:bg-gray-700 p-1 rounded">
										Price Trend
										{sortColumn === "Price Trend" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
									</div>
								</th>
								<th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
									<div onClick={() => handleSort("Trend Indicator")} className="cursor-pointer hover:bg-gray-700 p-1 rounded">
										Trend Indicator
										{sortColumn === "Trend Indicator" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{paginatedData.map(item => {
								const prices = item.prices;
								const min = Math.min(...prices);
								const max = Math.max(...prices);
								const domain = [min - (max - min) * 0.1, max + (max - min) * 0.1];

								return (
									<tr key={item.itemName} className="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100">
											<Link href={`/items/${encodeURIComponent(item.itemName)}`} className="text-blue-600 hover:underline dark:text-blue-400">
												{item.itemName}
											</Link>
										</td>
										<td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100">
											<div className="w-24 h-8">
												                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={item.chartData}>
                            <YAxis domain={domain} hide={true} />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
											</div>
										</td>
										<td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100">
											{item.trend === "up" && <span className="text-green-500">▲ Up</span>}
											{item.trend === "down" && <span className="text-red-500">▼ Down</span>}
											{item.trend === "neutral" && <span className="text-gray-500">-</span>}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{data.length > 0 && totalPages > 1 && !showAll && (
				<div className="flex justify-center items-center mt-4">
					<button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 mx-1 bg-gray-700 rounded disabled:opacity-50">
						Previous
					</button>
					<span className="mx-2 text-gray-300">
						Page {currentPage} of {totalPages}
					</span>
					<button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 mx-1 bg-gray-700 rounded disabled:opacity-50">
						Next
					</button>
				</div>
			)}
		</>
	);
};

export default SummaryTable;
