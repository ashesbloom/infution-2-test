// client/src/components/AccessoriesGrid.jsx
import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const AccessoriesGrid = ({ products = [], onAddToCart }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (!product?._id) return;
    addToCart(product, 1);
    if (onAddToCart) onAddToCart(product, 1);
  };

  // Filter out any null/undefined products
  const validProducts = products.filter(p => p && p._id);

  if (!validProducts.length) return null;

  // Determine grid layout based on number of products
  const getGridClasses = () => {
    const count = validProducts.length;
    if (count === 1) {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    } else if (count === 2) {
      return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4";
    } else if (count === 3) {
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4";
    } else if (count === 4) {
      return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4";
    } else if (count === 5) {
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4";
    } else {
      // 6 or more - use auto-fill for flexibility
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
    }
  };

  // Get card width class based on count for centering when fewer items
  const getCardClasses = () => {
    const count = validProducts.length;
    if (count <= 4) {
      return "max-w-[280px] w-full";
    }
    return "w-full";
  };

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          <Package className="text-[#06a34f]" size={20} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-tight">
            Accessories
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm">Gear up for your fitness journey</p>
        </div>
      </div>

      {/* Accessories Grid - Responsive based on item count */}
      <div className={`${getGridClasses()} ${validProducts.length <= 4 ? 'justify-items-center lg:justify-items-start' : ''}`}>
        {validProducts.map((product) => (
          <div
            key={product._id}
            className={`${getCardClasses()} bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#06a34f]/50 transition-all duration-300 group`}
          >
            {/* Image */}
            <div
              onClick={() => navigate(`/product/${product._id}`)}
              className="relative h-32 sm:h-36 bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
              />
              {/* Out of Stock Badge */}
              {product.countInStock === 0 && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-red-600 text-gray-800 text-[9px] font-bold uppercase rounded-md shadow-lg">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3 sm:p-4 space-y-2">
              <h3
                onClick={() => navigate(`/product/${product._id}`)}
                className="text-gray-800 font-semibold text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-[#06a34f] transition-colors min-h-[2.5rem]"
              >
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-[#06a34f] font-bold text-sm sm:text-base">
                  ₹{product.price?.toLocaleString()}
                </span>
                {product.weight && (
                  <span className="text-gray-400 text-[10px]">{product.weight}</span>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.countInStock === 0}
                className={`w-full py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                  product.countInStock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#06a34f] text-white hover:bg-[#058a42] hover:shadow-[0_0_15px_rgba(6,163,79,0.3)]'
                }`}
              >
                <ShoppingCart size={14} />
                {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AccessoriesGrid;
