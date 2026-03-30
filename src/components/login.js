import React, { useState } from "react";
import { FaShieldAlt, FaFileAlt, FaMicrophone, FaBrain, FaChartBar, FaWrench, FaBolt } from 'react-icons/fa';

const Login = ({ onLogin, onRegisterClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("email", email);
        onLogin(data);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during login");
    }
  };

  const features = [
    { icon: <FaFileAlt />, title: "Text-Based AI Detector", text: "Uses stylometric analysis to detect if text is written by large language models." },
    { icon: <FaMicrophone />, title: "Voice Clone Detection", text: "Checks audio for signs of AI-cloned voices using waveform analysis." },
    { icon: <FaBrain />, title: "Downloadable History", text: "Gives the complete saved history of all your scans as a PDF file." },
    { icon: <FaChartBar />, title: "Threat Scoring System", text: "Assigns a confidence score to every scan, indicating the risk level." },
    { icon: <FaWrench />, title: "Image Deepfake Analyzer (Coming Soon)", text: "Future enhancement: Will analyze media for signs of manipulation using GAN fingerprinting." },
    { icon: <FaBolt />, title: "Video Deepfake Detection (Coming Soon)", text: "Future enhancement: Will scan video frames for manipulation artifacts." },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center text-2xl font-bold">
              <FaShieldAlt className="text-indigo-500 mr-2" />
              <span>DeepDefend</span>
            </div>
            <button
              onClick={onRegisterClick}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Login */}
      <main className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img 
            src="/assets/video.gif"
            alt="Abstract background animation"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                <span className="block">Defend Against</span>
                <span className="block text-indigo-500">AI-Powered Threats</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0">
                DeepDefend is a multi-modal platform that scans content to detect AI-generated manipulation, helping you defend against digital fraud.
              </p>
            </div>
            
            {/* Right: Login Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-700">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    Sign In to Your Account
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={onRegisterClick}
                      className="text-indigo-600 hover:underline text-sm font-medium dark:text-indigo-400"
                    >
                      Don’t have an account? Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              A Comprehensive Detection Engine
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400">
              Our specialized AI models are trained to recognize specific artifacts of synthetic generation.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} text={feature.text} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, text }) => (
  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 text-center transform hover:scale-105 hover:shadow-lg transition-all duration-300">
    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white mx-auto mb-4">
      {React.cloneElement(icon, { className: "h-6 w-6" })}
    </div>
    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
      {text}
    </p>
  </div>
);

export default Login;