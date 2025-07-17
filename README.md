# MesoDB

A customized price tracker application where users can upload CSV data, view accumulated price information, and analyze price summaries for various items.

## Features

-   **CSV Upload:** Easily upload CSV files to populate or update your price data.
-   **Interactive Tables:** Perform basic table operations such as searching, sorting, and filtering your item data.
-   **Price Trend Visualization:** View historical price trends for individual items through interactive line graphs.
-   **Summary View:** Get an overview of all tracked items with their latest prices and trends.

## Tech Stack

-   **Frontend:** Next.js (React) with TailwindCSS for styling.
-   **Backend/Database:** Supabase (used for data storage and potentially authentication, though not fully implemented in this scope).
-   **Language:** JavaScript
-   **Package Manager:** npm

## Getting Started

Follow these steps to set up and run MesoDB locally on your machine.

### Prerequisites

Ensure you have Node.js (which includes npm) installed on your system.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/chaiyikang/MesoDB.git
    cd MesoDB
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Development Server

To start the application in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

To build the application for production deployment:

```bash
npm run build
```

### Running in Production Mode

After building, you can start the production server:

```bash
npm run start
```

### Linting

To check for code quality and style issues:

```bash
npm run lint
```

## Project Structure

-   `src/app/`: Contains the main application source code, following Next.js App Router conventions.
    -   `page.js`: The main landing page.
    -   `layout.js`: The root layout for the application.
    -   `components/`: Reusable React components (e.g., `Table.js`, `SummaryTable.js`).
    -   `items/`: Dynamic routes for individual item pages (`[itemName]/page.js`).
    -   `summary/`: Route for the overall summary page.
    -   `utils/`: Utility functions, including `csvStorage.js` for local data handling.
-   `public/`: Static assets like images and favicons.
-   `next.config.js`: Next.js configuration.
-   `tailwind.config.js`: Tailwind CSS configuration.
-   `package.json`: Project metadata and dependencies.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).