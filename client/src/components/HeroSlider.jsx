// client/src/components/HeroSlider.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSlider() {
  const navigate = useNavigate();

  const slides = [
    { id: 1, image: "/images/whey_protien.png", title: "BUILD MUSCLE", highlight: "WITHOUT COMPROMISE", description: "High-quality whey blend engineered for strength, stamina, and rapid repair.", price: 2200 },
    { id: 2, image: "/images/product_image.png", title: "ADVANCED FORMULA", highlight: "PREMIUM PERFORMANCE", description: "Balanced carbs and protein engineered for clean bulking and sustained energy.", price: 1850 },
    { id: 3, image: "/images/whey_protien_blue.png", title: "INFUSED POWER", highlight: "ENGINEERED FOR RESULTS", description: "Pure isolate formula for fast digestion, lean muscle, and unmatched clarity.", price: 2500 },
  ];

  const [index, setIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => setIndex((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Touch / Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipe = 50;

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > minSwipe) {
      if (diff > 0) setIndex((p) => (p + 1) % slides.length);
      else setIndex((p) => (p - 1 + slides.length) % slides.length);
    }
  };

  // Purchase: force price to 2000 and navigate to /shipping with state
  const handlePurchase = (product) => {
    const checkoutInfo = {
      productId: product.id,
      productTitle: product.title,
      // FORCED PRICE as requested
      price: 2000,
      currency: "INR",
      qty: 1,
      image: product.image,
    };

    console.log("--- Navigating to Shipping (/shipping) with checkout state ---");
    console.log(checkoutInfo);

    // Navigate and pass state. ShippingScreen will receive this via location.state
    navigate("/shipping", { state: checkoutInfo });
  };

  return (
    <div className="w-full bg-black text-white overflow-hidden relative pb-10">
      <div
        className="flex transition-transform duration-[900ms] ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((s) => (
          <div key={s.id} className="min-w-full flex flex-row items-center gap-6 sm:gap-10 px-4 sm:px-8 lg:px-16 py-10">
            <div className="flex-1 min-w-0 max-w-xl space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight">
                {s.title}
                <br />
                <span className="text-[#f5b014] italic">{s.highlight}</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-lg text-gray-300 border-l-2 border-yellow-400 pl-4">{s.description}</p>

              <button
                onClick={() => handlePurchase(s)}
                className="mt-3 bg-yellow-400 text-black px-8 sm:px-10 py-3 rounded-md font-bold text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(245,176,20,0.7)] hover:bg-yellow-300 transition"
              >
                PURCHASE NOW (₹{s.price})
              </button>
            </div>

            <div className="flex-1 flex justify-center items-center">
              <div className="relative group w-full max-w-[170px] sm:max-w-xs lg:max-w-md translate-y-10 sm:translate-y-12 lg:translate-y-14">
                <div
                  className="absolute inset-0 rounded-full opacity-70 blur-3xl scale-100 transition-all duration-500 ease-out group-hover:opacity-90 group-hover:scale-125"
                  style={{ background: "radial-gradient(circle at center, rgba(245,176,20,0.55) 0%, rgba(245,176,20,0.15) 35%, transparent 70%)" }}
                />
                <img
                  src={s.image}
                  alt="Product"
                  className="relative z-10 w-full object-contain transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-2 drop-shadow-[0_0_25px_rgba(245,176,20,0.4)]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4 gap-4">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-300 ${i === index ? "bg-yellow-400 shadow-[0_0_20px_rgba(245,176,20,0.9)] scale-125" : "bg-gray-500 hover:bg-yellow-300 hover:scale-110"}`}
          />
        ))}
      </div>
    </div>
  );
}
