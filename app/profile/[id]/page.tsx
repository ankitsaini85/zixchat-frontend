"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

type Profile = {
  _id: string;
  name: string;
  bio?: string;
  gender?: string;
  lookingFor?: string;
  photo?: string;
};

export default function ProfileViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const currentUser = getUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const initials = useMemo(() => {
    if (!profile?.name) return "?";
    return profile.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.name]);

  const handleBlock = async () => {
    if (!profile || !confirm("Are you sure you want to block this user?")) return;

    setActionLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          targetUserId: profile._id
        })
      });

      if (!res.ok) throw new Error();

      alert("User blocked successfully");
      router.push("/matches");
    } catch {
      alert("Failed to block user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!profile) return;
    const reason = prompt("Why are you reporting this user?");
    if (!reason) return;

    setActionLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          reportedUserId: profile._id,
          reason
        })
      });

      if (!res.ok) throw new Error();

      alert("User reported successfully");
    } catch {
      alert("Failed to report user");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur animate-pulse h-24" />
              ))}
            </div>
          )}

          {!loading && profile && (
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr] items-start">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-xl shadow-fuchsia-500/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/15"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-white ring-2 ring-white/15">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold leading-tight truncate">{profile.name}</h1>
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                        Verified match
                      </span>
                    </div>
                    <p className="text-slate-300 mt-2 line-clamp-3">{profile.bio || "No bio provided yet."}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-200">
                      <span className="rounded-full bg-white/10 px-3 py-1">{profile.gender || "Gender undisclosed"}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">{profile.lookingFor || "Looking for..."}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Compatibility</p>
                    <p className="mt-2 text-2xl font-semibold text-white">High vibes</p>
                    <p className="text-xs text-slate-400 mt-1">Shared interests detected</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Profile</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{profile.bio ? "Complete" : "Minimal"}</p>
                    <p className="text-xs text-slate-400 mt-1">Bio, gender, and intent</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{currentUser?.profileCompleted ? "Ready to chat" : "Needs setup"}</p>
                    <p className="text-xs text-slate-400 mt-1">Profile completion gate</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {currentUser?.profileCompleted ? (
                    <Link
                      href={`/chat/${profile._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-0.5"
                    >
                      Start chat
                    </Link>
                  ) : (
                    <button
                      onClick={() => router.push("/profile-setup")}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white border border-white/10 transition hover:-translate-y-0.5"
                    >
                      Complete profile to chat
                    </button>
                  )}

                  <button
                    onClick={handleBlock}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-5 py-3 text-sm font-semibold text-red-100 transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    Block user
                  </button>

                  <button
                    onClick={handleReport}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    Report user
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-inner shadow-black/20">
                <h2 className="text-lg font-semibold">Safety controls</h2>
                <p className="text-slate-300 text-sm mt-2">Keep your space respectful. You can block or report if something feels off.</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Chat is available only after you complete your profile.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                    Blocking immediately ends further contact.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-300" />
                    Reports are reviewed by the team.
                  </li>
                </ul>
                <Link
                  href="/matches"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Back to matches
                </Link>
              </div>
            </div>
          )}

          {!loading && !profile && (
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 backdrop-blur p-10 text-center text-slate-200">
              <h2 className="text-2xl font-semibold">Profile not found</h2>
              <p className="mt-2 text-slate-300">This profile may have been removed or is unavailable.</p>
              <Link
                href="/matches"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-0.5"
              >
                Browse matches
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
