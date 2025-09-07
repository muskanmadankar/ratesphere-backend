import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  // Define color classes based on the color prop
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  // Default to blue if color not specified or invalid
  const iconBgClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex items-center border border-gray-100">
      <div className={`rounded-full p-3 ${iconBgClass} shadow-inner`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;