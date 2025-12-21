// client/src/components/ExploreMoreToggle.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BrandSection from './BrandSection';

const ExploreMoreToggle = ({ brands = [], groupedProducts = {}, onAddToCart }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out brands with no products (now flat arrays)
  const brandsWithProducts = brands.filter((brand) => {
    const brandProducts = groupedProducts[brand] || [];
    return brandProducts.length > 0;
  });

  if (brandsWithProducts.length === 0) return null;

  return (
    <div className="py-8">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mx-auto flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-full text-white font-semibold hover:border-[#06a34f]/50 hover:from-[#06a34f]/5 hover:to-[#06a34f]/10 transition-all duration-300 group"
      >
        <span>
          {isExpanded ? 'Show Less' : `Explore ${brandsWithProducts.length} More Brands`}
        </span>
        {isExpanded ? (
          <ChevronUp size={18} className="text-white/60 group-hover:text-[#06a34f]" />
        ) : (
          <ChevronDown size={18} className="text-white/60 group-hover:text-[#06a34f]" />
        )}
      </button>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100 mt-8' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-6">
          {brandsWithProducts.map((brand) => (
            <div key={brand} className="pt-4 first:pt-0 border-t border-white/5 first:border-t-0">
              <BrandSection
                brandName={brand}
                products={groupedProducts[brand] || []}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreMoreToggle;
