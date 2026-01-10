import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();        // ✅ only addToCart, no openCart

  // Guard against null/undefined product
  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, 1);               // ✅ just updates cart state
    // ❌ no openCart()
    // ❌ no navigate('/cart')
  };

  const maxQty = Math.min(product.countInStock || 0, 10);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:border-[#06a34f] transition-all duration-300 group">
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
      </Link>

      <div className="p-6">
        {/* Category Tag */}
        <span className="text-[#06a34f] text-xs font-bold tracking-widest uppercase mb-2 block">
          {product.category || 'Supplement'}
        </span>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#06a34f] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Price</span>
            <span className="text-2xl font-bold text-gray-800">
              ${product.price}
            </span>
          </div>

          <div className="flex items-center">
            <select
              onChange={(e) => addToCart(product, Number(e.target.value))}
              className="bg-gray-800 text-gray-800 rounded-lg p-2 mr-2"
            >
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddToCart}
              className="bg-[#06a34f] p-3 rounded-lg text-gray-800 hover:bg-[#058a42] transition-colors shadow-lg shadow-[#06a34f]/20"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
