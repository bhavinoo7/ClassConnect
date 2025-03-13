export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
        <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
        <a href="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to Home
        </a>
      </div>
    );
  }
  