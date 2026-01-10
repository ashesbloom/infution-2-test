// client/src/components/CategoryTabs.jsx
import React from 'react';

const CATEGORIES = ['Creatine', 'Protein', 'Mass Gainer', 'Pre-workout'];

const CategoryTabs = ({ activeCategory, onCategoryChange, availableCategories = [] }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => {
        const isAvailable = availableCategories.includes(category);
        const isActive = activeCategory === category;

        if (!isAvailable) return null; // Hide tabs with no products

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
              transition-all duration-300 border
              ${isActive
                ? 'bg-[#06a34f] text-white border-[#06a34f] shadow-[0_0_15px_rgba(6,163,79,0.4)]'
                : 'bg-transparent text-gray-600 border-white/20 hover:border-[#06a34f]/50 hover:text-gray-800'
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export { CATEGORIES };
export default CategoryTabs;
