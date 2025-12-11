// client/src/pages/ProductDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const [mainImage, setMainImage] = useState("");
  const [images, setImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const [selectedVariant, setSelectedVariant] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const imageTopRef = useRef(null);
  const fallbackImage = "https://via.placeholder.com/400";

  // fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);

        const imgs =
          (Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : data.image
            ? [data.image]
            : []) || [];
        setImages(imgs);
        setMainImage(imgs[0] || data.image || fallbackImage);

        const variants =
          (Array.isArray(data.variants) && data.variants.length > 0
            ? data.variants
            : []) || [];

        if (variants.length > 0) setSelectedVariant(String(variants[0]));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ensure top-of-page is visible immediately on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        document.activeElement?.blur();
      } catch (e) {}
      window.scrollTo({ top: 0, behavior: "auto" });
      imageTopRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    if (!product || isAdmin || product.countInStock === 0) return;
    addToCart(product, qty);
    navigate("/shipping");
  };

  const handlePrevImage = () => {
    if (!images.length) return;
    const nextIndex = (imageIndex - 1 + images.length) % images.length;
    setImageIndex(nextIndex);
    setMainImage(images[nextIndex] || fallbackImage);
  };

  const handleNextImage = () => {
    if (!images.length) return;
    const nextIndex = (imageIndex + 1) % images.length;
    setImageIndex(nextIndex);
    setMainImage(images[nextIndex] || fallbackImage);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Product not found
      </div>
    );

  const [firstWord, ...restWords] = (product.name || "").split(" ");
  const restName = restWords.join(" ");

  const variants =
    (Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : []) || [];

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 md:px-8 lg:px-12 pt-2 pb-8 sm:pt-3 sm:pb-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-400 mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-[0.25em]"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        <div className="rounded-[32px] border-yellow-300 text-yellow-300 shadow-[0_0_26px_rgba(245,176,20,0.6)] bg-gradient-to-br from-[#111111] via-[#050505] to-[#111111] p-5 sm:p-7 lg:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.9)] border border-white/10">
          <div className="grid  grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 sm:gap-10 lg:gap-14 items-start lg:items-center">
            
            <div ref={imageTopRef}>
              <div className="relative  rounded-[26px] bg-gradient-to-b from-[#171717] to-black p-5 sm:p-7 lg:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.95)] border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f5b01440,transparent_60%)] blur-2xl" />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                <img
                  src={mainImage || fallbackImage}
                  alt={product.name}
                  className="relative max-h-80 sm:max-h-96 w-full object-contain transition-transform duration-300 ease-out hover:scale-105 drop-shadow-[0_0_30px_rgba(0,0,0,0.9)]"
                />
              </div>

              {images.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMainImage(img);
                        setImageIndex(idx);
                      }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border ${
                        imageIndex === idx
                          ? "border-[#f5b014] shadow-[0_0_18px_rgba(245,176,20,0.8)]"
                          : "border-white/15"
                      } overflow-hidden bg-[#111] flex items-center justify-center hover:border-[#f5b014] transition`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {images.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageIndex(idx);
                        setMainImage(images[idx] || fallbackImage);
                      }}
                      className={`h-2.5 w-2.5 rounded-full ${
                        imageIndex === idx
                          ? "bg-yellow-400 shadow-[0_0_12px_rgba(245,176,20,0.9)]"
                          : "bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-6 mt-6 lg:mt-0">
              <div className="space-y-2 text-center lg:text-left">
                <p className="text-[11px] tracking-[0.3em] text-yellow-400 uppercase">Premium Series</p>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                  <span className="block">{firstWord}</span>
                  {restName && <span className="block text-yellow-400">{restName}</span>}
                </h1>
              </div>

              <div className="text-left">
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out`}
                  style={{
                    maxHeight: isDescriptionExpanded ? "800px" : "70px"
                  }}
                >
                  <p className="text-sm md:text-base text-zinc-300 leading-relaxed border-l-2 border-[#f5b014] pl-4">
                    {product.description}
                  </p>
                </div>

                {product.description.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                    className="mt-1 ml-4 text-[11px] uppercase tracking-[0.25em] text-yellow-400 hover:text-yellow-300"
                  >
                    {isDescriptionExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>

              {variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">Variant</label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="bg-[#111111] text-white text-sm rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f5b014] max-w-xs"
                  >
                    {variants.map((v, idx) => (
                      <option key={idx} value={v}>
                        {String(v)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-white/10">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-extrabold text-[#f5b014]">₹{product.price}</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`font-bold text-xs px-3 py-1 rounded-full border ${
                      product.countInStock > 0
                        ? "text-emerald-400 border-emerald-500/60 bg-emerald-900/40"
                        : "text-red-400 border-red-500/60 bg-red-900/40"
                    }`}
                  >
                    {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>

                  <span className="text-[11px] text-zinc-500 uppercase tracking-[0.25em]">#{product._id?.slice(-6)}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {!isAdmin && product.countInStock > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">Quantity</label>

                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="bg-[#111111] text-white text-sm rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f5b014]"
                    >
                      {[...Array(product.countInStock).keys()].slice(0, 10).map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>

                    {product.weight && (
                      <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">
                        Weight: <span className="text-[11px] tracking-[0.3em] text-yellow-400 uppercase">{product.weight}</span>
                      </span>
                    )}
                  </div>
                )}

                {!isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.countInStock === 0}
                      className={`w-full sm:w-auto px-8 py-3 font-black uppercase tracking-[0.25em] rounded-full flex items-center justify-center gap-2 text-[11px] transition
                        ${
                          product.countInStock === 0
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                            : "bg-zinc-900 text-yellow-400 border border-yellow-500 hover:bg-zinc-800"
                        }`}
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={product.countInStock === 0}
                      className={`w-full sm:w-auto px-8 py-3 font-extrabold uppercase tracking-[0.25em] rounded-full flex items-center justify-center gap-2 text-[11px] transition
                        ${
                          product.countInStock === 0
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                            : "bg-gradient-to-r from-[#f5b014] to-[#ffcc3d] text-black hover:brightness-80 hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] border border-yellow-400"
                        }`}
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* END RIGHT */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;