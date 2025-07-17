"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"; // Import Link
import { getCsvData } from "../../utils/csvStorage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const calculateAverage = (prices) => {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, price) => acc + parseFloat(price), 0);
  return sum / prices.length;
};

const calculateMedian = (prices) => {
  if (prices.length === 0) return 0;
  const sortedPrices = [...prices].sort((a, b) => parseFloat(a) - parseFloat(b));
  const mid = Math.floor(sortedPrices.length / 2);
  if (sortedPrices.length % 2 === 0) {
    return (parseFloat(sortedPrices[mid - 1]) + parseFloat(sortedPrices[mid])) / 2;
  } else {
    return parseFloat(sortedPrices[mid]);
  }
};

export default function ItemPage() {
  const params = useParams();
  const itemName = params.itemName ? decodeURIComponent(params.itemName) : "";
  const [itemData, setItemData] = useState([]);
  const [viewType, setViewType] = useState("average"); // 'average' or 'median'

  useEffect(() => {
    const allData = getCsvData();
    const filteredData = allData.filter((row) => row["Item"] === itemName);
    setItemData(filteredData);
  }, [itemName]);

  const chartData = useMemo(() => {
    const dailyPrices = {};

    itemData.forEach((row) => {
      const date = row.Date; // Assuming a 'Date' column
      const price = row["Unit Price"];

      if (!dailyPrices[date]) {
        dailyPrices[date] = [];
      }
      dailyPrices[date].push(price);
    });

    const processedData = Object.keys(dailyPrices).sort().map((date) => {
      const prices = dailyPrices[date];
      return {
        date,
        average: calculateAverage(prices),
        median: calculateMedian(prices),
      };
    });

    return processedData;
  }, [itemData]);

  if (!itemName) {
    return <div className="min-h-screen bg-gray-900 text-white p-4">Loading...</div>;
  }

  if (itemData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">{itemName}</h1>
        <p>No data found for this item.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Price History for {itemName}</h1>

      <div className="mb-4">
        <button
          onClick={() => setViewType("average")}
          className={`px-4 py-2 rounded ${viewType === "average" ? "bg-blue-600" : "bg-gray-700"} mr-2`}
        >
          View Average Price
        </button>
        <button
          onClick={() => setViewType("median")}
          className={`px-4 py-2 rounded ${viewType === "median" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          View Median Price
        </button>
      </div>

      {/* Add the button to navigate to the full table */}
      <div className="mb-4">
        <Link href={`/?search=${encodeURIComponent(itemName)}`}>
          <button className="px-4 py-2 rounded bg-green-600 hover:bg-green-700">
            View in Full Table
          </button>
        </Link>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#999" />
            <YAxis stroke="#999" domain={[0, 'auto']} tickFormatter={(value) => value.toLocaleString()} type="number" />
            <Tooltip 
              formatter={(value, name) => [`${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
              contentStyle={{ backgroundColor: "#333", border: "none" }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={viewType}
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
