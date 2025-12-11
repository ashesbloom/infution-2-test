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
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fitnessLevel, setFitnessLevel] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // lock page scroll
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

  // ⭐ CONSTANT (NON-ANIMATED) GLOW – Matches Register
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
    <>
      <div className="min-h-screen fixed inset-0 overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex items-start justify-center p-4 sm:p-6 md:p-8 pt-16 font-sans selection:bg-amber-500 selection:text-black relative">

        {/* BACKGROUND DOODLES */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
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
          <div className="text-center">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-[0.15em] uppercase">
              INFUSE<span className="text-[#f5b014]">D.</span>
            </span>
          </div>

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
                  className={`absolute left-3 top-3 h-5 w-5 ${
                    email ? "text-[#f5b014]" : "text-neutral-600"
                  }`}
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
                  className={`absolute left-3 top-3 h-5 w-5 ${
                    password ? "text-[#f5b014]" : "text-neutral-600"
                  }`}
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
    </>
  );
};

export default Login;  