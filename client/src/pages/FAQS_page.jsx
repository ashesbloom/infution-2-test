// client/src/pages/FAQS_page.jsx
import { useState } from "react";
import axios from "axios";

const sections = [
  {
    title: "Products & Safety",
    icon: "🛡️",
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
        a: "No. Our formulas are built using ingredients compliant with major sports organizations. Always check your federation’s rules.",
      },
      {
        q: "Where can I find the verification code?",
        a: "You’ll find the authenticity / verification code on the product label near the batch or expiry details.",
      },
    ],
  },
  {
    title: "Ordering & Shipping",
    icon: "📦",
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
    icon: "↩️",
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
  // ⬇⬇⬇ THIS LINE WAS MISSING
  const [activeTab, setActiveTab] = useState("faq"); // "faq" | "contact"

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
      // same endpoint that footer was using
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
      className="w-full bg-black px-3 sm:px-6 lg:px-10 py-10 sm:py-14 border-t border-white/5"
    >
      <div className="max-w-4xl mx-auto">
        {/* Top heading row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.3em] text-yellow-400 uppercase mb-1">
              Support Center
            </p>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Tabs: FAQ / CONTACT */}
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-full border tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold transition
              ${
                activeTab === "faq"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
              }`}
            >
              FAQ
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-full border tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold transition
              ${
                activeTab === "contact"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
              }`}
            >
              Contact
            </button>
          </div>
        </div>

        {/* ============== FAQ TAB ============== */}
        {activeTab === "faq" && (
          <div className="space-y-5 sm:space-y-7 animate-fadeIn">
            {sections.map((section, sIdx) => (
              <div
                key={section.title}
                className="rounded-2xl bg-gradient-to-b from-[#101010] to-[#050505] border border-yellow-500/30 shadow-[0_14px_40px_rgba(0,0,0,0.9)] px-3.5 sm:px-5 py-4 sm:py-5"
              >
                {/* Section header */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-yellow-400/10 border border-yellow-400/70 flex items-center justify-center text-base sm:text-lg text-yellow-300">
                    {section.icon}
                  </span>
                  <h3 className="text-[13px] sm:text-base font-extrabold tracking-[0.22em] sm:tracking-[0.3em] text-yellow-400 uppercase">
                    {section.title}
                  </h3>
                </div>

                {/* FAQ items */}
                <div className="space-y-2.5 sm:space-y-3">
                  {section.faqs.map((item, iIdx) => {
                    const isOpen =
                      openIndex.section === sIdx && openIndex.item === iIdx;

                    return (
                      <div
                        key={item.q}
                        className="rounded-xl border border-yellow-500/20 bg-black/60 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(sIdx, iIdx)}
                          className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-left"
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-[2px] text-xs sm:text-sm text-yellow-300">
                              ?
                            </span>
                            <span className="text-[11px] sm:text-sm font-medium text-gray-100">
                              {item.q}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-400">
                            {isOpen ? "▴" : "▾"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
                            <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============== CONTACT TAB ============== */}
        {activeTab === "contact" && (
          <div className="animate-fadeIn">
            <div className="rounded-2xl bg-gradient-to-b from-[#101010] to-[#050505] border border-yellow-500/30 shadow-[0_18px_50px_rgba(0,0,0,0.9)] px-4 sm:px-6 py-5 sm:py-6">
              <h3 className="text-lg sm:text-2xl font-extrabold italic uppercase text-yellow-400 mb-3 sm:mb-4">
                Contact Support
              </h3>
              <p className="text-[11px] sm:text-sm text-gray-300 mb-4 sm:mb-5 max-w-md">
                Drop your query here and our team will get back to you as soon
                as possible.
              </p>

              <form
                onSubmit={handleContactSubmit}
                className="space-y-3 sm:space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[9px] sm:text-xs font-bold uppercase text-gray-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contactData.name}
                      onChange={handleContactChange}
                      required
                      className="w-full bg-[#111111] text-white border border-white/15 rounded-md px-3 py-2 text-[11px] sm:text-sm outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-xs font-bold uppercase text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactData.email}
                      onChange={handleContactChange}
                      required
                      className="w-full bg-[#111111] text-white border border-white/15 rounded-md px-3 py-2 text-[11px] sm:text-sm outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] sm:text-xs font-bold uppercase text-gray-400 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={contactData.subject}
                    onChange={handleContactChange}
                    required
                    className="w-full bg-[#111111] text-white border border-white/15 rounded-md px-3 py-2 text-[11px] sm:text-sm outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-[9px] sm:text-xs font-bold uppercase text-gray-400 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    value={contactData.message}
                    onChange={handleContactChange}
                    required
                    className="w-full bg-[#111111] text-white border border-white/15 rounded-md px-3 py-2 text-[11px] sm:text-sm outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="mt-1 inline-flex items-center justify-center px-6 sm:px-8 py-2.5 rounded-full bg-yellow-400 text-black text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.25em] shadow-[0_0_22px_rgba(250,204,21,0.5)] hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {contactLoading ? "Sending..." : "Send Message"}
                </button>

                {contactStatus && (
                  <p className="text-[10px] sm:text-xs text-green-400 mt-2">
                    {contactStatus}
                  </p>
                )}
                {contactError && (
                  <p className="text-[10px] sm:text-xs text-red-400 mt-2">
                    {contactError}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
