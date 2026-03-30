import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ScanHistory from "./components/ScanHistory";
import Settings from "./components/settings";
import TextScan from "./components/TextScan";
import ImageScan from "./components/ImageScan";
import AudioScan from "./components/AudioScan";
import VideoScan from "./components/VideoScan";
import Login from "./components/login";
import Register from "./components/Register";
import VerifyOtp from "./components/VerifyOtp";

function App() {
  // 👇 1. Initialize state by reading from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userInfo"));
  const [userInfo, setUserInfo] = useState(() => {
    const savedInfo = localStorage.getItem("userInfo");
    return savedInfo ? JSON.parse(savedInfo) : { firstname: "", lastname: "" };
  });
  const [activePage, setActivePage] = useState(localStorage.getItem("activePage") || "dashboard");

  const [darkMode, setDarkMode] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registrationForm, setRegistrationForm] = useState(null);
  const [expectedOtp, setExpectedOtp] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // 👇 2. Save the active page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);


  // 👇 3. Update the login handler to save user info
  const handleLogin = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData)); // Save user object
    setIsLoggedIn(true);
    setUserInfo(userData);
  };

  // 👇 4. Update the logout handler to clear localStorage
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("activePage");
    setIsLoggedIn(false);
    setActivePage("dashboard");
    setUserInfo({ firstname: "", lastname: "" });
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} userInfo={userInfo} />;
      case "textscan":
        return <TextScan />;
      case "imagescan":
        return <ImageScan />;
      case "audioscan":
        return <AudioScan />;
       case "videoscan":
        return <VideoScan />;
      case "history":
        return <ScanHistory />;
      case "settings":
        return <Settings darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />;
      default:
        return <Dashboard onNavigate={setActivePage} userInfo={userInfo} />;
    }
  };

  if (!isLoggedIn) {
    if (showRegister) {
      if (showOtp) {
        return (
          <VerifyOtp
            userData={registrationForm}
            expectedOtp={expectedOtp}
            onRegisterSuccess={() => {
              setShowRegister(false);
              setShowOtp(false);
            }}
          />
        );
      }

      return (
        <Register
          setRegisteredEmail={setRegisteredEmail}
          onOtpSent={(form, otp) => {
            setRegistrationForm(form);
            setExpectedOtp(otp);
            setShowOtp(true);
          }}
          onBackToLoginClick={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login onLogin={handleLogin} onRegisterClick={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors">
      <Sidebar onNavigate={setActivePage} onLogout={handleLogout} />
      {renderPage()}
    </div>
  );
}

export default App;