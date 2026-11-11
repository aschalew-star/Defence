import { server } from "../../server";
import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BsShop, BsUpload, BsCheckCircleFill } from "react-icons/bs";
import ShopHeader from "./ShopHeader";

function ShopCreate() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${server}/shop/shopcreate`,
        {
          name,
          email,
          password,
          avatar,
          zipCode,
          address,
          phoneNumber,
        },
        { withCredentials: true }
      );

      toast.success("Shop registered successfully! Welcome to MEP.");
      setLoading(false);
      navigate("/dashboard");
      window.location.reload();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Error creating shop. Please verify your details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <ShopHeader isLogin={false} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Artisan Showcase & Brand message */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-700/60 border border-amber-600 flex items-center justify-center mb-6">
                <BsShop className="text-2xl text-amber-200" />
              </div>
              <h2 className="text-3xl font-black font-serif leading-tight">
                Share Ethiopian Craftsmanship with the World
              </h2>
              <p className="mt-4 text-amber-200/90 text-sm leading-relaxed">
                Join our network of verified weavers, cultural designers, and traditional fashion boutiques. Reach local and diaspora customers eager for authentic Ethiopian apparel.
              </p>

              <div className="mt-8 space-y-3.5">
                {[
                  "Zero listing fees to get started",
                  "Direct Chapa, Telebirr & CBE payments",
                  "Built-in customer direct messaging",
                  "Verified Artisan Storefront & analytics",
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-amber-100">
                    <BsCheckCircleFill className="text-emerald-400 text-sm shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-amber-800/80 relative z-10 text-xs text-amber-300">
              Already have an artisan account?{" "}
              <Link to="/ShopLogin" className="text-white font-bold underline hover:text-amber-200">
                Sign in to your shop
              </Link>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 p-8 sm:p-12">
            <h3 className="text-2xl font-bold text-gray-900 font-serif">
              Register Your Artisan Shop
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-8">
              Fill in your business details to setup your shop storefront.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Shop Logo Upload */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <BsShop className="text-2xl text-gray-400" />
                  )}
                </div>
                <div>
                  <label
                    htmlFor="shop-avatar"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition"
                  >
                    <BsUpload /> Upload Shop Logo / Avatar
                  </label>
                  <input
                    type="file"
                    id="shop-avatar"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="sr-only"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Shop / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Roha Handwoven Kemis"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
                />
              </div>

              {/* Grid: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shop@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="number"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+251 9..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
                  />
                </div>
              </div>

              {/* Grid: Address & Zip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Store Location / Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Piazza, Shiro Meda, Addis Ababa"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="number"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="1000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <input
                    type={visible ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {visible ? <AiOutlineEyeInvisible className="text-lg" /> : <AiOutlineEye className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Complete Registration & Open Shop</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopCreate;
