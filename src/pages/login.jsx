import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../config/firebase";
import { googleLogin } from "../api/auth";
import SplashScreen from "../components/SplashScreen";
import { useAuth } from "../context/authContext";

const ALLOWED_EMAIL_DOMAIN = "paterostechnologicalcollege.edu.ph";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  const APP_VERSION = import.meta.env.VITE_APP_VERSION || "v0.1.0";

  const { setUser } = useAuth();

  const loginWithGoogle = async () => {
    setError("");
    setIsLoading(true);

    try {
      const firebaseResult = await signInWithPopup(auth, googleProvider);
      const firebaseUser = firebaseResult.user;
      const normalizedEmail = firebaseUser?.email?.trim().toLowerCase();

      if (!normalizedEmail?.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        await signOut(auth);
        throw new Error(
          `Only ${ALLOWED_EMAIL_DOMAIN} email accounts are accepted.`,
        );
      }

      const payload = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName,
      };

      // Call backend login and get user info
      const loginResult = await googleLogin(payload);
      const loggedInUser = loginResult?.user;
      if (!loggedInUser?.id)
        throw new Error("Login failed: No user ID returned");

      setUser(loggedInUser);

      navigate(`/dashboard/${loggedInUser.id}`, { replace: true });
    } catch (err) {
      setError(err?.message);
      setTimeout(() => setError(""), 6000);

      console.error("Google login error", err);
    } finally {
      setIsLoading(false);
    }
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
          <span className="bg-white/70 opacity-60 z-1 blur-3xl rounded-full w-100 h-100 inset-1  "></span>
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
              <p className="text-sm text-slate-950 md:text-slate-500">
                Pateros Technological College Quiz Portal
              </p>
            </header>

            <div className="mb-8 rounded-2xl md:bg-slate-50 bg-white/40 px-4 py-3.5 text-center text-xs font-medium text-slate-600 md:ring-1 md:ring-inset border border-dashed md:ring-slate-200/60">
              Please use your{" "}
              <span className="font-semibold text-slate-900">
                @{ALLOWED_EMAIL_DOMAIN}
              </span>{" "}
              account
            </div>

            <button
              type="button"
              onClick={loginWithGoogle}
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

            {/* Footer: version + terms */}

            {/* Terms modal */}
            {showTerms && (
              <div className="absolute inset-0 z-50 flex items-center justify-center ">
                <div className=" w-xs rounded-xl bg-white p-6 ">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Terms & Conditions
                    </h3>
                    <button
                      onClick={() => setShowTerms(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="prose max-w-none text-sm text-slate-700">
                    <p>
                      By using this service you agree to the policies of Pateros
                      Technological College.
                    </p>
                    <p className="mt-4 text-xs text-slate-400">
                      Last updated: 2026-04-21
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-300">
            <div>Version {APP_VERSION}</div>
            <span className="h-4 inset-1 w-[0.3px] rounded-full bg-emerald-400/70"></span>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-slate-300 hover:underline"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
