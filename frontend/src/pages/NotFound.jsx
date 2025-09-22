import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold" style={{color: '#51ac37'}}>404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="block w-full py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            style={{backgroundColor: '#51ac37'}}
          >
            Go Back Home
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>

        <div className="mt-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.659-2.627M15.659 9.627A7.962 7.962 0 0112 9c-2.34 0-4.29-1.009-5.659-2.627M12 3C8.686 3 6 5.686 6 9s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;