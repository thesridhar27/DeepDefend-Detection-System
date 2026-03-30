import React, { useState } from "react";
import { FaShieldAlt } from 'react-icons/fa';

const VerifyOtp = ({ userData, expectedOtp, onRegisterSuccess }) => {
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (enteredOtp !== expectedOtp) {
      return alert("Incorrect OTP");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully! Please login.");
        onRegisterSuccess();
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen animated-gradient">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center text-3xl font-bold mb-2 text-slate-800 dark:text-white">
            <FaShieldAlt className="text-indigo-500 mr-3" />
            <span>DeepDefend</span>
          </div>
          <h2 className="text-xl text-slate-600 dark:text-slate-400">
            Verify Your Email
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Enter the 6-digit code sent to {userData.email}
          </p>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="otp" className="text-sm font-medium text-slate-700 dark:text-slate-300">Verification Code</label>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength="6"
              className="mt-1 w-full text-center text-2xl tracking-[0.5em] px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all duration-200"
          >
            {loading ? "Verifying..." : "Verify & Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;