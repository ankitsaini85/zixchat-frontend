"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { saveAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState<{message: string; isBanned?: boolean; banType?: string; banReason?: string; daysRemaining?: number} | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

const handleSubmit = async (e: any) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }
  );

  const data = await res.json();
  setLoading(false);

  if (res.ok) {
    const user = {
      ...data.user,
      quizCompleted: true,
      profileCompleted: true
    };
    saveAuth(data.token, user);
    login();
    router.push("/matches");
  } else {
    setError({
      message: data.message,
      isBanned: data.isBanned,
      banType: data.banType,
      banReason: data.banReason,
      daysRemaining: data.daysRemaining
    });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] flex items-center justify-center p-4 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/20 p-6 sm:p-8 backdrop-blur">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Login to ZixChat</h1>
          <p className="text-slate-300 mt-2">Welcome back!</p>
        </div>

        {error && error.isBanned && (
          <div className="bg-red-500/10 border-l-4 border-red-400 p-4 rounded-lg text-red-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl mt-1">🚫</div>
              <div className="flex-1">
                <h3 className="font-bold text-red-100 text-lg mb-2">
                  {error.banType === "permanent" ? "Account Permanently Banned" : "Account Temporarily Banned"}
                </h3>
                <p className="text-red-100 mb-3">
                  {error.banType === "permanent" 
                    ? "Your account has been permanently banned and you cannot log in."
                    : `Your account is temporarily banned for ${error.daysRemaining} more day${error.daysRemaining !== 1 ? 's' : ''}.`
                  }
                </p>
                <div className="bg-red-500/10 p-3 rounded-lg mb-3">
                  <p className="text-sm font-semibold text-red-100 mb-1">Reason:</p>
                  <p className="text-red-100">{error.banReason}</p>
                </div>
                <p className="text-xs text-red-200">Please contact support if you believe this is an error.</p>
              </div>
            </div>
          </div>
        )}

        {error && !error.isBanned && (
          <div className="bg-red-500/10 border border-red-400/60 text-red-100 px-4 py-3 rounded-lg flex items-start gap-2">
            <span className="text-xl mt-0.5">⚠️</span>
            <p>{error.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <input
            className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />

          <input
            type="password"
            className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold p-3 rounded-lg transition-all shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center text-sm text-slate-300">
          <p>
            Don't have an account?{" "}
            <a href="/signup" className="text-pink-300 hover:text-pink-200 font-semibold">
              Sign up here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
