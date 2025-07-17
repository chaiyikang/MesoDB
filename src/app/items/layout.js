import Link from "next/link";

export default function ItemsLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">MesoDB</h1>
          <Link href="/" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
              Back to Table
            </Link>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
