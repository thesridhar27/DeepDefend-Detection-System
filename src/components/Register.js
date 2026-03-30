import React, { useState } from "react";
import { FaShieldAlt } from 'react-icons/fa';

const Register = ({ onOtpSent, setRegisteredEmail, onBackToLoginClick }) => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "email" ? value.trim() : value.trimStart(),
    });
  };

  const handleSendOtp = async () => {
    // --- All validation logic is here ---
    for (let key in form) {
      if (!form[key]) {
        return alert(`Please fill in your ${key.replace(/([A-Z])/g, " $1")}`);
      }
    }
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }
    if (form.password.length < 16) {
      return alert("Password must be at least 16 characters long.");
    }
    if (!/[A-Z]/.test(form.password)) {
      // 👇 This is the new validation check
      return alert("Password must contain at least one capital letter.");
    }
    if (!/\d/.test(form.password)) {
      return alert("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      return alert("Password must contain at least one special character.");
    }
    // --- End of validation logic ---

    setLoading(true);
    try {
      // Step 1: Check if the email already exists
      const checkRes = await fetch("http://localhost:5000/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim() }),
      });

      const checkData = await checkRes.json();

      if (checkData.exists) {
        // If the email exists, alert the user and redirect
        alert("This email is already registered. Please log in.");
        onBackToLoginClick(); // This redirects to the login page
        return; // Stop the function here
      }

      // Step 2: If the email doesn't exist, proceed to send the OTP
      const otpRes = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim() }),
      });

      const otpData = await otpRes.json();

      if (otpRes.ok) {
        setRegisteredEmail(form.email.trim());
        onOtpSent(form, otpData.otp);
      } else {
        alert(otpData.error || "OTP sending failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during the registration process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen font-sans bg-slate-50 dark:bg-slate-900">
      {/* Left Column: GIF Background and Branding */}
      <div className="hidden lg:flex flex-col items-start justify-between w-1/2 min-h-screen bg-black p-12 text-white relative">
        <img 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-30" 
          src="/assets/video.gif"
          alt="Animated background"
        />
        <div className="relative z-10 flex items-center text-3xl font-bold">
          <FaShieldAlt className="text-indigo-400 mr-3" />
          <span>DeepDefend</span>
        </div>
        <div className="relative z-10">
          
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Create Your Account
              </h2>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                  <input name="firstname" type="text" placeholder="John" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                  <input name="lastname" type="text" placeholder="Doe" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input name="email" type="email" placeholder="you@example.com" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
                <div className="text-right text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer mt-1 font-medium" onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ? "Hide Passwords" : "Show Passwords"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all duration-200"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLoginClick}
                  className="text-indigo-600 hover:underline text-sm font-medium dark:text-indigo-400"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

