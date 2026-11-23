import { server } from "../../server";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BsShop } from "react-icons/bs";
import ShopHeader from "./ShopHeader";

function Shoplogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState(
    searchParams.get("mode") === "admin" ? "admin" : "shop"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMode === "admin") {
        const { data } = await axios.post(
          `${server}/user/admin-login`,
          { email, password },
          { withCredentials: true }
        );
        dispatch({ type: "LoadUserSuccess", payload: data.user });
        toast.success("Administrator login successful!");
        navigate("/AdminDashboard");
        return;
      }

      await axios.post(
        `${server}/shop/login`,
        { email, password },
        { withCredentials: true }
      );
      toast.success("Welcome back to your Shop Dashboard!");
      navigate("/Dashboard");
      window.location.reload();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `Unable to sign in to your ${loginMode === "admin" ? "administrator" : "shop"} account`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <ShopHeader isLogin={true} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BsShop className="text-2xl" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 font-serif">
              {loginMode === "admin" ? "Administrator Login" : "Artisan Shop Login"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {loginMode === "admin"
                ? "Sign in with your administrator account"
                : "Manage your products, orders, and customer messages"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl bg-gray-100 p-1">
            {[
              { id: "shop", label: "Shop" },
              { id: "admin", label: "Administrator" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setLoginMode(mode.id)}
                aria-pressed={loginMode === mode.id}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  loginMode === mode.id
                    ? "bg-white text-amber-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-shop@example.com"
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
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {loginMode === "shop" && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
              Don't have an artisan account?{" "}
              <Link to="/shop-create" className="text-amber-800 font-bold hover:underline">
                Register a New Shop
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shoplogin;
