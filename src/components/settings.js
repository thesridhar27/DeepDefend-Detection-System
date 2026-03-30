import React, { useState } from 'react';
import axios from 'axios';
import PageHeader from './PageHeader';
import { FaTrash } from 'react-icons/fa';

const Settings = ({ darkMode, setDarkMode, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("email");

  const handleOpenModal = () => setIsModalOpen(true);
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOtpSent(false);
    setEnteredOtp("");
    setExpectedOtp("");
  };

  const handleSendDeletionOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/send-otp", { email });
      setExpectedOtp(res.data.otp);
      setOtpSent(true);
    } catch (err) {
      alert("Failed to send OTP. Please try again.");
      console.error("OTP send failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (enteredOtp !== expectedOtp) {
      return alert("The OTP you entered is incorrect.");
    }
    setLoading(true);
    try {
    // ✅ This should point to your Flask server
    await axios.post("http://localhost:5000/delete-account", { email });
    alert("Your account has been successfully deleted.");
    onLogout();
  } catch (err) {
    alert("Failed to delete account. Please try again.");
    console.error("Account deletion failed:", err);
  } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900">
      <PageHeader title="Settings" subtitle="Manage your account and application preferences." />

      <div className="max-w-2xl">
        {/* Dark Mode Toggle */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Appearance</h3>
          <div className="flex items-center justify-between mt-4">
            <p className="text-slate-600 dark:text-slate-400">Dark Mode</p>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                darkMode ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Account Deactivation */}
        <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-red-200 dark:border-red-500/30">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Deactivate Account</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            This action is irreversible. All your scan history and associated files will be permanently deleted.
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-4 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <FaTrash />
            <span>Deactivate My Account</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
            {!otpSent ? (
              <>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Are you sure?</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                  To confirm, we will send a one-time password (OTP) to your email: <strong>{email}</strong>.
                </p>
                <div className="flex justify-end gap-4 mt-6">
                  <button onClick={handleCloseModal} className="px-4 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
                  <button onClick={handleSendDeletionOtp} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Enter OTP</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                  Please enter the 6-digit code we sent to your email to permanently delete your account.
                </p>
                <input
                  type="text"
                  maxLength="6"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="mt-4 w-full text-center text-2xl tracking-[0.5em] px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <div className="flex justify-end gap-4 mt-6">
                  <button onClick={handleCloseModal} className="px-4 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
                  <button onClick={handleConfirmDeletion} disabled={loading || enteredOtp.length !== 6} className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-red-400">
                    {loading ? "Deleting..." : "Confirm & Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;