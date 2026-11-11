import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiShield, FiTruck, FiAward, FiHeart } from "react-icons/fi";

function Hero() {
  const collections = [
    {
      title: "Women's Habesha Kemis",
      desc: "Delicate handwoven Shemma dresses with intricate Tibeb patterns",
      image: "/photo.jpg",
      link: "/product/category/Habesha Kemis",
      tag: "Best Seller",
    },
    {
      title: "Men's Cultural Suits",
      desc: "Distinguished traditional suits, vests, and hand-loomed shirts",
      image: "/hero.jpg",
      link: "/product/category/Men's Attire",
      tag: "Handcrafted",
    },
    {
      title: "Children's Cultural Attire",
      desc: "Vibrant and authentic traditional outfits tailored for kids",
      image: "/child/10005.jpg",
      link: "/product/category/Kids Collection",
      tag: "Festive",
    },
    {
      title: "Elders & Ceremonial Wear",
      desc: "Regal gabi, netela shawls, and ceremonial heritage garments",
      image: "/elder/10009.jpg",
      link: "/product/category/Ceremonial & Elders",
      tag: "Authentic",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Cultural Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-100/80 border border-amber-200/60 px-4 py-1.5 rounded-full text-xs font-bold text-amber-900 tracking-wide mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              ETHIOPIAN TRADITIONAL CLOTH EXCHANGE PLATFORM
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight font-serif leading-[1.15]">
              Timeless Habesha Elegance,{" "}
              <span className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 bg-clip-text text-transparent">
                Woven for Today.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Immerse yourself in authentic Ethiopian craftsmanship. From hand-spun cotton
              <span className="font-semibold text-gray-800"> Shemma </span> to exquisite
              <span className="font-semibold text-gray-800"> Tibeb </span> embroidery, we connect local artisan weavers directly to your wardrobe.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition duration-200"
              >
                <span>Explore All Collections</span>
                <FiArrowRight className="text-lg" />
              </Link>
              <Link
                to="/shop-create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-gray-300 hover:border-amber-700 text-gray-800 hover:text-amber-800 font-semibold rounded-full shadow-sm hover:shadow transition duration-200"
              >
                <span>Open Your Artisan Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Highlights Bar */}
      <div className="bg-white border-y border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-2 text-xl">
                <FiAward />
              </div>
              <h4 className="text-sm font-bold text-gray-900">100% Authentic Handspun</h4>
              <p className="text-xs text-gray-500 mt-0.5">True Ethiopian artisan quality</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 text-xl">
                <FiShield />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Secure Chapa Payments</h4>
              <p className="text-xs text-gray-500 mt-0.5">Telebirr, CBE & card support</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-2 text-xl">
                <FiTruck />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Fast Reliable Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">All over Ethiopia & global</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mb-2 text-xl">
                <FiHeart />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Fair Trade Artisans</h4>
              <p className="text-xs text-gray-500 mt-0.5">Direct support to local weavers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Age-Based & Style Collection Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Curated Heritage Styles
            </span>
            <h2 className="text-3xl font-black text-gray-900 font-serif mt-1">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 hover:text-amber-900 mt-2 md:mt-0 group"
          >
            <span>View Complete Catalog</span>
            <FiArrowRight className="group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* 4 Interactive Collection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col, idx) => (
            <Link
              key={idx}
              to={col.link}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-96 flex flex-col justify-end p-6 border border-gray-100"
            >
              {/* Background Image with Zoom */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${col.image}')` }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 group-hover:from-black/90 transition-colors" />

              {/* Card Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-md text-amber-900 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  {col.tag}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 text-white">
                <h3 className="text-xl font-bold font-serif group-hover:text-amber-300 transition leading-snug">
                  {col.title}
                </h3>
                <p className="text-xs text-gray-200 mt-1 line-clamp-2 leading-relaxed opacity-90">
                  {col.desc}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:text-amber-300 tracking-wide">
                  <span>Shop Collection</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;
