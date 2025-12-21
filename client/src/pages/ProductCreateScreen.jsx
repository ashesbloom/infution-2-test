// client/src/pages/ProductCreateScreen.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductCreateScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState([]); // multiple image paths
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [weight, setWeight] = useState('1 kg'); // ✅ NEW: weight state
  const [uploading, setUploading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Multi-file upload handler
  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const uploadedPaths = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const { data } = await axios.post('/api/upload', formData, config);
        uploadedPaths.push(data); // e.g. "/uploads/img-123.jpg"
      }

      setImages((prev) => [...prev, ...uploadedPaths]);
    } catch (error) {
      console.error(error);
      alert('Image upload failed!');
    } finally {
      setUploading(false);
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
        price: Number(price),
        image: images[0] || '', // main image (for existing frontend)
        images,                  // all images
        description,
        category,
        countInStock: Number(countInStock),
        weight, // ✅ NEW: send weight to backend
      };

      await axios.post('/api/products', payload, config);
      navigate('/admin/productlist');
    } catch (error) {
      console.error(error);
      alert('Error creating product');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-black text-white flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-3xl bg-[#050505] border border-white/10 rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.9)] px-6 sm:px-8 py-8 md:py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/admin/productlist')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] text-white border border-white/10 hover:bg-[#1a1a1a] transition text-sm"
        >
          ← Back to Products
        </button>

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <p className="text-[11px] tracking-[0.35em] text-emerald-500 uppercase mb-2">
            Admin · Products
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
            Create <span className="text-[#06a34f]">Product</span>
          </h1>
          <p className="mt-2 text-xs md:text-sm text-zinc-400">
            Add a new product with price, stock and multiple images. First image will be used as the main display.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={submitHandler}
          className="space-y-6"
        >
          {/* Name + Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-zinc-400">
                Name
              </label>
              <input
                type="text"
                className="w-full bg-[#101010] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#06a34f]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-zinc-400">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                className="w-full bg-[#101010] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#06a34f]"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-zinc-400">
              Images (you can select multiple)
            </label>

            <input
              type="text"
              className="w-full bg-[#101010] border border-zinc-800 rounded-lg px-3.5 py-2 text-[11px] text-zinc-400 mb-2"
              placeholder="Uploaded image paths will appear here"
              value={images.join(', ')}
              readOnly
            />

            <input
              type="file"
              multiple
              onChange={uploadFileHandler}
              className="block w-full text-sm text-zinc-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-emerald-500/10 file:text-emerald-500
                hover:file:bg-emerald-500/20"
            />

            {uploading && (
              <p className="text-emerald-500 text-xs mt-2 tracking-[0.18em] uppercase">
                Uploading images...
              </p>
            )}

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-lg border border-white/10 overflow-hidden bg-[#111] flex items-center justify-center"
                  >
                    <img
                      src={img}
                      alt={`product-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category + Stock + Weight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-zinc-400">
                Category
              </label>
              <input
                type="text"
                className="w-full bg-[#101010] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#06a34f]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-zinc-400">
                Count In Stock
              </label>
              <input
                type="number"
                min="0"
                className="w-full bg-[#101010] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#06a34f]"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
              />
            </div>

            {/* ✅ NEW: Weight dropdown */}
            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-zinc-400">
                Weight
              </label>
              <select
                className="w-full bg-[#101010] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#06a34f]"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              >
                <option value="1 kg">1 kg</option>
                <option value="2 kg">2 kg</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.2em] text-zinc-400">
              Description
            </label>
            <textarea
              className="w-full bg-[#101010] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#06a34f]"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full bg-[#06a34f] hover:bg-[#058a42] text-white font-black text-xs md:text-sm tracking-[0.3em] uppercase py-3 rounded-xl shadow-[0_0_25px_rgba(6,163,79,0.7)] transition"
          >
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductCreateScreen;