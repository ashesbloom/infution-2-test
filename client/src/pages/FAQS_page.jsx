// client/src/pages/FAQS_page.jsx
import { useState } from "react";
import axios from "axios";
import { 
  Shield, 
  Package, 
  RotateCcw, 
  ChevronDown, 
  Send, 
  MessageCircle, 
  HelpCircle,
  Sparkles,
  Mail,
  User,
  FileText,
  MessageSquare
} from "lucide-react";

const sections = [
  {
    title: "Products & Safety",
    icon: Shield,
    color: "from-emerald-500/20 to-emerald-500/5",
    borderColor: "border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    faqs: [
      {
        q: "Are your supplements third-party tested?",
        a: "Yes. Every batch is tested by independent labs for purity, heavy metals, and label accuracy before release.",
      },
      {
        q: "What is a 'Clinical Dose'?",
        a: "A clinical dose is an ingredient amount that has been shown in research studies to provide real, measurable benefits.",
      },
      {
        q: "Do your products contain banned substances?",
        a: "No. Our formulas are built using ingredients compliant with major sports organizations. Always check your federation's rules.",
      },
      {
        q: "Where can I find the verification code?",
        a: "You'll find the authenticity / verification code Under the product Cap.",
      },
    ],
  },
  {
    title: "Ordering & Shipping",
    icon: Package,
    color: "from-blue-500/20 to-blue-500/5",
    borderColor: "border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    faqs: [
      {
        q: "How long does shipping take?",
        a: "Most orders ship within 24–48 hours and arrive in 3–7 business days depending on your location.",
      },
      {
        q: "Do you offer cash on delivery?",
        a: "Yes, COD is available in selected pin codes during checkout.",
      },
      {
        q: "Can I change my shipping address?",
        a: "You can update the address before the order is shipped by contacting support with your order ID.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    color: "from-purple-500/20 to-purple-500/5",
    borderColor: "border-purple-500/30",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    faqs: [
      {
        q: "What is your return policy?",
        a: "Unopened products can be returned within 7 days of delivery. Safety seals must be intact.",
      },
      {
        q: "How do I request a refund?",
        a: "Reach out to our support team with your order ID and reason. Approved returns are refunded to the original payment method.",
      },
    ],
  },
];

export default function FAQS_page() {
  const [activeTab, setActiveTab] = useState("faq");
  const [openIndex, setOpenIndex] = useState({ section: 0, item: 0 });

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const toggleItem = (sIdx, iIdx) => {
    setOpenIndex((prev) =>
      prev.section === sIdx && prev.item === iIdx
        ? { section: -1, item: -1 }
        : { section: sIdx, item: iIdx }
    );
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("");
    setContactError("");
    setContactLoading(true);

    try {
      await axios.post("/api/connect", contactData);
      setContactStatus("We will connect with you shortly.");
      setContactData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Connect error:", err?.response?.data || err.message);
      setContactError("Something went wrong. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <section
      id="faqs-section"
      className="relative w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 px-4 md:px-8 lg:px-12 py-16 sm:py-20 overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#06a34f]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#06a34f]/3 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#06a34f]/5 to-transparent rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#06a34f]/10 border border-[#06a34f]/30 rounded-full mb-6">
            <Sparkles size={14} className="text-[#06a34f]" />
            <span className="text-[11px] tracking-[0.3em] text-[#06a34f] uppercase font-semibold">
              Support Center
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            How Can We <span className="text-[#06a34f]">Help</span> You?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
            Find answers to common questions or reach out to our support team
          </p>

          {/* Tab Switcher */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`group relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "faq"
                  ? "bg-[#06a34f] text-white shadow-[0_0_30px_rgba(6,163,79,0.4)]"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-[#06a34f]/50 hover:text-[#06a34f]"
              }`}
            >
              <HelpCircle size={18} />
              <span>FAQs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`group relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "contact"
                  ? "bg-[#06a34f] text-white shadow-[0_0_30px_rgba(6,163,79,0.4)]"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-[#06a34f]/50 hover:text-[#06a34f]"
              }`}
            >
              <MessageCircle size={18} />
              <span>Contact Us</span>
            </button>
          </div>
        </div>

        {/* ============== FAQ TAB ============== */}
        {activeTab === "faq" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {sections.map((section, sIdx) => {
              const IconComponent = section.icon;
              return (
                <div
                  key={section.title}
                  className={`relative rounded-3xl bg-gradient-to-b ${section.color} border ${section.borderColor} backdrop-blur-sm overflow-hidden group`}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative p-6">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${section.iconBg} border border-gray-200 flex items-center justify-center`}>
                        <IconComponent size={22} className={section.iconColor} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {section.title}
                      </h3>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-3">
                      {section.faqs.map((item, iIdx) => {
                        const isOpen = openIndex.section === sIdx && openIndex.item === iIdx;

                        return (
                          <div
                            key={item.q}
                            className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                              isOpen 
                                ? "bg-gray-50/80 border-[#06a34f]/40 shadow-[0_0_20px_rgba(6,163,79,0.1)]" 
                                : "bg-gray-100 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleItem(sIdx, iIdx)}
                              className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left"
                            >
                              <span className={`text-sm font-medium transition-colors ${
                                isOpen ? "text-[#06a34f]" : "text-gray-700"
                              }`}>
                                {item.q}
                              </span>
                              <ChevronDown 
                                size={18} 
                                className={`flex-shrink-0 mt-0.5 transition-all duration-300 ${
                                  isOpen 
                                    ? "rotate-180 text-[#06a34f]" 
                                    : "text-gray-400"
                                }`}
                              />
                            </button>

                            <div className={`grid transition-all duration-300 ease-in-out ${
                              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}>
                              <div className="overflow-hidden">
                                <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">
                                  {item.a}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============== CONTACT TAB ============== */}
        {activeTab === "contact" && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="relative rounded-3xl bg-white border border-gray-200 overflow-hidden">
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#06a34f] to-transparent" />
              
              <div className="p-8 sm:p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#06a34f]/10 border border-[#06a34f]/30 mb-4">
                    <Send size={28} className="text-[#06a34f]" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Get in Touch
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Our team typically responds within 24 hours
                  </p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className="block text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wider">
                        Your Name
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={contactData.name}
                          onChange={handleContactChange}
                          required
                          placeholder="John Doe"
                          className="w-full bg-gray-100 text-gray-800 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#06a34f]/50 focus:shadow-[0_0_20px_rgba(6,163,79,0.1)] transition-all placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wider">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={contactData.email}
                          onChange={handleContactChange}
                          required
                          placeholder="john@example.com"
                          className="w-full bg-gray-100 text-gray-800 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#06a34f]/50 focus:shadow-[0_0_20px_rgba(6,163,79,0.1)] transition-all placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wider">
                      Subject
                    </label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="subject"
                        value={contactData.subject}
                        onChange={handleContactChange}
                        required
                        placeholder="How can we help?"
                        className="w-full bg-gray-100 text-gray-800 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#06a34f]/50 focus:shadow-[0_0_20px_rgba(6,163,79,0.1)] transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wider">
                      Message
                    </label>
                    <div className="relative">
                      <MessageSquare size={16} className="absolute left-4 top-4 text-gray-400" />
                      <textarea
                        name="message"
                        rows={4}
                        value={contactData.message}
                        onChange={handleContactChange}
                        required
                        placeholder="Tell us more about your inquiry..."
                        className="w-full bg-gray-100 text-gray-800 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#06a34f]/50 focus:shadow-[0_0_20px_rgba(6,163,79,0.1)] transition-all resize-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#06a34f] text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,163,79,0.3)] hover:shadow-[0_0_40px_rgba(6,163,79,0.5)] hover:bg-[#058a42] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {contactLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>

                  {contactStatus && (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <span className="text-green-400 text-sm">✓ {contactStatus}</span>
                    </div>
                  )}
                  {contactError && (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <span className="text-red-400 text-sm">✕ {contactError}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Stats/Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "24/7", label: "Support Available" },
            { value: "<2hrs", label: "Avg Response Time" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "10K+", label: "Queries Resolved" },
          ].map((stat, i) => (
            <div 
              key={i}
              className="text-center p-4 rounded-2xl bg-gray-100 border border-gray-200 hover:border-[#06a34f]/20 transition-colors"
            >
              <p className="text-2xl sm:text-3xl font-black text-[#06a34f]">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
