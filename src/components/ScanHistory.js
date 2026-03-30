import React, { useEffect, useState } from "react";
import axios from "axios";

// This component handles reliable video playback by fetching the video as a blob
const PlayableVideo = ({ itemId, filename }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/get-scan-content/${itemId}`, {
          responseType: 'blob',
        });
        
        const url = URL.createObjectURL(response.data);
        setVideoUrl(url);

      } catch (err) {
        console.error("Failed to fetch video:", err);
        setError("Could not load video.");
      }
    };

    if (itemId) {
      fetchVideo();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [itemId]);

  if (error) {
    return <div className="w-48 h-24 flex items-center justify-center bg-gray-900 rounded text-red-500 text-xs text-center p-2">{error}</div>;
  }

  if (!videoUrl) {
    return <div className="w-48 h-24 flex items-center justify-center bg-gray-900 rounded text-white text-xs">Loading Video...</div>;
  }

  return (
    <div>
      <video
        controls
        src={videoUrl}
        poster="/video_placeholder.png"
        className="w-48 rounded shadow border bg-gray-900"
      />
      <p className="mt-1 text-xs text-gray-500 truncate">{filename || "video_file.mp4"}</p>
    </div>
  );
};


const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const email = localStorage.getItem("email");

  useEffect(() => {
    fetchHistory();
  }, [email]);

  const fetchHistory = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/history/${email}`);
      setHistory(res.data.history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadContent = async (item) => {
    // For video, we must fetch as a blob to handle the cross-origin download
    if (item.scan_type === "video") {
      try {
        const response = await axios.get(`http://localhost:8000/get-scan-content/${item.id}`, {
          responseType: 'blob',
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', item.filename || `scan_${item.id}.mp4`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download video:", err);
        alert("Could not download video file.");
      }
      return;
    }

    // For other types, we use the blob method from base64 data
    let mimeType, extension, blobData;

    if (item.scan_type === "image") {
      mimeType = item.mime_type || "image/jpeg";
      extension = "jpg";
      blobData = Uint8Array.from(atob(item.scanned_content), c => c.charCodeAt(0));
    } else if (item.scan_type === "text") {
      mimeType = "text/plain";
      extension = "txt";
      blobData = item.scanned_content;
    } else if (item.scan_type === "audio") {
      mimeType = item.mime_type || "audio/wav";
      extension = "wav";
      blobData = Uint8Array.from(atob(item.scanned_content), c => c.charCodeAt(0));
    }

    if (!blobData) return;

    const blob = new Blob([item.scan_type === "text" ? blobData : blobData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename || `scan_${item.id}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteHistoryItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/delete-history/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const deleteAllHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all history?")) return;
    try {
      await axios.delete(`http://localhost:8000/delete-all-history/${email}`);
      setHistory([]);
    } catch (err) {
      console.error("Delete all failed:", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/export-history-pdf/${email}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "deepdefend_scan_history.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Your Scan History</h1>
        {history.length > 0 && (
          <div className="flex gap-3">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={downloadPDF}
            >
              Download PDF
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={deleteAllHistory}
            >
              Delete All
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500">No history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-800 text-left">
                <th className="p-2">Scanned Content</th>
                <th className="p-2">Type</th>
                <th className="p-2">Result</th>
                <th className="p-2">Confidence</th>
                <th className="p-2">Time</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => {
                const isExpanded = expandedRows.has(item.id);
                const isText = item.scan_type === "text";
                const isAudio = item.scan_type === "audio";
                const isVideo = item.scan_type === "video";

                return (
                  <tr key={item.id} className="border-b dark:border-gray-700">
                    <td className="p-2 align-top max-w-sm whitespace-pre-wrap break-words">
                      {isText ? (
                        <>
                          <div>{isExpanded ? item.scanned_content : `${item.scanned_content.slice(0, 150)}${item.scanned_content.length > 150 ? "..." : ""}`}</div>
                          {item.scanned_content.length > 150 && (
                            <button onClick={() => toggleExpand(item.id)} className="text-blue-600 hover:underline text-xs mt-1">
                              {isExpanded ? "Show Less" : "Show More"}
                            </button>
                          )}
                        </>
                      ) : isAudio ? (
                        <div>
                          <audio controls src={`data:${item.mime_type};base64,${item.scanned_content}`} className="w-48" />
                          <p className="mt-1 text-xs text-gray-500 truncate">{item.filename || "audio_file.wav"}</p>
                        </div>
                      ) : isVideo ? (
                        <PlayableVideo itemId={item.id} filename={item.filename} />
                      ) : (
                        <img src={`data:${item.mime_type};base64,${item.scanned_content}`} alt="Scanned" className="w-24 h-24 object-cover rounded shadow border" />
                      )}
                    </td>
                    <td className="p-2 capitalize">{item.scan_type}</td>
                    <td className="p-2">{item.label}</td>
                    <td className="p-2">{item.confidence}%</td>
                    <td className="p-2">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => downloadContent(item)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs">Download</button>
                      <button onClick={() => deleteHistoryItem(item.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScanHistory;