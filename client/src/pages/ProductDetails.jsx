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
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);

  const [mainImage, setMainImage] = useState("");
  const [images, setImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const [selectedVariant, setSelectedVariant] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);



  const imageTopRef = useRef(null);
  const fallbackImage = "https://via.placeholder.com/400";

  // Abort controller for cleanup
  const abortControllerRef = useRef(null);

  // swipe/pointer refs
  const pointerStartX = useRef(0);
  const pointerCurrentX = useRef(0);
  const isDragging = useRef(false);
  const dragTranslate = useRef(0);
  const swipeThreshold = 40;

  // OPTIMIZED: fetch product with timeout and proper error handling
  useEffect(() => {
    const fetchProduct = async () => {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        setLoading(true);
        setError(null);

        // Add timeout to prevent hanging requests
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, 10000); // 10 second timeout

        const res = await fetch(
          `/api/products/${id}`,
          { signal }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.status}`);
        }

        const data = await res.json();
        setProduct(data);

        // Normalize images
        const imgsSrc = Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : data.image
            ? [data.image]
            : [];

        const imgs = imgsSrc.map(src => String(src || ""));
        setImages(imgs);
        setMainImage(imgs[0] || data.image || fallbackImage);

        const variants = Array.isArray(data.variants) && data.variants.length > 0
          ? data.variants
          : [];

        if (variants.length > 0) setSelectedVariant(String(variants[0]));
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Error fetching product:', err);
          setError(err.message);
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  // Scroll to top
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        document.activeElement?.blur();
      } catch (e) { }
      window.scrollTo({ top: 0, behavior: "auto" });
      imageTopRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  // OPTIMIZED: handleAddToCart - immediate feedback
  const handleAddToCart = () => {
    if (!product) return;
    try {
      addToCart(product, qty);

      // show popup
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 2000);

    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };
  // cart popup handler
  const handleHeroAddToCart = (product, qty) => {
    addToCart(product, qty);

    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 2000);
  };


  // OPTIMIZED: handleBuyNow - faster navigation
  const handleBuyNow = () => {
    if (!product || isAdmin || product.countInStock === 0) return;

    try {
      addToCart(product, qty);
      // Use replace instead of push for faster navigation
      navigate("/shipping", { replace: false });
    } catch (err) {
      console.error('Error during buy now:', err);
    }
  };

  const handlePrevImage = () => {
    if (!images.length) return;
    const nextIndex = (imageIndex - 1 + images.length) % images.length;
    setImageIndex(nextIndex);
    setMainImage(images[nextIndex] || fallbackImage);
    resetDragTransform();
  };

  const handleNextImage = () => {
    if (!images.length) return;
    const nextIndex = (imageIndex + 1) % images.length;
    setImageIndex(nextIndex);
    setMainImage(images[nextIndex] || fallbackImage);
    resetDragTransform();
  };

  const setDragTransform = (tx) => {
    dragTranslate.current = tx;
    const imgEl = document.getElementById("pd-main-image");
    if (imgEl) {
      imgEl.style.transform = `translateX(${tx}px)`;
      imgEl.style.transition = "none";
    }
  };

  const resetDragTransform = () => {
    const imgEl = document.getElementById("pd-main-image");
    if (imgEl) {
      imgEl.style.transition = "transform 200ms ease-out";
      imgEl.style.transform = "translateX(0px)";
      setTimeout(() => {
        if (imgEl) imgEl.style.transition = "";
      }, 220);
    }
    dragTranslate.current = 0;
  };

  const onPointerDown = (e) => {
    isDragging.current = true;
    pointerStartX.current = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    pointerCurrentX.current = pointerStartX.current;
    if (e.pointerId && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) { }
    }
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const x = e.clientX ?? (e.touches && e.touches[0].clientX) ?? pointerCurrentX.current;
    pointerCurrentX.current = x;
    const delta = x - pointerStartX.current;
    setDragTransform(delta);
  };

  const onPointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const endX = pointerCurrentX.current;
    const delta = endX - pointerStartX.current;

    if (delta > swipeThreshold) {
      handlePrevImage();
    } else if (delta < -swipeThreshold) {
      handleNextImage();
    } else {
      resetDragTransform();
    }

    if (e.pointerId && e.target.releasePointerCapture) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) { }
    }
  };

  const onTouchStart = (e) => {
    pointerStartX.current = e.touches[0].clientX;
    pointerCurrentX.current = pointerStartX.current;
    isDragging.current = true;
  };

  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    pointerCurrentX.current = e.touches[0].clientX;
    const delta = pointerCurrentX.current - pointerStartX.current;
    setDragTransform(delta);
  };

  const onTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = pointerCurrentX.current - pointerStartX.current;

    if (delta > swipeThreshold) handlePrevImage();
    else if (delta < -swipeThreshold) handleNextImage();
    else resetDragTransform();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center text-xl gap-4">
        <p>Error: {error}</p>
        <Link
          to="/"
          className="text-emerald-500 hover:text-emerald-600 text-base underline"
        >
          Go back to products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center text-xl">
        Product not found
      </div>
    );
  }

  const [firstWord, ...restWords] = (product.name || "").split(" ");
  const restName = restWords.join(" ");

  const variants =
    (Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : []) || [];

  const maxQty = Math.min(product?.countInStock || 0, 10);

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 px-4 md:px-8 lg:px-12 pt-2 pb-8 sm:pt-3 sm:pb-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-500 mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-[0.25em]"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        <div className="rounded-[32px] border-emerald-400 text-emerald-600 shadow-[0_0_26px_rgba(6,163,79,0.6)] bg-gray-50 p-5 sm:p-7 lg:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.9)] border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 sm:gap-10 lg:gap-14 items-start lg:items-center">

            <div ref={imageTopRef}>
              <div
                className="relative rounded-[26px] bg-gradient-to-b from-gray-50 to-gray-100 p-5 sm:p-7 lg:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.95)] border border-gray-200 flex items-center justify-center overflow-hidden touch-pan-y"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#06a34f40,transparent_60%)] blur-2xl" />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-50/80 border border-white/20 flex items-center justify-center hover:bg-white/95 transition z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-50/80 border border-white/20 flex items-center justify-center hover:bg-white/95 transition z-10"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                <img
                  id="pd-main-image"
                  src={mainImage || fallbackImage}
                  alt={product.name}
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImage;
                  }}
                  className="relative max-h-80 sm:max-h-96 w-full object-contain transition-transform duration-300 ease-out hover:scale-105 drop-shadow-lg"
                  draggable={false}
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
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border ${imageIndex === idx
                          ? "border-[#06a34f] shadow-[0_0_18px_rgba(6,163,79,0.8)]"
                          : "border-gray-300"
                        } overflow-hidden bg-gray-100 flex items-center justify-center hover:border-[#06a34f] transition`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${idx}`}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackImage;
                        }}
                        className="w-full h-full object-cover"
                        draggable={false}
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
                      className={`h-2.5 w-2.5 rounded-full ${imageIndex === idx
                          ? "bg-emerald-500 shadow-[0_0_12px_rgba(6,163,79,0.9)]"
                          : "bg-gray-300"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-6 mt-6 lg:mt-0">
              <div className="space-y-2 text-center lg:text-left">
                <p className="text-[11px] tracking-[0.3em] text-emerald-500 uppercase">Premium Series</p>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                  <span className="block">{firstWord}</span>
                  {restName && <span className="block text-emerald-500">{restName}</span>}
                </h1>
              </div>

              <div className="text-left">
                <div
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{
                    maxHeight: isDescriptionExpanded ? "800px" : "70px"
                  }}
                >
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed border-l-2 border-[#06a34f] pl-4">
                    {product.description}
                  </p>
                </div>

                {product.description.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                    className="mt-1 ml-4 text-[11px] uppercase tracking-[0.25em] text-emerald-500 hover:text-emerald-600"
                  >
                    {isDescriptionExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>

              {variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">Variant</label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="bg-gray-50 text-gray-800 text-sm rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-[#06a34f] max-w-xs"
                  >
                    {variants.map((v, idx) => (
                      <option key={idx} value={v}>
                        {String(v)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-extrabold text-[#06a34f]">₹{product.price}</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`font-bold text-xs px-3 py-1 rounded-full border ${product.countInStock > 0
                        ? "text-emerald-600 border-emerald-500/60 bg-emerald-50"
                        : "text-red-400 border-red-500/60 bg-red-50"
                      }`}
                  >
                    {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>

                  <span className="text-[11px] text-gray-500 uppercase tracking-[0.25em]">#{product._id?.slice(-6)}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {!isAdmin && product.countInStock > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-gray-500">Quantity</label>

                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="bg-gray-50 text-gray-800 text-sm rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-[#06a34f]"
                    >
                      {Array.from({ length: maxQty }, (_, i) => i + 1).map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>

                    {product.weight && (
                      <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
                        Weight: <span className="text-[11px] tracking-[0.3em] text-emerald-500 uppercase">{product.weight}</span>
                      </span>
                    )}
                  </div>
                )}

                {!isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleHeroAddToCart(product, qty)}
                      disabled={product.countInStock === 0}
                      className="w-full sm:w-auto px-8 sm:px-10 py-3 rounded-2xl border border-emerald-500 bg-gray-100 text-emerald-600 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(6,163,79,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>



                    <button
                      onClick={handleBuyNow}
                      disabled={product.countInStock === 0}
                      className={`w-full sm:w-auto px-8 py-3 font-extrabold uppercase tracking-[0.25em] rounded-full flex items-center justify-center gap-2 text-[11px] transition
                        ${product.countInStock === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                          : "bg-gradient-to-r from-[#06a34f] to-[#058a42] text-black hover:brightness-80 hover:shadow-[0_0_40px_rgba(6,163,79,0.5)] border border-emerald-500"
                        }`}
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCartPopup && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* soft glow */}
            <div className="absolute inset-0 rounded-full blur-xl bg-emerald-500/50" />

            {/* capsule */}
            <div className="relative px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-black text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] shadow-[0_0_10px_rgba(6,163,79,0.7)]">
              {product?.name || "Item"} added to cart
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;