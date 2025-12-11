import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ ADD THIS

export default function HeroSlider() {
  const navigate = useNavigate(); // ⭐ ADD THIS

  const slides = [
    {
      id: 1,
      image: "/images/product_image.png",
      title: "BUILD MUSCLE",
      highlight: "WITHOUT COMPROMISE",
      description:
        "Experience the purest whey fusion for premium performance. Designed for athletes who demand the absolute best in recovery.",
    },
    {
      id: 2,
      image: "/images/product_image.png",
      title: "ADVANCED FORMULA",
      highlight: "PREMIUM PERFORMANCE",
      description:
        "High-quality whey blend crafted for strength, endurance, and peak muscle recovery.",
    },
    {
      id: 3,
      image: "/images/product_image.png",
      title: "INFUSED POWER",
      highlight: "ENGINEERED FOR RESULTS",
      description:
        "Fast-absorbing formula designed to fuel your workouts and maximize growth.",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="w-full bg-black text-white overflow-hidden relative pb-10">
      {/* SLIDER WRAPPER */}
      <div
        className="flex transition-transform duration-[900ms] ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className="
              min-w-full
              flex flex-row
              items-center
              gap-6 sm:gap-10
              px-4 sm:px-8 lg:px-16
              py-10
            "
          >
            {/* LEFT TEXT */}
            <div className="flex-1 min-w-0 max-w-xl space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight">
                {s.title}
                <br />
                <span className="text-[#f5b014] italic">{s.highlight}</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-lg text-gray-300 border-l-2 border-yellow-400 pl-4">
                {s.description}
              </p>

              {/* ⭐ UPDATED BUTTON → GO TO SHIPPING */}
              <button
                onClick={() => navigate("/shipping")}
                className="mt-3 bg-yellow-400 text-black px-8 sm:px-10 py-3 rounded-md font-bold 
                text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(245,176,20,0.7)]
                hover:bg-yellow-300 transition"
              >
                PURCHASE NOW
              </button>
            </div>

            {/* RIGHT IMAGE */}
            <div className="flex-1 flex justify-center items-center">
              <div className="relative w-full max-w-[170px] sm:max-w-xs lg:max-w-md translate-y-10 sm:translate-y-12 lg:translate-y-14">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,#f5b014_0%,#000_70%)] opacity-80 blur-[6px]" />

                <img
                  src={s.image}
                  alt="Product"
                  className="relative z-10 w-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="flex justify-center mt-4 gap-4">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`
              h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-300
              ${
                i === index
                  ? "bg-yellow-400 shadow-[0_0_20px_rgba(245,176,20,0.9)] scale-125"
                  : "bg-gray-500 hover:bg-yellow-300 hover:scale-110"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
