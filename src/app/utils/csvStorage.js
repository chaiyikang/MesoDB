import Papa from 'papaparse';

/**
 * Stores CSV data in localStorage, handling initialization, appending, and column validation.
 * @param {string} csvString - The CSV data as a string.
 * @returns {object} - An object containing a success status and a message.
 */
export const storeCsvData = (csvString) => {
  const STORAGE_KEY = 'mesodb_csv_data';

  // Parse the new CSV data
  const parseResult = Papa.parse(csvString, {
    header: true, // Treat the first row as headers
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors);
    return { success: false, message: 'Error parsing CSV data.' };
  }

  const newRows = parseResult.data.map(row => {
    if (row["Unit Price"]) {
      row["Unit Price"] = parseFloat(String(row["Unit Price"]).replace(/,/g, ''));
    }
    return row;
  });
  const newHeaders = parseResult.meta.fields;

  // Retrieve existing data from localStorage
  const existingDataString = localStorage.getItem(STORAGE_KEY);
  let existingData = [];
  let existingHeaders = [];

  if (existingDataString) {
    try {
      existingData = JSON.parse(existingDataString);
      // Assuming the first row of existingData (if any) contains headers
      // This is a simplification; a more robust solution might store headers separately
      if (existingData.length > 0) {
        existingHeaders = Object.keys(existingData[0]);
      }
    } catch (e) {
      console.error('Error parsing existing data from localStorage:', e);
      // If existing data is corrupted, treat it as new data
      existingData = [];
    }
  }

  // Validate columns if existing data is present
  if (existingData.length > 0 && existingHeaders.length > 0) {
    const requiredHeaders = ["Item", "Unit Price", "Date"]; // Assuming 'Date' is also required for graphing
    const newHeadersContainRequired = requiredHeaders.every(header => newHeaders.includes(header));
    const existingHeadersContainRequired = requiredHeaders.every(header => existingHeaders.includes(header));

    if (!newHeadersContainRequired) {
      return { success: false, message: `New CSV must contain 'Item', 'Unit Price', and 'Date' columns.` };
    }

    if (!existingHeadersContainRequired) {
      return { success: false, message: `Existing data in localStorage is missing 'Item', 'Unit Price', or 'Date' columns.` };
    }

    const headersMatch = newHeaders.every(header => existingHeaders.includes(header)) &&
                         existingHeaders.every(header => newHeaders.includes(header));
    if (!headersMatch) {
      return { success: false, message: 'Column mismatch: New CSV headers do not match existing data headers exactly.' };
    }
    // Append new rows to existing data
    existingData = [...existingData, ...newRows];
  } else {
    // If no existing data, ensure new data has required headers
    const requiredHeaders = ["Item", "Unit Price", "Date"];
    const newHeadersContainRequired = requiredHeaders.every(header => newHeaders.includes(header));
    if (!newHeadersContainRequired) {
      return { success: false, message: `New CSV must contain 'Item', 'Unit Price', and 'Date' columns.` };
    }
    // Initialize with new data
    existingData = newRows;
  }

  // Store the updated data back into localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    return { success: true, message: 'CSV data successfully stored.' };
  } catch (e) {
    console.error('Error storing data to localStorage:', e);
    return { success: false, message: 'Error storing CSV data to localStorage.' };
  }
};

/**
 * Retrieves CSV data from localStorage.
 * @returns {Array} - An array of objects representing the CSV data, or an empty array if no data.
 */
export const getCsvData = () => {
  const STORAGE_KEY = 'mesodb_csv_data';
  const dataString = localStorage.getItem(STORAGE_KEY);
  if (dataString) {
    try {
      return JSON.parse(dataString);
    } catch (e) {
      console.error('Error parsing data from localStorage:', e);
      return [];
    }
  }
  return [];
};

/**
 * Clears all CSV data from localStorage.
 */
export const clearCsvData = () => {
  const STORAGE_KEY = 'mesodb_csv_data';
  localStorage.removeItem(STORAGE_KEY);
  console.log('CSV data cleared from localStorage.');
};
