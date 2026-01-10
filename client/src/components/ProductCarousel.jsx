// client/src/components/ProductCarousel.jsx
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCarousel = ({ products = [], onAddToCart }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getQty = (productId) => quantities[productId] || 1;

  const updateQty = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = (product) => {
    if (!product?._id) return;
    const qty = getQty(product._id);
    addToCart(product, qty);
    if (onAddToCart) onAddToCart(product, qty);
  };

  // Filter out any null/undefined products
  const validProducts = products.filter(p => p && p._id);

  if (!validProducts.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <p>No products available in this category</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 border border-white/20 rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#06a34f] hover:text-gray-800 hover:border-[#06a34f]"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Product Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-4"
      >
        {validProducts.map((product) => (
          <div
            key={product._id}
            className="flex-shrink-0 w-[220px] bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#06a34f]/50 transition-all duration-300 group/card"
          >
            {/* Image */}
            <div
              onClick={() => navigate(`/product/${product._id}`)}
              className="relative h-40 bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover/card:scale-110"
              />
              {/* Category Badge - High contrast for visibility */}
              {product.category && (
                <span className="absolute top-2 left-2 px-2.5 py-1 bg-white/95 text-[#06a34f] text-[10px] font-bold uppercase rounded-md border border-[#06a34f]/50 shadow-lg backdrop-blur-sm">
                  {product.category}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <h3
                onClick={() => navigate(`/product/${product._id}`)}
                className="text-gray-800 font-bold text-sm line-clamp-2 cursor-pointer hover:text-[#06a34f] transition-colors"
              >
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-[#06a34f] font-black text-lg">
                  ₹{product.price?.toLocaleString()}
                </span>
                <span className="text-gray-400 text-xs">{product.weight}</span>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQty(product._id, -1)}
                    className="p-1.5 hover:bg-gray-100 transition-colors text-gray-500"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-gray-800 text-sm font-medium">
                    {getQty(product._id)}
                  </span>
                  <button
                    onClick={() => updateQty(product._id, 1)}
                    className="p-1.5 hover:bg-gray-100 transition-colors text-gray-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.countInStock === 0}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                    product.countInStock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#06a34f] text-white hover:bg-[#058a42] hover:shadow-[0_0_20px_rgba(6,163,79,0.3)]'
                  }`}
                >
                  <ShoppingCart size={14} />
                  {product.countInStock === 0 ? 'Out' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 border border-white/20 rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#06a34f] hover:text-gray-800 hover:border-[#06a34f]"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default ProductCarousel;
