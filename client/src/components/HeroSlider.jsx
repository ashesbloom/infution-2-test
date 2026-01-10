import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Brand-specific hero content
const BRAND_HERO_CONTENT = {
  'MuscleBlaze': {
    title: "BUILD MUSCLE",
    highlight: "WITHOUT COMPROMISE",
    description: "India's #1 sports nutrition brand. Fuel your gains with premium proteins.",
  },
  'Avvatar': {
    title: "PURE PROTEIN",
    highlight: "ABSOLUTE QUALITY",
    description: "100% vegetarian whey from grass-fed cows. Clean nutrition for peak performance.",
  },
  'Optimum Nutrition': {
    title: "GOLD STANDARD",
    highlight: "TRUSTED WORLDWIDE",
    description: "The world's best-selling whey protein. Proven quality since 1986.",
  },
  'default': {
    title: "PREMIUM SUPPLEMENTS",
    highlight: "FUEL YOUR POTENTIAL",
    description: "High-quality supplements engineered for strength, stamina, and rapid results.",
  }
};

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  // Fetch featured products for slider
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axios.get("/api/products");
        
        // Get one product from each featured brand for the slider
        const featuredBrands = ['MuscleBlaze', 'Avvatar', 'Optimum Nutrition'];
        const featuredProducts = [];

        featuredBrands.forEach((brand) => {
          const product = data.find(
            (p) => p && p._id && p.brand?.toLowerCase() === brand.toLowerCase() && p.countInStock > 0
          );
          if (product) {
            const content = BRAND_HERO_CONTENT[brand] || BRAND_HERO_CONTENT['default'];
            featuredProducts.push({
              id: product._id,
              image: product.image,
              brand: brand,
              productName: product.name,
              ...content,
            });
          }
        });

        // If no featured brand products, use first 3 products
        if (featuredProducts.length === 0 && data.length > 0) {
          const fallbackProducts = data.filter(p => p && p._id).slice(0, 3).map((p) => ({
            id: p._id,
            image: p.image,
            brand: p.brand,
            productName: p.name,
            ...BRAND_HERO_CONTENT['default'],
          }));
          setSlides(fallbackProducts);
        } else {
          setSlides(featuredProducts);
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
        // Fallback to static slides if API fails
        setSlides([
          { id: "1", image: "/images/whey_protien.png", ...BRAND_HERO_CONTENT['MuscleBlaze'] },
          { id: "2", image: "/images/product_image.png", ...BRAND_HERO_CONTENT['Avvatar'] },
          { id: "3", image: "/images/whey_protien_blue.png", ...BRAND_HERO_CONTENT['Optimum Nutrition'] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => setIndex((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

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

  return (
    <div className="w-full bg-white text-gray-800 overflow-hidden relative pb-10">
      {/* Loading state */}
      {loading && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#06a34f]"></div>
        </div>
      )}

      {/* Slider content */}
      {!loading && slides.length > 0 && (
        <>
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
                  {/* Brand badge */}
                  {s.brand && (
                    <span className="inline-block px-3 py-1 bg-[#06a34f]/10 border border-[#06a34f]/30 rounded-full text-[#06a34f] text-xs font-bold uppercase tracking-wider">
                      {s.brand}
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight">
                    {s.title}
                    <br />
                    <span className="text-[#06a34f] italic">{s.highlight}</span>
                  </h1>
                  <p className="text-xs sm:text-sm md:text-lg text-gray-500 border-l-2 border-[#06a34f] pl-4">{s.description}</p>
                  <Link to={`/product/${s.id}`}>
                    <button className="mt-3 bg-[#06a34f] text-white px-8 sm:px-10 py-3 rounded-md font-bold text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(6,163,79,0.7)] hover:bg-[#058a42] transition">
                      SHOP NOW
                    </button>
                  </Link>
                </div>

                <div className="flex-1 flex justify-center items-center">
                  <div className="relative group w-full max-w-[170px] sm:max-w-xs lg:max-w-md translate-y-10 sm:translate-y-12 lg:translate-y-14">
                    <div
                      className="absolute inset-0 rounded-full opacity-70 blur-3xl scale-100 transition-all duration-500 ease-out group-hover:opacity-90 group-hover:scale-125"
                      style={{ background: "radial-gradient(circle at center, rgba(6,163,79,0.55) 0%, rgba(6,163,79,0.15) 35%, transparent 70%)" }}
                    />
                    <img
                      src={s.image}
                      alt={s.productName || s.brand || "Product"}
                      className="relative z-10 w-full object-contain transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-2 drop-shadow-[0_0_25px_rgba(6,163,79,0.4)]"
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
                className={`h-3 w-3 sm:h-1 sm:w-10 rounded-full transition-all duration-300 ${i === index ? "bg-[#06a34f] shadow-[0_0_20px_rgba(6,163,79,0.9)] scale-125" : "bg-gray-500 hover:bg-[#06a34f]/70 hover:scale-110"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}