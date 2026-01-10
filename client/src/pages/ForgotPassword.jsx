import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = question + reset
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // STEP 1: Get security question for this email
  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users/security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.securityQuestion) {
        setSecurityQuestion(data.securityQuestion);
        setStep(2);
      } else {
        setMessage(data.message || "No account found with this email.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Answer + new password
  const handleResetWithSecurity = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!strong.test(password)) {
      setMessage(
        "Password needs 1 uppercase, 1 number, 1 special character"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users/reset-password-security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          securityAnswer,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Unable to reset password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-white flex items-center justify-center px-4 text-gray-800 overflow-hidden">
      <div className="w-full max-w-md bg-white/95 border border-gray-200 rounded-2xl shadow-lg backdrop-blur-xl px-6 py-8 flex flex-col justify-center">
        {/* BRAND */}
        <div className="mb-5 text-center">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-[0.3em] uppercase">
            Nutry Health
            <span className="text-[#06a34f]">D.</span>
          </span>
        </div>

        <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 text-center mb-3">
          Reset Your Password
        </p>

        <h1 className="text-2xl sm:text-3xl text-center text-[#06a34f] font-semibold mb-5 tracking-[0.25em] uppercase">
          Forgot Password
        </h1>

        {message && (
          <div className="mb-4 text-center text-sm text-[#06a34f] font-semibold">
            {message}
          </div>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <form onSubmit={handleGetQuestion}>
            <div className="mb-4">
              <label className="block mb-1 text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-transparent text-gray-800 border border-gray-300 
                           focus:border-[#06a34f] focus:ring-1 focus:ring-[#06a34f] outline-none transition-all 
                           placeholder:text-neutral-500 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 rounded-lg font-semibold tracking-[0.2em] uppercase bg-[#06a34f] 
                         text-black hover:bg-[#06a34f]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSubmitting ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {/* STEP 2: QUESTION + ANSWER + NEW PASSWORD */}
        {step === 2 && (
          <form onSubmit={handleResetWithSecurity}>
            <div className="mb-3">
              <label className="block mb-1 text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
                Security Question
              </label>
              <div className="w-full px-4 py-2.5 rounded-lg bg-transparent text-[#06a34f] border border-gray-300 text-sm">
                {securityQuestion}
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
                Your Answer
              </label>
              <input
                type="text"
                placeholder="Enter your answer"
                className="w-full px-4 py-2.5 rounded-lg bg-transparent text-gray-800 border border-gray-300 
                           focus:border-[#06a34f] focus:ring-1 focus:ring-[#06a34f] outline-none transition-all 
                           placeholder:text-neutral-500 text-sm"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
                New Password
              </label>
              <input
                type="password"
                placeholder="Ex: Pass@123"
                className="w-full px-4 py-2.5 rounded-lg bg-transparent text-gray-800 border border-gray-300 
                           focus:border-[#06a34f] focus:ring-1 focus:ring-[#06a34f] outline-none transition-all 
                           placeholder:text-neutral-500 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 rounded-lg bg-transparent text-gray-800 border border-gray-300 
                           focus:border-[#06a34f] focus:ring-1 focus:ring-[#06a34f] outline-none transition-all 
                           placeholder:text-neutral-500 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-semibold tracking-[0.2em] uppercase bg-[#06a34f] 
                         text-black hover:bg-[#06a34f]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-5 text-center text-xs text-neutral-500 tracking-wide">
          Back to{" "}
          <Link to="/login" className="text-[#06a34f] hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
