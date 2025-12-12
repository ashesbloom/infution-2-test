import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Dumbbell,
  Target,
  Zap,
  Trophy,
  Timer,
  Flame,
  Heart,
  Star,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Activity,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

/* -------------------------
   MOBILE LOGIN UI
--------------------------*/
function MobileLoginUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

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

  useEffect(() => {
    const fields = [email, password];
    const count = fields.filter((f) => f && f.length > 3).length;
    if (count === 0) setFitnessLevel(0);
    else if (count < fields.length) setFitnessLevel(1);
    else setFitnessLevel(2);
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccessMsg("Login Successful! Redirecting...");
        login(data);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setSuccessMsg(data.message || "Login Failed");
      }
    } catch (error) {
      setSuccessMsg("Something went wrong");
    }
  };

  const cardStyle = {
    transform: isMounted
      ? "perspective(1200px) rotateY(0deg)"
      : "perspective(1200px) rotateY(6deg)",
    opacity: isMounted ? 1 : 0,
    transition:
      "transform 0.6s cubic-bezier(0.22,0.61,0.36,1), opacity 0.6s ease-out",
    boxShadow:
      "0 0 55px rgba(245,176,20,0.65), inset 0 0 25px rgba(245,176,20,0.35)",
    backfaceVisibility: "hidden",
  };

  return (
    <div className="min-h-screen fixed inset-0 overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex items-start justify-center p-4 sm:p-6 md:p-8 pt-16 font-sans selection:bg-amber-500 selection:text-black relative">
      {/* BACKGROUND DOODLES (hidden on desktop via wrapper) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent z-0" />

        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-700/10 rounded-full blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.12] z-0">
          <Dumbbell className="absolute top-8 left-8 w-20 h-20 -rotate-12 text-amber-500" />
          <Target className="absolute top-6 left-[30%] w-12 h-12 rotate-12 text-amber-400" />
          <Zap className="absolute top-16 left-[45%] w-10 h-10 -rotate-12 text-amber-300" />
          <Flame className="absolute top-6 right-[30%] w-16 h-16 rotate-6 text-amber-600" />
          <Trophy className="absolute top-8 right-16 w-24 h-24 rotate-12 text-amber-500" />
          <Timer className="absolute top-[20%] right-36 w-12 h-12 -rotate-12 text-amber-400" />
          <Heart className="absolute bottom-[30%] left-[35%] w-10 h-10 rotate-12 text-amber-500" />
          <Target className="absolute bottom-[25%] right-[30%] w-12 h-12 -rotate-12 text-amber-600" />
          <Flame className="absolute bottom-16 left-36 w-20 h-20 rotate-6 text-amber-500" />
          <Trophy className="absolute bottom-8 left-8 w-12 h-12 -rotate-12 text-amber-600" />
          <Star className="absolute bottom-8 left-[45%] w-10 h-10 rotate-45 text-amber-400" />
          <Dumbbell className="absolute bottom-36 right-56 w-16 h-16 -rotate-45 text-amber-500" />
          <Zap className="absolute bottom-8 right-16 w-20 h-20 rotate-12 text-amber-400" />
          <Timer className="absolute bottom-28 right-8 w-10 h-10 -rotate-6 text-amber-600" />
        </div>
      </div>

      {/* LOGIN CARD */}
      <div
        className="
          w-full max-w-sm
          mt-0 md:mt-0
          bg-black/85
          border border-white/10
          rounded-3xl
          backdrop-blur-sm
          px-6 py-10
          flex flex-col
          justify-start
          gap-7
          relative z-10
          transition-all
          hover:shadow-[0_0_80px_rgba(245,176,20,0.9)]
        "
        style={cardStyle}
      >
        {/* BRAND */}
        <p to="/" className="text-2xl text-center md:text-3xl font-black italic tracking-tighter text-white group">
                    INFUSE
                    <span className="text-yellow-500 group-hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
                      D.
                    </span>
                  </p>

        <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 text-center">
          Welcome Back
        </p>

        <h1 className="text-xl sm:text-2xl text-center text-[#f5b014] font-bold tracking-[0.2em] uppercase">
          Login
        </h1>

        {successMsg && (
          <div className="text-center text-sm text-[#f5b014] font-semibold">
            {successMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5 w-full mt-2">
          {/* EMAIL */}
          <div>
            <label className="block mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3 top-3 h-5 w-5 ${email ? "text-[#f5b014]" : "text-neutral-600"}`}
              />
              <input
                type="email"
                placeholder="you@example.com"
                className="
                  w-full pl-11 pr-3 py-3
                  rounded-lg bg-transparent text-white
                  border border-neutral-800
                  focus:border-[#f5b014] focus:ring-1 focus:ring-[#f5b014]
                  text-sm
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400">
              Password
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-3 h-5 w-5 ${password ? "text-[#f5b014]" : "text-neutral-600"}`}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="
                  w-full pl-11 pr-10 py-3
                  rounded-lg bg-transparent text-white
                  border border-neutral-800
                  focus:border-[#f5b014] focus:ring-1 focus:ring-[#f5b014]
                  text-sm
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* FORGOT */}
          <div className="text-right -mt-2">
            <Link
              to="/forgot-password"
              className="text-[#f5b014] text-[11px] font-bold uppercase tracking-wide hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* LOGIN BTN */}
          <button
            type="submit"
            className="
              w-full py-3
              rounded-lg
              bg-[#f5b014] text-black
              font-semibold
              tracking-[0.15em] uppercase
              hover:bg-[#f5b014]/90
              transition-colors
              text-sm
            "
          >
            Login
          </button>
        </form>

        <div className="text-center text-sm text-neutral-500">
          New here?{" "}
          <Link to="/register" className="text-[#f5b014] hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   DESKTOP LOGIN UI
--------------------------*/
function DesktopLoginUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fields = [email, password];
    const count = fields.filter((f) => f.length > 3).length;

    if (count === 0) setFitnessLevel(0);
    else if (count < fields.length) setFitnessLevel(1);
    else setFitnessLevel(2);
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccessMsg("Login Successful! Redirecting...");
        login(data);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setSuccessMsg(data.message || "Login Failed");
      }
    } catch (error) {
      console.error(error);
      setSuccessMsg(error.message || "Something went wrong. Try again.");
    }
  };

  const inputClasses =
    "w-full bg-black/40 border border-zinc-800 text-white rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all placeholder:text-zinc-700 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#000000_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex items-start md:items-start justify-center pt-24 md:pt-20 p-4 sm:p-6 md:p-8 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Background Doodles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent z-0"></div>

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-700/10 rounded-full blur-[120px]"></div>

        <div className="absolute inset-0 opacity-[0.12] z-0">
          <Dumbbell className="absolute top-10 left-10 w-24 h-24 -rotate-12 text-amber-500" />
          <Target className="absolute top-5 left-[30%] w-16 h-16 rotate-12 text-amber-400" />
          <Zap className="absolute top-20 left-[45%] w-12 h-12 -rotate-12 text-amber-300" />
          <Flame className="absolute top-5 right-[30%] w-20 h-20 rotate-6 text-amber-600" />
          <Trophy className="absolute top-10 right-20 w-32 h-32 rotate-12 text-amber-500" />

          <Activity className="absolute top-[25%] left-20 w-16 h-16 rotate-45 text-amber-600" />
          <Star className="absolute top-[30%] left-[40%] w-10 h-10 -rotate-12 text-amber-400" />
          <Timer className="absolute top-[20%] right-40 w-16 h-16 -rotate-12 text-amber-400" />

          <Timer className="absolute top-1/2 left-10 w-16 h-16 rotate-12 text-amber-500" />
          <Dumbbell className="absolute top-[60%] left-32 w-28 h-28 -rotate-45 text-amber-600/80" />

          <Activity className="absolute top-1/2 right-10 w-24 h-24 -rotate-12 text-amber-500" />
          <Zap className="absolute top-[55%] right-40 w-14 h-14 rotate-12 text-amber-400" />

          <Heart className="absolute bottom-[30%] left-[35%] w-12 h-12 rotate-12 text-amber-500" />
          <Target className="absolute bottom-[25%] right-[30%] w-16 h-16 -rotate-12 text-amber-600" />

          <Flame className="absolute bottom-20 left-40 w-28 h-28 rotate-6 text-amber-500" />
          <Trophy className="absolute bottom-10 left-10 w-16 h-16 -rotate-12 text-amber-600" />

          <Star className="absolute bottom-10 left-[45%] w-14 h-14 rotate-45 text-amber-400" />

          <Dumbbell className="absolute bottom-40 right-60 w-20 h-20 -rotate-45 text-amber-500" />
          <Zap className="absolute bottom-10 right-20 w-24 h-24 rotate-12 text-amber-400" />
          <Timer className="absolute bottom-32 right-10 w-14 h-14 -rotate-6 text-amber-600" />
        </div>
      </div>

      {/* Main Card */}
      <div className="group w-full max-w-4xl h-full md:h-[600px] bg-zinc-900/60 backdrop-blur-xl rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/5 relative z-10 transition-all duration-500 hover:shadow-[0_0_50px_rgba(245,158,11,0.3)] hover:border-amber-500/30 hover:scale-[1.005]">
        {/* Left Visual / Character */}
        <div className="w-full md:w-1/2 h-56 md:h-full bg-gradient-to-br from-yellow-600 to-yellow-800 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700">
          <div className="absolute inset-0 opacity-20">
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-black/50 rounded-full transition-all duration-1000 ${
                fitnessLevel === 2 ? "scale-150 opacity-0" : "scale-100 opacity-100"
              }`}
            ></div>
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-black/50 rounded-full transition-all duration-1000 delay-100 ${
                fitnessLevel === 2 ? "scale-150 opacity-0" : "scale-100 opacity-100"
              }`}
            ></div>
          </div>

          <div className="absolute top-4 left-4 md:top-8 md:left-0 w-auto md:w-full text-left md:text-center z-20">
            <p className="text-amber-950/80 text-[10px] font-bold tracking-[0.2em] uppercase hidden md:block">
              Built Without Compromise
            </p>
          </div>

          <div className="relative w-32 h-auto md:w-64 md:h-80 flex items-center justify-center z-10 md:mt-6 mx-auto">
            {/* LEVEL 0 */}
            <div
              className={`absolute transition-all duration-700 ease-in-out transform ${
                fitnessLevel === 0 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-90 blur-sm translate-y-10"
              }`}
            >
              <svg viewBox="0 0 200 250" className="w-32 h-auto md:w-56 drop-shadow-2xl">
                <path d="M100 60 C 130 60, 150 80, 150 110 C 150 160, 140 200, 100 200 C 60 200, 50 160, 50 110 C 50 80, 70 60, 100 60" fill="#d4d4d8" />
                <circle cx="100" cy="50" r="30" fill="#e4e4e7" />
                <path d="M85 55 Q 100 45 115 55" stroke="#71717a" strokeWidth="3" fill="none" />
                <circle cx="100" cy="140" r="3" fill="#71717a" opacity="0.5" />
                <path d="M55 100 Q 30 130 40 160" stroke="#d4d4d8" strokeWidth="15" strokeLinecap="round" fill="none" />
                <path d="M145 100 Q 170 130 160 160" stroke="#d4d4d8" strokeWidth="15" strokeLinecap="round" fill="none" />
              </svg>
              <div className="text-center mt-1">
                <span className="bg-white text-black px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center gap-2 mx-auto w-fit border border-amber-500">
                  Journey Begins
                </span>
              </div>
            </div>

            {/* LEVEL 1 */}
            <div
              className={`absolute transition-all duration-700 ease-in-out transform ${
                fitnessLevel === 1 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-110 blur-sm"
              }`}
            >
              <svg viewBox="0 0 200 250" className="w-36 h-auto md:w-60 drop-shadow-2xl">
                <circle cx="130" cy="40" r="3" fill="#fde047" className="animate-bounce" />
                <circle cx="70" cy="45" r="2" fill="#fde047" className="animate-bounce delay-100" />
                <path d="M100 60 C 120 60, 135 80, 135 110 C 135 150, 130 190, 100 200 C 70 190, 65 150, 65 110 C 65 80, 80 60, 100 60" fill="#e4e4e7" />
                <circle cx="100" cy="50" r="30" fill="#fca5a5" />
                <rect x="90" y="55" width="20" height="4" rx="2" fill="#475569" />
                <path d="M65 90 Q 40 110 50 70" stroke="#e4e4e7" strokeWidth="18" strokeLinecap="round" fill="none" />
                <path d="M135 90 Q 160 110 150 70" stroke="#e4e4e7" strokeWidth="18" strokeLinecap="round" fill="none" />
                <line x1="20" y1="70" x2="180" y2="70" stroke="#18181b" strokeWidth="8" />
                <rect x="10" y="55" width="15" height="30" rx="2" fill="#09090b" />
                <rect x="175" y="55" width="15" height="30" rx="2" fill="#09090b" />
                <rect x="40" y="60" width="10" height="20" rx="2" fill="#27272a" />
                <rect x="150" y="60" width="10" height="20" rx="2" fill="#27272a" />
              </svg>
              <div className="text-center mt-2">
                <span className="bg-white text-black px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center gap-2 mx-auto w-fit border border-amber-500">
                  Just do it...
                </span>
              </div>
            </div>

            {/* LEVEL 2 */}
            <div
              className={`absolute transition-all duration-700 ease-in-out transform ${
                fitnessLevel === 2 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-90 translate-y-10 blur-sm"
              }`}
            >
              <svg viewBox="0 0 200 250" className="w-32 h-auto md:w-64 drop-shadow-2xl">
                <circle cx="100" cy="100" r="90" fill="url(#grad1)" opacity="0.8" className="animate-pulse" />
                <defs>
                  <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: "#fde047", stopOpacity: 0.5 }} />
                    <stop offset="100%" style={{ stopColor: "#fbbf24", stopOpacity: 0 }} />
                  </radialGradient>
                </defs>

                <path d="M100 60 L 140 80 L 125 140 L 115 190 L 85 190 L 75 140 L 60 80 Z" fill="#fafafa" />
                <path d="M75 95 Q 100 110 125 95" stroke="#d4d4d8" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M100 95 L 100 130" stroke="#d4d4d8" strokeWidth="2" fill="none" opacity="0.3" />
                <circle cx="100" cy="50" r="28" fill="#fff" />
                <path d="M90 58 Q 100 65 110 58" stroke="#18181b" strokeWidth="2" fill="none" />
                <path d="M60 80 Q 40 90 30 60" stroke="#fafafa" strokeWidth="22" strokeLinecap="round" fill="none" />
                <circle cx="30" cy="60" r="14" fill="#fafafa" />
                <path d="M140 80 Q 160 90 170 60" stroke="#fafafa" strokeWidth="22" strokeLinecap="round" fill="none" />
                <circle cx="170" cy="60" r="14" fill="#fafafa" />
                <path d="M90 140 H 110 M 90 155 H 110 M 92 170 H 108" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="text-center mt-2">
                <span className="bg-white text-black px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center gap-2 mx-auto w-fit border border-amber-500">
                  <Activity size={14} className="text-amber-600" /> Ready!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actual Login Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 flex flex-col justify-center bg-zinc-950/80 relative">
          <div className="transition-all duration-300 ease-in-out transform">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-1.5 uppercase italic tracking-tighter">
              Welcome
              <span className="text-yellow-500 ml-2 ">Back</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-3">Enter your details to access your workout plan.</p>

            {successMsg && <div className="mb-2 text-center text-xs sm:text-sm text-amber-400 font-semibold">{successMsg}</div>}

            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div className="group">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${email ? "text-amber-600 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" : "text-zinc-600"}`} />
                  <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClasses} />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${password ? "text-amber-600 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" : "text-zinc-600"}`} />
                  <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClasses} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-zinc-600 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right -mt-1 mb-1.5">
                <Link to="/forgot-password" className="text-amber-600 text-[11px] font-bold hover:text-amber-500 transition-colors uppercase tracking-wide">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button type="submit" className="w-full bg-[#f5b014] hover: text-black font-black uppercase tracking-wider py-2.5 rounded-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center gap-2 mt-3 group">
                Login
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </form>

            {/* Register link */}
            <div className="mt-4 text-center text-[11px] text-zinc-500">
              New customer?{" "}
              <Link to="/register" className="text-amber-500 hover:text-amber-400 font-semibold">
                Register
              </Link>
            </div>

            {/* Back to Home */}
            <div className="mt-4 flex justify-center">
              <Link to="/" className="flex items-center gap-2 text-zinc-600 hover:text-amber-500 transition-colors group text-[10px] font-bold uppercase tracking-widest hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={13} />
                Back to Home
              </Link>
            </div>
          </div>

          <div className="absolute top-4 right-4 text-zinc-800/50">
            <Dumbbell size={40} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   MASTER EXPORT
--------------------------*/
export default function Login() {
  return (
    <>
      <div className="block md:hidden">
        <MobileLoginUI />
      </div>

      <div className="hidden md:block">
        <DesktopLoginUI />
      </div>
    </>
  );
}