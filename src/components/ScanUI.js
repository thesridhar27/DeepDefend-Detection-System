import React from 'react';

export const FileInput = ({ onChange, accept }) => (
  <input
    type="file"
    accept={accept}
    onChange={onChange}
    className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-700 dark:file:text-slate-300 dark:hover:file:bg-slate-600"
  />
);

export const ScanButton = ({ onClick, isLoading, isFileSelected }) => (
  <button
    onClick={onClick}
    disabled={isLoading || !isFileSelected}
    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center w-40 h-12"
  >
    {isLoading ? (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Analyzing...</span>
      </>
    ) : (
      "Analyze File"
    )}
  </button>
);

export const ResultCard = ({ result, error }) => {
  if (!result && !error) return null;

  if (error) {
    return (
      <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-500/30">
        <p className="text-lg font-medium text-red-700 dark:text-red-400">❌ Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border dark:border-slate-700">
      <p className="text-lg font-medium text-slate-800 dark:text-white">
        Prediction: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{result.label}</span>
      </p>
      <p className="text-md text-slate-500 dark:text-slate-400 mt-2">
        Confidence: <span className="font-semibold">{result.confidence?.toFixed(2)}%</span>
      </p>
    </div>
  );
};