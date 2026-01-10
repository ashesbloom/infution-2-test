// client/src/components/BrandSection.jsx
import React from 'react';
import { ChevronRight, Flame, Star, Award, Dumbbell, Leaf, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCarousel from './ProductCarousel';

// Brand configurations with icons and styling
const BRAND_CONFIG = {
  'MuscleBlaze': {
    icon: Flame,
    tagline: 'Fuel Your Fire',
    gradient: 'from-orange-500/20 to-transparent',
  },
  'Avvatar': {
    icon: Star,
    tagline: 'Premium Nutrition',
    gradient: 'from-emerald-500/20 to-transparent',
  },
  'Optimum Nutrition': {
    icon: Award,
    tagline: 'True Strength',
    gradient: 'from-blue-500/20 to-transparent',
  },
  'ON': {
    icon: Award,
    tagline: 'True Strength',
    gradient: 'from-blue-500/20 to-transparent',
  },
  'My Fitness': {
    icon: Dumbbell,
    tagline: 'Your Fitness Partner',
    gradient: 'from-green-500/20 to-transparent',
  },
  'AS-IT-IS': {
    icon: Leaf,
    tagline: 'Pure & Simple',
    gradient: 'from-emerald-500/20 to-transparent',
  },
  "Doctor's Choice": {
    icon: Stethoscope,
    tagline: 'Science-Backed Nutrition',
    gradient: 'from-purple-500/20 to-transparent',
  },
};

const BrandSection = ({ brandName, products = [], onAddToCart }) => {
  const navigate = useNavigate();

  // Get brand config or default
  const config = BRAND_CONFIG[brandName] || {
    icon: Award,
    tagline: 'Quality Supplements',
    gradient: 'from-[#06a34f]/20 to-transparent',
  };
  const IconComponent = config.icon;

  // If no products, don't render
  if (!products || products.length === 0) return null;

  return (
    <section className="relative py-6">
      {/* Background gradient accent */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-30 pointer-events-none`}
      />

      <div className="relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#06a34f]/10 border border-[#06a34f]/30 flex items-center justify-center">
              <IconComponent className="text-[#06a34f]" size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-tight">
                {brandName}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">{config.tagline}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/products?brand=${encodeURIComponent(brandName)}`)}
            className="group flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm font-medium hover:bg-[#06a34f]/10 hover:border-[#06a34f]/30 hover:text-[#06a34f] transition-all self-start sm:self-auto"
          >
            View All
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Product Carousel - No category tabs, show all products */}
        <ProductCarousel products={products} onAddToCart={onAddToCart} />
      </div>
    </section>
  );
};

export default BrandSection;
