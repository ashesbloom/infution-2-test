import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  // primary + extra images
  const [image, setImage] = useState('');
  const [image2, setImage2] = useState('');
  const [image3, setImage3] = useState('');

  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  // ✅ NEW: weight state
  const [weight, setWeight] = useState('1 kg');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch existing product data to fill the form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        const { data } = await axios.get(`/api/products/${id}`, config);

        setName(data.name);
        setPrice(data.price);
        setBrand(data.brand);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setDescription(data.description);

        // ✅ NEW: load existing weight (fallback to '1 kg')
        setWeight(data.weight || '1 kg');

        // support both single image and images[]
        if (Array.isArray(data.images) && data.images.length > 0) {
          setImage(data.images[0] || '');
          setImage2(data.images[1] || '');
          setImage3(data.images[2] || '');
        } else {
          setImage(data.image || '');
        }

        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data.message : err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user]);

  // upload handler (reusable for image, image2, image3)
  const uploadFileHandler = async (e, setImageField) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);

      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });

      // backend returns the URL directly as a string (not an object)
      const uploadedUrl = typeof data === 'string' ? data : (data.url || data.path || data.secure_url || '');
      if (uploadedUrl) {
        setImageField(uploadedUrl);
      } else {
        console.error('Upload response missing URL:', data);
        alert('Upload succeeded but no URL was returned');
      }

    } catch (err) {
      console.error('Image upload failed:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const payload = {
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description,
        weight, // ✅ NEW: include weight in update payload
      };

      const imagesArr = [image, image2, image3].filter(Boolean);
      if (imagesArr.length) {
        payload.images = imagesArr;
      }

      await axios.put(`/api/products/${id}`, payload, config);

      navigate('/admin/productlist');
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen w-full bg-white text-gray-500 flex items-center justify-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen w-full bg-white text-red-500 flex items-center justify-center px-4 text-center">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          to="/admin/productlist"
          className="text-sm sm:text-base text-gray-500 hover:text-emerald-500 transition-colors inline-flex items-center gap-1 mb-4"
        >
          <span className="text-lg">&larr;</span>
          Go Back
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-emerald-500 tracking-tight">
          Edit Product
        </h1>

        <form
          onSubmit={submitHandler}
          className="bg-gray-50 border border-gray-200 rounded-2xl shadow-2xl px-5 sm:px-8 py-6 sm:py-8 space-y-5"
        >
          {/* NAME */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />
          </div>

          {/* IMAGE 1 */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Image URL (Primary)
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https:// or /uploads/filename.jpg"
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadFileHandler(e, setImage)}
                className="text-xs sm:text-sm text-gray-600"
              />
              {uploading && (
                <span className="text-xs text-gray-500">Uploading...</span>
              )}
            </div>

            {image && (
              <div className="mt-3">
                <p className="text-[11px] text-gray-500 mb-1">Preview:</p>
                <img
                  src={image}
                  alt="Product 1"
                  className="h-24 rounded-md border border-gray-200 object-contain bg-white"
                />
              </div>
            )}
          </div>

          {/* IMAGE 2 */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Image URL 2 (Optional)
            </label>
            <input
              type="text"
              value={image2}
              onChange={(e) => setImage2(e.target.value)}
              placeholder="Additional image URL"
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadFileHandler(e, setImage2)}
                className="text-xs sm:text-sm text-gray-600"
              />
              {uploading && (
                <span className="text-xs text-gray-500">Uploading...</span>
              )}
            </div>

            {image2 && (
              <div className="mt-3">
                <p className="text-[11px] text-gray-500 mb-1">Preview 2:</p>
                <img
                  src={image2}
                  alt="Product 2"
                  className="h-24 rounded-md border border-gray-200 object-contain bg-white"
                />
              </div>
            )}
          </div>

          {/* IMAGE 3 */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Image URL 3 (Optional)
            </label>
            <input
              type="text"
              value={image3}
              onChange={(e) => setImage3(e.target.value)}
              placeholder="Additional image URL"
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadFileHandler(e, setImage3)}
                className="text-xs sm:text-sm text-gray-600"
              />
              {uploading && (
                <span className="text-xs text-gray-500">Uploading...</span>
              )}
            </div>

            {image3 && (
              <div className="mt-3">
                <p className="text-[11px] text-gray-500 mb-1">Preview 3:</p>
                <img
                  src={image3}
                  alt="Product 3"
                  className="h-24 rounded-md border border-gray-200 object-contain bg-white"
                />
              </div>
            )}
          </div>

          {/* BRAND */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />
          </div>

          {/* COUNT IN STOCK + WEIGHT ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* COUNT IN STOCK */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
                Count In Stock
              </label>
              <input
                type="number"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
              />
            </div>

            {/* ✅ WEIGHT */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
                Weight
              </label>
              <select
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
              >
                <option value="1 kg">1 kg</option>
                <option value="2 kg">2 kg</option>
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 py-2.5 px-3 sm:px-4 text-sm text-gray-700 h-24 resize-none focus:outline-none focus:border-[#06a34f] focus:ring-2 focus:ring-[#06a34f]/60 transition shadow-[0_0_0_rgba(0,0,0,0)] focus:shadow-[0_0_18px_rgba(6,163,79,0.35)]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-md bg-[#06a34f] px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-gray-800 shadow-[0_0_0_rgba(0,0,0,0)] hover:bg-[#058a42] hover:shadow-[0_0_24px_rgba(6,163,79,0.6)] transition-all"
          >
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductEditScreen;