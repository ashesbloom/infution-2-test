import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Dumbbell, Target, Zap, Trophy, Timer, Flame, Heart, Star } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("What is your favorite sport?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtml || "";
      body.style.overflow = prevBody || "";
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setSuccessMsg("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setSuccessMsg("Password must be at least 8 characters");
      return;
    }
    const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!strong.test(password)) {
      setSuccessMsg("Password needs 1 uppercase, 1 number, 1 special character");
      return;
    }
    if (!securityAnswer || securityAnswer.length < 3) {
      setSuccessMsg("Security answer must be at least 3 characters");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          securityQuestion,
          securityAnswer,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccessMsg("Registration Successful! Redirecting...");
        login(data);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setSuccessMsg(data.message || "Registration failed");
      }
    } catch (error) {
      setSuccessMsg("Something went wrong");
    }
  };

  // ⭐ CONSTANT GLOW — NO ANIMATION
  const cardStyle = {
    transform: isMounted ? "perspective(1200px) rotateY(0deg)" : "perspective(1200px) rotateY(6deg)",
    opacity: isMounted ? 1 : 0,
    transition: "transform 0.6s cubic-bezier(0.22,0.61,0.36,1), opacity 0.6s ease-out",
    boxShadow: "0 0 55px rgba(245,176,20,0.65), inset 0 0 25px rgba(245,176,20,0.35)",
    backfaceVisibility: "hidden",
  };

  return (
    <>
      <div className="min-h-screen fixed inset-0 overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex items-start justify-center p-4 sm:p-6 md:p-8 pt-16 font-sans relative">

        {/* Background doodles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
          <div className="absolute inset-0 opacity-[0.12] z-0">
            <Dumbbell className="absolute top-8 left-8 w-20 h-20 -rotate-12 text-amber-500" />
            <Target className="absolute top-6 left-[30%] w-12 h-12 rotate-12 text-amber-400" />
            <Zap className="absolute top-16 left-[45%] w-10 h-10 -rotate-12 text-amber-300" />
            <Flame className="absolute top-6 right-[30%] w-16 h-16 rotate-6 text-amber-600" />
            <Trophy className="absolute top-8 right-16 w-24 h-24 rotate-12 text-amber-500" />
            <Heart className="absolute bottom-[30%] left-[35%] w-10 h-10 rotate-12 text-amber-500" />
            <Star className="absolute bottom-8 left-[45%] w-10 h-10 rotate-45 text-amber-400" />
          </div>
        </div>

        {/* CARD */}
        <div
          className="
            w-full max-w-sm 
            bg-black/80 
            border border-white/10 
            rounded-2xl 
            backdrop-blur-xl 
            px-4 py-6 
            flex flex-col 
            justify-start 
            gap-4 
            relative z-10
            hover:shadow-[0_0_80px_rgba(245,176,20,1)]
            transition-all
          "
          style={cardStyle}
        >
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-extrabold tracking-[0.12em] uppercase">
              INFUSE<span className="text-[#f5b014]">D.</span>
            </span>
          </div>

          <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 text-center">
            Begin Your Journey
          </p>

          <h1 className="text-lg sm:text-xl text-center text-[#f5b014] font-semibold tracking-[0.18em] uppercase">
            Sign Up
          </h1>

          {successMsg && (
            <div className="text-center text-xs sm:text-sm text-[#f5b014] font-semibold">
              {successMsg}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-2">
            <div>
              <label className="block mb-1 text-[10px] font-semibold uppercase text-gray-400">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-neutral-800 focus:border-[#f5b014] focus:ring-[#f5b014] text-sm"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-semibold uppercase text-gray-400">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-neutral-800 focus:border-[#f5b014] focus:ring-[#f5b014] text-sm"
                placeholder="you@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-semibold uppercase text-gray-400">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-neutral-800 focus:border-[#f5b014] focus:ring-[#f5b014] text-sm"
                placeholder="Ex: Pass@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-semibold uppercase text-gray-400">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-neutral-800 focus:border-[#f5b014] focus:ring-[#f5b014] text-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-semibold uppercase text-gray-400">
                Security Question
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-neutral-800 focus:border-[#f5b014] focus:ring-[#f5b014] text-sm"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
              >
                <option className="bg-black text-white">What is your favorite sport?</option>
                <option className="bg-black text-white">What is your favorite movie?</option>
                <option className="bg-black text-white">What is your childhood nickname?</option>
                <option className="bg-black text-white">What is your favourite teacher&apos;s name?</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-semibold uppercase text-gray-400">
                Security Answer
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-neutral-800 focus:border-[#f5b014] focus:ring-[#f5b014] text-sm"
                placeholder="Your answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold uppercase bg-[#f5b014] text-black hover:bg-[#f5b014]/90 transition"
            >
              Register
            </button>
          </form>

          <div className="text-center text-xs text-neutral-500">
            Already have an account?{" "}
            <Link to="/login" className="text-[#f5b014] hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
