import React, { useState, useEffect } from "react";
import { FaFileAlt, FaMicrophone, FaExclamationTriangle } from 'react-icons/fa';
import PageHeader from "./PageHeader";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ onNavigate, userInfo }) => {
  const { firstname } = userInfo;
  const email = localStorage.getItem("email");
  const [chartData, setChartData] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]); // State for the timeline

  // This useEffect fetches data for both the pie chart and the new timeline
  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;
      try {
        const res = await axios.get(`http://localhost:8000/history-summary/${email}`);
        const summary = res.data.summary;
        
        if (summary && summary.length > 0) {
          const labels = summary.map(item => item.scan_type.charAt(0).toUpperCase() + item.scan_type.slice(1));
          const data = summary.map(item => item.count);
          
          setChartData({
            labels,
            datasets: [
              {
                label: '# of Scans',
                data,
                backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(2, 132, 199, 0.7)', 'rgba(225, 29, 72, 0.7)'],
                borderColor: ['rgba(79, 70, 229, 1)', 'rgba(5, 150, 105, 1)', 'rgba(2, 132, 199, 1)', 'rgba(225, 29, 72, 1)'],
                borderWidth: 1,
              },
            ],
          });
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      }

      try {
        const historyRes = await axios.get(`http://localhost:8000/history/${email}`);
        setRecentHistory(historyRes.data.history.slice(0, 4)); // Get the 4 most recent scans
      } catch (err) {
        console.error("Failed to fetch recent history:", err);
      }
    };

    fetchData();
  }, [email]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        }
      },
    },
  };

  const scanOptions = [
    { type: "Text", page: "textscan", icon: <FaFileAlt className="text-3xl text-indigo-500" /> },
    { type: "Audio", page: "audioscan", icon: <FaMicrophone className="text-3xl text-sky-500" /> },
  ];
  
  const iconMap = {
    text: <FaFileAlt className="text-indigo-500" />,
    audio: <FaMicrophone className="text-sky-500" />,
  };

  return (
    <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-900">
      <PageHeader title={`Welcome back, ${firstname}!`} subtitle="Ready to secure your digital content? Start a new scan below." />

      {/* MODIFIED: Changed from md:grid-cols-4 to grid-cols-2 */}
      <div className="grid grid-cols-2 gap-6"> 
        {scanOptions.map(({ type, page, icon }) => (
          <button
            key={type}
            onClick={() => onNavigate(page)}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg p-6 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="mb-4">{icon}</div>
            <span className="text-lg font-medium text-slate-800 dark:text-white">
              {type} Scan
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Recent Threat Summary</h2>
          <div className="space-y-4">
            <ThreatCard title="Phishing Email Detected" risk="High" confidence="92%" type="text" />
            { <ThreatCard title="Deepfake Audio Identified" risk="Medium" confidence="99.6%" type="audio" /> }
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Scan Analysis</h2>
          <div className="relative h-64 flex items-center justify-center">
            {chartData ? <Pie data={chartData} options={chartOptions} /> : <p className="text-slate-400">No scan data to display.</p>}
          </div>
        </div>
      </div>

      {/* 👇 NEW RECENT HISTORY TIMELINE SECTION 👇 */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Recent Activity Timeline</h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          {recentHistory.length > 0 ? (
            <div className="space-y-4">
              {recentHistory.map((item, index) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-3 rounded-full">
                      {iconMap[item.scan_type]}
                    </div>
                    {index < recentHistory.length - 1 && <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-2"></div>}
                  </div>
                  <div className="flex-grow pb-4">
                    <p className="font-medium text-slate-800 dark:text-white truncate">
                      {item.scan_type === 'text' ? `Text Scan: "${item.scanned_content.slice(0, 30)}..."` : item.filename}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={`text-sm font-semibold px-2 py-1 rounded-full h-fit ${
                    item.label.toLowerCase().includes('fake') || item.label.toLowerCase().includes('generated')
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No recent scans found.</p>
          )}
        </div>
      </div>
    </main>
  );
};

const ThreatCard = ({ title, risk, confidence, type }) => {
  const riskStyles = {
    High: { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
    Medium: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    Low: { text: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700`}>
      <div className="flex items-center mb-3">
        <div className={`flex-shrink-0 p-2 rounded-full mr-3 ${riskStyles[risk].bg}`}>
          <FaExclamationTriangle className={`text-lg ${riskStyles[risk].text}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Type: {type}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`font-bold text-2xl ${riskStyles[risk].text}`}>{confidence}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">Confidence</span>
      </div>
    </div>
  );
};

export default Dashboard;