import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Dumbbell, Target, Zap, Trophy, ShieldCheck,
    FlaskConical, Users, ArrowRight, CheckCircle2, XCircle,
    Microscope, Leaf, ArrowLeft
} from 'lucide-react';
// ❌ Removed: import Footer from '../Footer/Footer';

// --- REUSABLE VALUE CARD COMPONENT ---
const ValueCard = ({ icon: Icon, title, description }) => (
    <div className="group bg-zinc-900/50 border border-white/5 p-8 rounded-xl hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={100} className="text-yellow-500 -rotate-12" />
        </div>
        <div className="relative z-10">
            <div className="w-14 h-14 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-500 text-yellow-500 group-hover:text-black transition-colors duration-300">
                <Icon size={28} />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase mb-3">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    </div>
);

// --- INTERACTIVE PROCESS COMPONENT ---
const ProcessSection = () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            id: 0,
            title: "Global Sourcing",
            icon: Leaf,
            text: "We don't just buy what's cheapest. We scour the globe for raw ingredients with the highest bioavailability. From Creatine to premium Whey Isolate, if it's not the best, it doesn't enter our lab."
        },
        {
            id: 1,
            title: "Clinical Dosing",
            icon: FlaskConical,
            text: "No 'fairy dusting' here. We use ingredients at the exact dosages proven effective in clinical studies. If the study says 5g, we put 5g. Not 4.9g. Not a proprietary blend."
        },
        {
            id: 2,
            title: "Rigorous Testing",
            icon: Microscope,
            text: "Trust is good, checking is better. Every single batch is third-party tested for heavy metals, potency, and banned substances. We are 100% transparent because we have nothing to hide."
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Interactive Buttons */}
            <div className="flex flex-col gap-4">
                {steps.map((step, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveStep(index)}
                        className={`flex items-center gap-6 p-6 rounded-xl border transition-all duration-300 text-left group ${
                            activeStep === index
                                ? 'bg-yellow-500 border-yellow-500'
                                : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className={`p-3 rounded-lg ${activeStep === index ? 'bg-black text-yellow-500' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                            <step.icon size={24} />
                        </div>
                        <div>
                            <h4 className={`text-xl font-black italic uppercase ${activeStep === index ? 'text-black' : 'text-white'}`}>
                                {step.title}
                            </h4>
                        </div>
                    </button>
                ))}
            </div>

            {/* Right: Display Content */}
            <div className="relative h-full min-h-[300px] bg-zinc-900 border border-white/10 rounded-2xl p-8 flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <FlaskConical size={200} className="text-white" />
                </div>

                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`transition-all duration-500 absolute inset-0 p-8 flex flex-col justify-center ${
                            activeStep === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
                        }`}
                    >
                        <step.icon size={48} className="text-yellow-500 mb-6" />
                        <h3 className="text-3xl font-black text-white italic uppercase mb-4">
                            {step.title}
                        </h3>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {step.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

function About_page() {
    // Scroll to top when this page mounts
    useEffect(() => {
        // We keep this instant on mount so the user doesn't see the page scrolling up from the bottom
        window.scrollTo(0, 0);
    }, []);

    // Helper function for smooth scrolling on clicks
    const scrollToTopSmooth = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="bg-black font-sans selection:bg-yellow-500 selection:text-black min-h-screen relative overflow-x-hidden">

            {/* --- BACKGROUND DOODLES --- */}
            <div className="fixed inset-0 pointer-events-none h-full w-full z-0 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]">
                    <Dumbbell className="absolute top-20 left-10 w-32 h-32 -rotate-12 text-yellow-600" />
                    <Trophy className="absolute top-40 right-20 w-40 h-40 rotate-12 text-yellow-600" />
                    <Zap className="absolute bottom-40 left-20 w-24 h-24 rotate-45 text-yellow-600" />
                    <Target className="absolute bottom-20 right-1/3 w-32 h-32 -rotate-12 text-yellow-600" />
                </div>
            </div>

            <div className="relative z-10">
                {/* --- HERO SECTION --- */}
                <section className="relative pt-3 pb-20 px-6 md:px-16 overflow-hidden min-h-[70vh] flex flex-col justify-center">
                    <div className="max-w-[1400px] mx-auto text-center relative z-10">

                        {/* Back to Home Button */}
                        <div className="mb-6 flex justify-center">
                            <Link
                                to="/"
                                onClick={scrollToTopSmooth}
                                className="inline-flex items-center gap-2 py-2 px-4 rounded-full border border-white/10 text-white text-xs font-medium uppercase tracking-widest bg-white/5 hover:bg-yellow-500 hover:text-black transition-colors duration-300 group shadow-md"
                            >
                                <ArrowLeft size={16} className="group-hover:translate-x-[-2px] transition-transform" />
                                Back to Home
                            </Link>
                        </div>

                        <span className="inline-block py-1 px-3 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 font-bold tracking-[0.2em] uppercase text-[10px] mb-6 backdrop-blur-md">
                            EST. 2025 • The New Standard
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white italic uppercase leading-[0.85] tracking-tighter mb-8">
                            Forged In <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                                The Fire
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed border-l-4 border-yellow-500 pl-6 text-left md:text-center md:border-l-0 md:border-t-4 md:pt-6">
                            We are a new breed of supplement company. No legacy. No outdated formulas. Just pure, unadulterated performance for the modern athlete.
                        </p>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-0"></div>
                </section>

                {/* --- SCROLLING MARQUEE --- */}
                <div className="bg-yellow-500 py-4 overflow-hidden relative -rotate-1 scale-105 border-y-4 border-black">
                    <div className="whitespace-nowrap animate-marquee flex gap-8 items-center">
                        {[...Array(10)].map((_, i) => (
                            <React.Fragment key={i}>
                                <span className="text-black font-black italic uppercase text-2xl tracking-tighter">NO FILLERS</span>
                                <span className="text-black font-black text-2xl">•</span>
                                <span className="text-black font-black italic uppercase text-2xl tracking-tighter">FULL TRANSPARENCY</span>
                                <span className="text-black font-black text-2xl">•</span>
                                <span className="text-black font-black italic uppercase text-2xl tracking-tighter">CLINICAL DOSES</span>
                                <span className="text-black font-black text-2xl">•</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* --- OUR MISSION --- */}
                <section className="py-24 px-6 md:px-16 bg-zinc-950">
                    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <div className="order-2 lg:order-1">
                            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase mb-6 leading-none">
                                Disrupting The <br />
                                <span className="text-yellow-500">Status Quo.</span>
                            </h2>
                            <div className="space-y-6 text-gray-400 text-lg">
                                <p>
                                    We looked around the supplement industry and didn't like what we saw. Under-dosed proprietary blends, artificial dyes, and marketing hype masquerading as science.
                                </p>
                                <p>
                                    <strong className="text-white">INFUSED</strong> was born from frustration. As athletes, we wanted products that actually worked. When we couldn't find them, we decided to make them.
                                </p>
                                <p>
                                    We might be the new kids on the block, but that's our advantage. We aren't stuck in the past. We are building the future of sports nutrition.
                                </p>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 relative group">
                            <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
                            <div className="relative z-10 bg-zinc-900 border border-white/10 p-2 rounded-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                                <div className="aspect-[4/5] bg-zinc-800 rounded-xl overflow-hidden relative">
                                    <img
                                        src="/images/product_image.png"
                                        alt="Our Mission"
                                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                                        <p className="text-white font-bold italic text-sm text-center">"We don't cut corners. We create them."</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* --- COMPARISON SECTION --- */}
                <section className="py-24 px-6 md:px-16 bg-black relative border-y border-white/10">
                    <div className="max-w-[1000px] mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                                The <span className="text-yellow-500">Difference</span>
                            </h2>
                            <p className="text-gray-400 mt-4">Why we are worth the switch.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* The Others */}
                            <div className="bg-zinc-900/30 p-8 rounded-2xl border border-white/5 grayscale opacity-70 hover:opacity-100 transition-opacity">
                                <h3 className="text-xl font-bold text-gray-500 uppercase mb-6 flex items-center gap-2">
                                    <XCircle size={20} /> Industry Standard
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-gray-500"><XCircle size={16} /> Proprietary Blends (Hidden doses)</li>
                                    <li className="flex items-center gap-3 text-gray-500"><XCircle size={16} /> Artificial Fillers & Dyes</li>
                                    <li className="flex items-center gap-3 text-gray-500"><XCircle size={16} /> Under-dosed Ingredients</li>
                                    <li className="flex items-center gap-3 text-gray-500"><XCircle size={16} /> Cheap Raw Materials</li>
                                </ul>
                            </div>

                            {/* Us */}
                            <div className="bg-zinc-900 p-8 rounded-2xl border border-yellow-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:scale-[1.02] transition-transform">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/20 blur-[40px]"></div>
                                <h3 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-yellow-500" /> The Infused Way
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 size={16} className="text-yellow-500" /> 100% Fully Transparent Labels</li>
                                    <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 size={16} className="text-yellow-500" /> Zero Artificial Colors</li>
                                    <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 size={16} className="text-yellow-500" /> Clinical Effective Dosages</li>
                                    <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 size={16} className="text-yellow-500" /> Premium Patented Ingredients</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- PROCESS SECTION --- */}
                <section className="py-24 px-6 md:px-16 relative">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="mb-16">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                                Inside The <span className="text-yellow-500">Lab</span>
                            </h2>
                            <p className="text-gray-400 mt-4 max-w-lg">
                                See exactly how we craft the highest quality supplements on the market.
                            </p>
                        </div>
                        <ProcessSection />
                    </div>
                </section>

                {/* --- CORE VALUES GRID --- */}
                <section className="pb-32 px-6 md:px-16 relative">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ValueCard
                                icon={FlaskConical}
                                title="Science First"
                                description="We don't follow trends. We follow data. Every ingredient is selected based on peer-reviewed clinical studies to ensure maximum efficacy."
                            />
                            <ValueCard
                                icon={ShieldCheck}
                                title="Zero Compromise"
                                description="What's on the label is in the bottle. We test every batch for purity, potency, and banned substances. Safe for pros, essential for you."
                            />
                            <ValueCard
                                icon={Users}
                                title="Community First"
                                description="We aren't a faceless corporation. We are building a tribe of like-minded individuals who want to push their limits."
                            />
                        </div>
                    </div>
                </section>

                {/* --- CTA SECTION --- */}
                <section className="py-32 px-6 md:px-16 text-center relative overflow-hidden bg-gradient-to-b from-black to-zinc-900 border-t border-white/5">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase mb-8">
                            Be Part of the <br /><span className="text-yellow-500">Beginning.</span>
                        </h2>
                        <p className="text-gray-400 mb-10 text-lg">
                            We are just getting started. Join the Infused movement today and experience the difference of a brand that puts performance first.
                        </p>

                        <Link to="/" onClick={scrollToTopSmooth}>
                            <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm md:text-base uppercase tracking-[0.2em] px-12 py-5 rounded-sm skew-x-[-10deg] shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(234,179,8,0.6)]">
                                <span className="block skew-x-[10deg] flex items-center gap-3">
                                    Shop The Launch <ArrowRight size={20} />
                                </span>
                            </button>
                        </Link>
                    </div>
                </section>

                {/* ADDED: scroll-behavior: smooth to html */}
                <style>{`
          html {
            scroll-behavior: smooth;
          }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>

                {/* ❌ Removed <Footer /> here */}
            </div>
        </div>
    );
}

export default About_page;