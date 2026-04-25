import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { googleLogin } from "../api/auth";
import SplashScreen from "../components/SplashScreen";
import { useAuth } from "../context/authContext";
import { api } from "../api/api";

const ALLOWED_EMAIL_DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState("");

  const { setUser } = useAuth();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");

      try {
        setIsLoading(true);
        const userInfoResponse = await api.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );

        const googleUser = userInfoResponse.data;
        const normalizedEmail = googleUser?.email?.trim().toLowerCase();
        console.log(googleUser);

        if (!normalizedEmail?.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
          throw new Error(
            `Only ${ALLOWED_EMAIL_DOMAIN} email accounts are accepted.`,
          );
        }

        const payload = {
          uid: googleUser.sub,
          email: googleUser.email,
          displayName: googleUser.name,
          photoURL: googleUser.picture,
          emailVerified: googleUser.email_verified,
        };

        const loginResult = await googleLogin(payload);
        const loggedInUser = loginResult?.user;

        setUser(loggedInUser);
      } catch (err) {
        setIsLoading(false);
        setError(err?.message);
        setTimeout(() => setError(""), 6000);
        console.error("Google login error", err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google login failed");
      setTimeout(() => setError(""), 6000);
      setIsLoading(false);
    },
    hosted_domain: ALLOWED_EMAIL_DOMAIN,
  });

  const handleLogin = () => {
    setIsLoading(true);
    login();
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <main className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Background Image with elegant dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/bg.webp"
            alt="background image of TechItik"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[5px]"></div>
        </div>

        <div className="w-full h-screen absolute flex items-center justify-center">
          <span className="bg-emerald-500/70 opacity-60 z-1 blur-3xl rounded-full w-100 h-130 inset-1  "></span>
        </div>
        <div className="relative z-10 w-full max-w-md">
          <section className="overflow-hidden md:rounded-4xl md:border  md:border-slate-200/60 md:bg-white/80 px-0 py-8 md:px-8 md:py-8 md:shadow-2xl md:shadow-slate-200/50 md:backdrop-blur-xl sm:p-10">
            <div className="mx-auto mb-8 flex items-center justify-center gap-4">
              {/* TechItik Logo */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-50">
                <img
                  src="/app_logo.png"
                  alt="TechItik Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>

              {/* Divider line */}
              <div className="h-6 inset-1 w-[0.3px] rounded-full bg-emerald-400/70"></div>

              {/* School Logo */}
              <div className="flex h-15 w-15 items-center justify-center rounded-full bg-white shadow-lg shadow-slate-200/50 ring-slate-50">
                <img
                  src="/logo.png"
                  alt="Pateros Technological College Logo"
                  className="h-20 w-auto object-contain "
                />
              </div>
            </div>

            <header className="mb-8 space-y-2 text-center">
              <h1
                className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Welcome to{" "}
                <span className="md:text-emerald-500 text-emerald-300  font-black [text-shadow:_0_4px_10px_rgba(0,0,0,0.3)] md:[text-shadow:_0_0px_0px_rgba(0,0,0,0.0)]">
                  TechItik
                </span>
              </h1>
              <p className="text-sm text-slate-200 md:text-slate-500">
                Pateros Technological College Quiz Portal
              </p>
            </header>

            <div className="mb-8 rounded-2xl md:bg-slate-50 bg-white/40 px-4 py-3.5 text-center text-xs font-medium text-slate-600 md:ring-1 md:ring-inset  md:ring-slate-200/60">
              Please use your{" "}
              <span className="font-semibold text-slate-900">
                @{ALLOWED_EMAIL_DOMAIN}
              </span>{" "}
              account
            </div>

            <button
              type="button"
              onClick={() => handleLogin()}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <FcGoogle className="h-4 w-4" />
              </div>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3.5 text-center text-sm text-red-600">
                {error}
              </div>
            ) : null}
          </section>
          <section className="flex items-center w-full justify-center text-slate-300/80">
            <div className="mt-6 flex items-center justify-center gap-3 text-xs ">
              <p>Version 0.1.0</p>
              <span className="h-4 inset-1 w-[0.3px] rounded-full bg-emerald-400/70"></span>
            </div>
            <div className="mt-6 flex items-center justify-center pl-3 text-xs ">
              <p className="hover:underline cursor-pointer">
                Terms and Condition
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
