import React, { useEffect } from 'react';
import { FileText, ShieldAlert, Scale, ScrollText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar";


const Section = ({ title, children }) => (
  <div className="mb-10 border-l-2 border-gray-200 pl-6 hover:border-emerald-500 transition-colors duration-300">
    <h2 className="text-2xl font-black text-gray-800 uppercase italic mb-4 flex items-center gap-3">
      {title}
    </h2>
    <div className="text-gray-500 leading-relaxed space-y-4 text-sm md:text-base">
      {children}
    </div>
  </div>
);

function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <div className="relative pt-3 pb-20 px-6 md:px-16 max-w-[1000px] mx-auto">

        {/* Header */}
        <div className=" border-b border-gray-200 pb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-6 hover:text-gray-800 transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-gray-800 uppercase italic mb-4">
            Terms <span className="text-emerald-500">&</span> Conditions
          </h1>
          <p className="text-gray-500 text-sm">Last Updated: October 2025</p>
        </div>

        {/* Legal Content */}
        <div className="bg-gray-100/30 p-8 md:p-12 rounded-2xl border border-gray-200 backdrop-blur-sm">

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-lg mb-12 flex gap-4 items-start">
            <ShieldAlert className="text-emerald-500 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-gray-800 font-bold uppercase mb-2">Important Health Disclaimer</h3>
              <p className="text-emerald-500/80 text-sm leading-relaxed">
                The products and claims made about specific products on or through this site have not been evaluated by the FDA.
                These products are not intended to diagnose, treat, cure, or prevent any disease.
                Consult with a physician before starting any diet, exercise, or supplementation program.
              </p>
            </div>
          </div>

          <Section title="1. Introduction">
            <p>Welcome to Nutry Health. By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are prohibited from using this site.</p>
          </Section>

          <Section title="2. Use of Our Service">
            <p>You agree to use our site for lawful purposes only. You must not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>
            <p>We reserve the right to refuse service to anyone for any reason at any time.</p>
          </Section>

          <Section title="3. Products & Pricing">
            <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>
            <p>We have made every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
          </Section>

          <Section title="4. Shipping & Returns">
            <p><strong>Shipping:</strong> We aim to process orders within 24-48 hours. Delivery times are estimates and not guarantees.</p>
            <p><strong>Returns:</strong> Due to the consumable nature of our products, we only accept returns for unopened, sealed products within 30 days of delivery. If you receive a damaged item, please contact support immediately.</p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>All content included on this site, such as text, graphics, logos, button icons, images, and software, is the property of Nutry Health or its content suppliers and protected by international copyright laws.</p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>Nutry Health shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products, even if Nutry Health has been advised of the possibility of such damages.</p>
          </Section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Questions regarding these Terms should be sent to us at{" "}
              <a
                href="mailto:nutryhealthretail@gmail.com"
                className="text-emerald-500 hover:underline hover:text-emerald-500 transition"
              >
                nutryhealthretail@gmail.com
              </a>
            </p>
          </div>

        </div>
      </div>


    </div>
  );
}

export default TermsPage;