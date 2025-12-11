import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();        // ✅ only addToCart, no openCart

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);               // ✅ just updates cart state
    // ❌ no openCart()
    // ❌ no navigate('/cart')
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-yellow-400 transition-all duration-300 group">
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
      </Link>

      <div className="p-6">
        {/* Category Tag */}
        <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-2 block">
          {product.category || 'Supplement'}
        </span>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Price</span>
            <span className="text-2xl font-bold text-white">
              ${product.price}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-yellow-400 p-3 rounded-lg text-black hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
