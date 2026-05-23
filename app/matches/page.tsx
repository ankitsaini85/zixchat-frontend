"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import MatchCard from "@/components/match/MatchCard";

/* 🗺️ MAP – CLIENT ONLY */
const NearbyMap = dynamic(
  () => import("@/components/map/NearbyMap"),
  { ssr: false }
);

type RequestState = {
  status: "idle" | "pending" | "accepted";
  requestId?: string;
};

type MatchCardData = {
  userId: string;
  name: string;
  photo?: string | null;
  compatibility: number;
};

type NearbyUser = {
  userId: string;
  name: string;
  gender?: string;
  photo?: string | null;
  distanceKm?: number;
  lat?: number;
  lng?: number;
};

type NearbyResponse = {
  users?: NearbyUser[];
  me?: { lat: number; lng: number } | null;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchCardData[]>([]);
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState<Record<string, RequestState>>({});
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => (res.ok ? ((await res.json()) as MatchCardData[]) : []))
      .then(data => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setMatches([]));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/nearby`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => (res.ok ? ((await res.json()) as NearbyResponse) : null))
      .then(data => {
        setNearby(Array.isArray(data?.users) ? data.users : []);
        setMyLocation(data?.me ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* 🔁 POLL REQUEST STATUS */
  const pollStatus = (userId: string, requestId: string, userName: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/status/${requestId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );

      const data = await res.json();

      if (data.status === "accepted") {
        clearInterval(interval);

        setRequests(prev => ({
          ...prev,
          [userId]: { status: "accepted" }
        }));

        setNotification(`🎉 ${userName} accepted your request`);
      }
    }, 2000);
  };

  const sendRequest = async (user: NearbyUser) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/requests/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ receiverId: user.userId })
      }
    );

    const data = await res.json();

    if (res.ok) {
      setRequests(prev => ({
        ...prev,
        [user.userId]: {
          status: "pending",
          requestId: data.requestId
        }
      }));

      pollStatus(user.userId, data.requestId, user.name);
    } else {
      alert(data.message || "Failed");
    }
  };

  const nearbyForMap = nearby
    .filter(u => typeof u.lat === "number" && typeof u.lng === "number")
    .map(u => ({
      userId: u.userId,
      name: u.name,
      gender: u.gender ?? "Unknown",
      photo: u.photo ?? null,
      distanceKm: typeof u.distanceKm === "number" ? u.distanceKm : 0,
      lat: u.lat as number,
      lng: u.lng as number
    }));

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] py-10 px-4 text-white overflow-hidden">
        {/* Ambient blur effects */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-10">

          {/* 🔔 NOTIFICATION */}
          {notification && (
            <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur border border-green-400/40 text-green-200 px-4 py-3 rounded-xl flex justify-between items-center shadow-lg shadow-green-500/10">
              <span className="font-semibold">{notification}</span>
              <button
                onClick={() => setNotification(null)}
                className="text-sm text-green-300 hover:text-green-100 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* HEADER */}
          <div className="text-center mb-2 space-y-3">
            <p className="inline-flex px-4 py-1 rounded-full bg-white/5 backdrop-blur text-sm font-semibold text-purple-400 border border-purple-400/40 shadow-lg shadow-purple-500/10">
              ✨ Curated for you
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Discover People Nearby
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              See compatible matches and nearby people on the map. Send a request and start chatting once accepted.
            </p>
          </div>

          {/* MAP */}
          {!loading && myLocation && nearbyForMap.length > 0 && (
            <section className="bg-white/5 backdrop-blur rounded-3xl shadow-xl shadow-purple-500/10 border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-purple-400">Live map</p>
                  <h2 className="text-xl font-bold text-white">People around you</h2>
                </div>
                <span className="text-sm text-slate-400">{nearbyForMap.length} nearby profiles</span>
              </div>

              <div className="h-[420px]">
                <NearbyMap
                  center={[myLocation.lat, myLocation.lng]}
                  users={nearbyForMap}
                />
              </div>
            </section>
          )}

          {!loading && (!myLocation || nearby.length === 0) && (
            <section className="bg-white/5 backdrop-blur rounded-3xl shadow-xl shadow-purple-500/10 border border-white/10 p-6 text-center space-y-3">
              <p className="text-lg font-semibold text-white">No nearby profiles yet</p>
              <p className="text-sm text-slate-300">Turn on location and refresh, or try again soon.</p>
              <div className="flex justify-center gap-3 text-sm text-slate-300">
                <span>📍 Location required for map</span>
              </div>
            </section>
          )}

          {/* NEARBY LIST */}
          {!loading && nearby.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-white">📍 People Near You</h2>
                <p className="text-sm text-slate-400">Swipe to explore • {nearby.length} nearby</p>
              </div>

              {/* Mobile: Horizontal Slider */}
              <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {nearby.map(user => {
                  const state = requests[user.userId]?.status || "idle";

                  return (
                    <div
                      key={user.userId}
                      className="min-w-[280px] flex-shrink-0 snap-center bg-white/5 backdrop-blur rounded-2xl shadow-lg shadow-purple-500/10 border border-white/10 p-6 flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name}
                              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/40 flex items-center justify-center text-base font-semibold text-white">
                              {user.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-white">{user.name}</h3>
                            <p className="text-sm text-slate-400 capitalize">{user.gender}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full font-semibold border border-purple-400/40">
                          {user.distanceKm} km
                        </span>
                      </div>

                      {state === "idle" && (
                        <button
                          onClick={() => sendRequest(user)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all hover:-translate-y-0.5"
                        >
                          Send Request
                        </button>
                      )}

                      {state === "pending" && (
                        <button
                          disabled
                          className="w-full py-3 rounded-xl bg-white/5 text-slate-400 font-semibold border border-white/20 cursor-not-allowed"
                        >
                          ⏳ Waiting for acceptance
                        </button>
                      )}

                      {state === "accepted" && (
                        <Link
                          href={`/chat/${user.userId}`}
                          className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
                        >
                          ▶ Start Chat
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                {nearby.map(user => {
                  const state = requests[user.userId]?.status || "idle";

                  return (
                    <div
                      key={user.userId}
                      className="bg-white/5 backdrop-blur rounded-2xl shadow-lg shadow-purple-500/10 border border-white/10 p-6 flex flex-col gap-4 transition-all hover:bg-white/10 hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name}
                              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/40 flex items-center justify-center text-base font-semibold text-white">
                              {user.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-white">{user.name}</h3>
                            <p className="text-sm text-slate-400 capitalize">{user.gender}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full font-semibold border border-purple-400/40">
                          {user.distanceKm} km
                        </span>
                      </div>

                      {state === "idle" && (
                        <button
                          onClick={() => sendRequest(user)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all hover:-translate-y-0.5"
                        >
                          Send Request
                        </button>
                      )}

                      {state === "pending" && (
                        <button
                          disabled
                          className="w-full py-3 rounded-xl bg-white/5 text-slate-400 font-semibold border border-white/20 cursor-not-allowed"
                        >
                          ⏳ Waiting for acceptance
                        </button>
                      )}

                      {state === "accepted" && (
                        <Link
                          href={`/chat/${user.userId}`}
                          className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
                        >
                          ▶ Start Chat
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!loading && nearby.length === 0 && (
            <section className="space-y-3 text-center bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-6">
              <p className="text-lg font-semibold text-white">No nearby people yet</p>
              <p className="text-sm text-slate-300">We couldn't find nearby profiles. Enable location and refresh.</p>
            </section>
          )}

          {/* COMPATIBILITY MATCHES */}
          {!loading && matches.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-white">❤️ Compatibility Matches</h2>
                <p className="text-sm text-slate-400">Swipe to explore • {matches.length} matches</p>
              </div>

              {/* Mobile: Horizontal Slider */}
              <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {matches.map(match => (
                  <div key={match.userId} className="min-w-[280px] flex-shrink-0 snap-center">
                    <MatchCard match={match} />
                  </div>
                ))}
              </div>

              {/* Desktop: Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(match => (
                  <MatchCard key={match.userId} match={match} />
                ))}
              </div>
            </section>
          )}

          {!loading && matches.length === 0 && (
            <section className="text-center bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-6">
              <p className="text-lg font-semibold text-white">No compatibility matches yet</p>
              <p className="text-sm text-slate-300 mt-2">We'll show curated matches as soon as they are available.</p>
              <Link
                href="/profile"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-0.5"
              >
                Improve my profile
              </Link>
            </section>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
