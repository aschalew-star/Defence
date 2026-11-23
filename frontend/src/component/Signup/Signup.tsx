import { server } from "../../server";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiTag,
  FiCheck,
} from "react-icons/fi";
import { BsCoin, BsShop } from "react-icons/bs";
import axios from "axios";
import { useLanguage } from "../../hooks/useLanguage";
// User Signup Component

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "335149301419-google-mep-client.apps.googleusercontent.com";

function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Pure Signup Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  // Auto-detect referral code from URL query: e.g. /signup?ref=HABESHA-XYZ123
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.trim()) {
      setReferralCode(ref.toUpperCase().trim());
      setShowReferralInput(true);
    }
  }, [searchParams]);

  // Handle Google Credential Callback from official Google Identity Services
  const handleGoogleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response?.credential) {
        toast.error("Google authentication failed. Please try again.");
        return;
      }

      setGoogleLoading(true);
      try {
        const res = await axios.post(
          `${server}/user/google-auth`,
          { credential: response.credential },
          { withCredentials: true }
        );

        if (res.data?.success) {
          toast.success(
            res.data?.message || "Signed in with Google! 100 Habesha Coins credited."
          );
          setGoogleLoading(false);
          navigate("/");
          window.location.reload();
        }
      } catch (err: any) {
        setGoogleLoading(false);
        toast.error(
          err.response?.data?.message || "Google sign-in could not be completed."
        );
      }
    },
    [navigate]
  );

  // Initialize Official Google Identity Services SDK
  useEffect(() => {
    const initGoogleGSI = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render official Google button into the container if available
          const btnDiv = document.getElementById("googleSignUpBtn");
          if (btnDiv) {
            btnDiv.innerHTML = "";
            window.google.accounts.id.renderButton(btnDiv, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "signup_with",
              shape: "pill",
              width: 320,
              logo_alignment: "left",
            });

            // If Google successfully renders the official button iframe, mark it loaded
            setTimeout(() => {
              if (btnDiv.querySelector("iframe")) {
                setGsiLoaded(true);
              }
            }, 150);
          }
        } catch (e) {
          console.warn("Google GSI initialization notice:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGSI();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogleGSI();
          clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [handleGoogleCredentialResponse]);

  // Trigger Google Sign-In Popup
  const triggerGooglePrompt = () => {
    if (window.google?.accounts?.id) {
      setGoogleLoading(true);
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
          // If prompt was skipped or suppressed, redirect to standard Google OAuth consent
          const redirectUri = window.location.origin + "/signup";
          const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
            GOOGLE_CLIENT_ID
          )}&redirect_uri=${encodeURIComponent(
            redirectUri
          )}&response_type=token%20id_token&scope=openid%20profile%20email&nonce=${Date.now()}`;
          window.location.href = googleOAuthUrl;
        }
      });
    } else {
      // Direct redirect to Google OAuth endpoint
      const redirectUri = window.location.origin + "/signup";
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20profile%20email&nonce=${Date.now()}`;
      window.location.href = googleOAuthUrl;
    }
  };

  // Handle Standard Form Signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${server}/user/signup`,
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          phoneNumber: phoneNumber.trim(),
          referralCode: referralCode.trim() || undefined,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(
          res.data?.message ||
            "Account created! 100 Habesha Coins have been added to your balance."
        );
        setLoading(false);
        navigate("/");
        window.location.reload();
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Registration failed. Please check your details."
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-800/20">
              <span className="font-serif font-black text-xl tracking-wider">M</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 font-serif">
              {t("auth.signUpTitle", "Create an Account")}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {t("auth.signUpSubtitle", "Join MEP to order authentic Ethiopian handcrafted fashion")}
            </p>
          </div>

          {/* Google Sign-In (Single Unified Button) */}
          <div className="mb-5 flex justify-center">
            <div
              id="googleSignUpBtn"
              className={gsiLoaded ? "flex justify-center w-full min-h-[44px]" : "hidden"}
            />

            {!gsiLoaded && (
              <button
                type="button"
                onClick={triggerGooglePrompt}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 active:scale-[0.99] text-stone-700 font-bold text-xs shadow-2xs transition"
              >
                <FcGoogle className="text-lg shrink-0" />
                <span>
                  {googleLoading
                    ? t("auth.connectingGoogle", "Connecting to Google...")
                    : t("auth.googleSignUp", "Sign up with Google")}
                </span>
              </button>
            )}
          </div>

          {/* Clean Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-stone-400">
              <span className="bg-white px-3">
                {t("auth.orEmailSignUp", "or register with email")}
              </span>
            </div>
          </div>

          {/* Standard Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t("auth.fullName", "Full Name")} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <FiUser size={15} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Almaz Bekele"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t("auth.emailAddress", "Email Address")} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <FiMail size={15} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="almaz@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t("auth.password", "Password")} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <FiLock size={15} />
                </div>
                <input
                  type={visible ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {visible ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t("auth.phoneNumber", "Phone Number")}{" "}
                <span className="text-stone-400 font-normal lowercase">(Optional - for Telebirr / SMS)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <FiPhone size={15} />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0911234567 or +251 91 123 4567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
                />
              </div>
            </div>

            {/* Expandable Referral Code */}
            <div className="pt-1">
              {!showReferralInput ? (
                <button
                  type="button"
                  onClick={() => setShowReferralInput(true)}
                  className="text-xs text-amber-800 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <FiTag size={12} /> Have a referral code? (+50 Extra Coins)
                </button>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Friend Referral Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HABESHA-XYZ123"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                    {referralCode.trim().length >= 4 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-bold flex items-center gap-1">
                        <FiCheck /> +50 Coins Active
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Welcome Coins Celebration Box */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <BsCoin />
              </div>
              <div className="leading-tight">
                <strong className="text-amber-950">100 Habesha Coins Included!</strong>
                <div className="text-[11px] text-amber-800/80">
                  Instant 100 ETB discount on your first order.
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{t("auth.createFreeAccount", "Create Free Account")}</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center space-y-2 text-xs text-stone-500">
            <div>
              {t("auth.haveAccountPrompt", "Already have an account?")}{" "}
              <Link to="/login" className="text-amber-800 font-bold hover:underline">
                {t("auth.loginHere", "Sign In")}
              </Link>
            </div>

            <div className="pt-1">
              <Link
                to="/shop-create"
                className="inline-flex items-center gap-1.5 text-stone-700 hover:text-amber-800 font-semibold transition"
              >
                <BsShop size={13} className="text-amber-700" />
                <span>{t("auth.sellerPortalPrompt", "Are you an artisan seller? Open a merchant boutique →")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Signup;
