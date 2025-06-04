// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        ← Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
