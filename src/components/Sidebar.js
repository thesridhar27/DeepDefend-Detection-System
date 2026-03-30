import React from "react";
import { FaTachometerAlt, FaFileAlt, FaMicrophone, FaHistory, FaCog, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

const Sidebar = ({ onNavigate, onLogout, activePage }) => {
  const navItems = [
    { name: "Dashboard", page: "dashboard", icon: <FaTachometerAlt /> },
    { name: "Text Scan", page: "textscan", icon: <FaFileAlt /> },
    { name: "Audio Scan", page: "audioscan", icon: <FaMicrophone /> },
    { name: "Scan History", page: "history", icon: <FaHistory /> },
    { name: "Settings", page: "settings", icon: <FaCog /> },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col p-4 shadow-lg flex-shrink-0">
      <div className="text-2xl font-bold mb-10 text-white flex items-center pl-2 pt-2">
        <FaShieldAlt className="text-indigo-400 mr-3" />
        <span>DeepDefend</span>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex items-center space-x-3 text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
              activePage === item.page
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <button onClick={onLogout} className="flex items-center space-x-3 text-left hover:bg-red-500/80 hover:text-white mt-auto px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium">
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;