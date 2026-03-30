import React, { useState } from "react";
import axios from "axios";

const TextScan = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeText = async () => {
    if (!text.trim()) {
      setResult("Please enter some text.");
      setConfidence(null);
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      // Stylometric features
      const words = text.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const sentenceCount = sentences.length || 1;
      const charCount = text.replace(/\s/g, "").length;
      const avgWordLength = charCount / wordCount;
      const avgSentenceLength = wordCount / sentenceCount;
      const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
      const lexicalDiversity = uniqueWords.size / wordCount;
      const punctuationCount = (text.match(/[.,!?;]/g) || []).length;
      const punctuationDensity = punctuationCount / charCount;

      // Score logic
      let aiScore = 0;
      if (avgWordLength > 5) aiScore += 1;
      if (avgSentenceLength > 18) aiScore += 2;
      if (lexicalDiversity < 0.4) aiScore += 2;
      if (punctuationDensity > 0.05) aiScore += 1;

      const isAI = aiScore >= 3;
      const conf = Math.min(100, aiScore * 25 + 25);
      const label = isAI ? "AI-generated" : "Human-written";
      const confPercent = conf.toFixed(2);

      setResult(isAI ? "AI-generated text detected." : "Likely written by a human.");
      setConfidence(`${confPercent}% confidence`);
      setIsLoading(false);

      // ✅ Save to scan history
      try {
        await fetch("http://localhost:8000/save-text-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: localStorage.getItem("email"),
            scan_type: "text",
            label: label,
            confidence: conf,
            scanned_content: text,
          }),
        });
      } catch (err) {
        console.error("Failed to save text scan:", err);
      }
    }, 600); // Simulate delay
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-semibold mb-6">Text Scan (Stylometric AI Detector)</h1>
      <textarea
        className="w-full p-4 border rounded h-48 mb-4 text-black dark:bg-gray-100 dark:text-black mt-2"
        placeholder="Paste or type your text here..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setResult("");
          setConfidence(null);
        }}
      />
      <div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={analyzeText}
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {result && (
        <div className="mt-6 bg-white rounded-xl shadow p-4 border dark:bg-gray-200">
          <p className="text-lg font-medium text-black mt-2">{result}</p>
          {confidence && (
            <p className="text-sm text-gray-600 mt-2">Confidence: {confidence}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextScan;
