import React, { useState } from "react";
import axios from "axios";
import PageHeader from "./PageHeader";
import { FileInput, ScanButton, ResultCard } from "./ScanUI";

const AudioScan = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const email = localStorage.getItem("email");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Please upload a valid audio file.");
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", email);
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict-audio", formData);
      setResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Prediction failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900">
      <PageHeader title="Audio Scan" subtitle="Analyze an audio file for signs of voice cloning or AI manipulation." />

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
        <FileInput onChange={handleFileChange} accept="audio/*" />

        {selectedFile && (
          <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-lg p-4 inline-block">
            <audio controls src={URL.createObjectURL(selectedFile)} className="w-full max-w-md" />
            <p className="mt-2 text-slate-500 text-sm italic">{selectedFile.name}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <ScanButton onClick={handleUpload} isLoading={loading} isFileSelected={!!selectedFile} />
      </div>
      
      <ResultCard result={result} error={error} />
    </div>
  );
};

export default AudioScan;