import React, { useEffect } from 'react';
import { Lock, Eye, Database, Cookie, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar";

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-emerald-500/10 rounded text-emerald-500">
        <Icon size={20} />
      </div>
      <h2 className="text-xl md:text-2xl font-black text-white uppercase italic">
        {title}
      </h2>
    </div>
    <div className="text-gray-400 leading-relaxed space-y-4 pl-[52px] text-sm md:text-base">
      {children}
    </div>
  </div>
);

function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-black min-h-screen font-sans">
      <Navbar />

      <div className="relative pt-3 pb-10 px-6 md:px-16 max-w-[1000px] mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-6 hover:text-white"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic mb-6">
          Privacy <span className="text-emerald-500">Policy</span>
        </h1>

        <div className="bg-zinc-900/30 p-8 md:p-12 rounded-2xl border border-white/5">

          <Section icon={Database} title="Information We Collect">
            <p>We collect personal details like name, email, and address when you place an order.</p>
          </Section>

          <Section icon={Eye} title="How We Use Data">
            <p>Your data is used only for order processing, support, and communication.</p>
          </Section>

          <Section icon={Lock} title="Security">
            <p>We use industry-standard security practices. Payment data is never stored.</p>
          </Section>

          <Section icon={Cookie} title="Cookies">
            <p>Cookies are used to manage sessions and carts.</p>
          </Section>

        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
