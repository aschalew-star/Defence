import { server } from "../../server";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { BsUpload } from "react-icons/bs";
import axios from "axios";
import Navbar from "../Layout/Navbar";

function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
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
      await axios.post(
        `${server}/user/signup`,
        { name, email, password, avatar },
        { withCredentials: true }
      );
      toast.success("Account created successfully! Welcome to MEP.");
      setLoading(false);
      navigate("/");
      window.location.reload();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Registration failed");
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
              Create an Account
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Join MEP to order authentic Ethiopian traditional fashion
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Preview & Upload */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <CgProfile className="text-2xl text-gray-400" />
                )}
              </div>
              <div>
                <label
                  htmlFor="user-avatar"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition"
                >
                  <BsUpload /> Upload Photo (Optional)
                </label>
                <input
                  type="file"
                  id="user-avatar"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="sr-only"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abebe Bikila"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-800 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
