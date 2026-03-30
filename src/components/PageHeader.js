import React from 'react';

const PageHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{title}</h1>
    {subtitle && <p className="mt-1 text-md text-slate-500 dark:text-slate-400">{subtitle}</p>}
  </div>
);

export default PageHeader;