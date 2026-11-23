import { server } from "../../server";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock } from "react-icons/fi";
import { BsShop } from "react-icons/bs";
import { useLanguage } from "../../hooks/useLanguage";
// User Login Component

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "335149301419-google-mep-client.apps.googleusercontent.com";

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  // Handle Google Credential Response from official Google Identity Services
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
          toast.success(res.data?.message || "Signed in with Google successfully!");
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

          // Render official Google button into the container
          const btnDiv = document.getElementById("googleSignInBtn");
          if (btnDiv) {
            btnDiv.innerHTML = "";
            window.google.accounts.id.renderButton(btnDiv, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "signin_with",
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

  // Trigger Google Sign-In Prompt or Redirect
  const triggerGooglePrompt = () => {
    if (window.google?.accounts?.id) {
      setGoogleLoading(true);
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
          const redirectUri = window.location.origin + "/login";
          const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
            GOOGLE_CLIENT_ID
          )}&redirect_uri=${encodeURIComponent(
            redirectUri
          )}&response_type=token%20id_token&scope=openid%20profile%20email&nonce=${Date.now()}`;
          window.location.href = googleOAuthUrl;
        }
      });
    } else {
      const redirectUri = window.location.origin + "/login";
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20profile%20email&nonce=${Date.now()}`;
      window.location.href = googleOAuthUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${server}/user/login`,
        { email: email.toLowerCase().trim(), password },
        { withCredentials: true }
      );
      toast.success("Welcome back to MEP!");
      setLoading(false);
      navigate("/");
      window.location.reload();
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-800/20">
              <span className="font-serif font-black text-xl tracking-wider">M</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 font-serif">
              {t("auth.signInTitle", "Customer Sign In")}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {t("auth.signInSubtitle", "Sign in to track orders, save favorites, and order bespoke fashion")}
            </p>
          </div>

          {/* Google Sign-In (Single Unified Button) */}
          <div className="mb-5 flex justify-center">
            <div
              id="googleSignInBtn"
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
                    : t("auth.googleSignIn", "Sign in with Google")}
                </span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-stone-400">
              <span className="bg-white px-3">
                {t("auth.orEmailSignIn", "or sign in with email")}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t("auth.emailAddress", "Email Address")}
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
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {t("auth.password", "Password")}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-amber-800 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <FiLock size={15} />
                </div>
                <input
                  type={visible ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm outline-none transition"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{t("auth.loginHere", "Sign In")}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-500 space-y-2">
            <div>
              {t("auth.noAccountPrompt", "Don't have an account yet?")}{" "}
              <Link to="/signup" className="text-amber-800 font-bold hover:underline">
                {t("auth.createFreeAccount", "Create Free Account")}
              </Link>
            </div>
            <div>
              <Link
                to="/shop-login"
                className="inline-flex items-center gap-1.5 text-stone-600 hover:text-amber-800 font-semibold transition"
              >
                <BsShop size={13} className="text-amber-700" />
                <span>{t("auth.sellerPortalPrompt", "Are you an artisan merchant? Seller Portal →")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Login;
