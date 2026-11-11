import { server } from "../../server";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import Navbar from "../Layout/Navbar";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${server}/user/login`,
        { email, password },
        { withCredentials: true }
      );
      toast.success("Welcome back to MEP!");
      setLoading(false);
      navigate("/");
      window.location.reload();
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar show={7} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CgProfile className="text-3xl" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 font-serif">
              Customer Login
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Sign in to track orders, save wishlist, and chat with artisans
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-amber-800 font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
