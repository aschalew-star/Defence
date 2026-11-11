import React from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-300 mt-20 border-t border-amber-900/40">
      {/* Newsletter Strip */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 py-8 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif">
              Stay Connected with Ethiopian Fashion
            </h3>
            <p className="text-xs text-amber-200 mt-0.5">
              Subscribe to get exclusive previews of new handwoven collections, festive discounts, and artisan stories.
            </p>
          </div>
          <div className="flex w-full md:w-auto max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="bg-white/10 border border-amber-600/40 text-white placeholder-amber-200/60 px-4 py-2.5 rounded-xl text-xs flex-1 outline-none focus:bg-white/20 focus:border-white transition"
            />
            <button className="px-5 py-2.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs transition shadow shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center text-white font-extrabold text-xl shadow">
              M
            </div>
            <span className="text-2xl font-bold font-serif text-white tracking-tight">
              MEP<span className="text-amber-500">.</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Ethiopia's premier cultural fashion marketplace. We bring centuries of authentic hand-spun cotton and Tibeb craftsmanship to wardrobes worldwide.
          </p>
          <div className="flex items-center gap-3 text-gray-400">
            <AiFillFacebook size={20} className="hover:text-amber-400 cursor-pointer transition" />
            <AiFillInstagram size={20} className="hover:text-amber-400 cursor-pointer transition" />
            <AiOutlineTwitter size={20} className="hover:text-amber-400 cursor-pointer transition" />
            <AiFillYoutube size={20} className="hover:text-amber-400 cursor-pointer transition" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 font-serif">
            Traditional Collections
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>
              <Link to="/product/category/Habesha Kemis" className="hover:text-white transition">
                Women's Habesha Kemis
              </Link>
            </li>
            <li>
              <Link to="/product/category/Men's Attire" className="hover:text-white transition">
                Men's Cultural Suits & Shirts
              </Link>
            </li>
            <li>
              <Link to="/product/category/Kids Collection" className="hover:text-white transition">
                Children's Festive Attire
              </Link>
            </li>
            <li>
              <Link to="/product/category/Ceremonial & Elders" className="hover:text-white transition">
                Gabi, Netela & Shawls
              </Link>
            </li>
            <li>
              <Link to="/event" className="hover:text-white transition">
                Cultural Events & Festivals
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 font-serif">
            Customer Support
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>
              <Link to="/shops" className="hover:text-white transition text-amber-300 font-semibold">
                Explore Verified Artisans
              </Link>
            </li>
            <li>
              <Link to="/order" className="hover:text-white transition">
                Track My Order
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white transition">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-white transition">
                My Saved Wishlist
              </Link>
            </li>
            <li>
              <Link to="/shop-create" className="hover:text-white transition">
                Become a Verified Artisan
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 font-serif">
            Contact & Office
          </h4>
          <div className="space-y-2 text-xs text-gray-400">
            <p>📍 Shiro Meda & Piazza, Addis Ababa, Ethiopia</p>
            <p>📞 Phone: +251 900 342 940</p>
            <p>✉️ Email: support@mepethiopia.com</p>
            <p>💳 Payments: Chapa, Telebirr, CBE Birr, Visa, Mastercard</p>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-gray-800/80 py-4 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} MEP Ethiopian Traditional Cloth Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
