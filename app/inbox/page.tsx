"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

type Conversation = {
  userId: string;
  name: string;
  photo?: string;
  lastMessage?: string;
  lastAt?: string;
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/inbox`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const recentCount = useMemo(() => {
    const cutoff = Date.now() - 1000 * 60 * 60 * 24;
    return conversations.filter(conv => {
      if (!conv.lastAt) return false;
      return new Date(conv.lastAt).getTime() >= cutoff;
    }).length;
  }, [conversations]);

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] text-white overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-semibold">💬 Inbox</p>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Messages</h1>
              <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed">
                Keep the conversation flowing with your matches
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-slate-200">Active today</span>
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">{recentCount}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
              <p className="text-slate-400 text-sm">Conversations</p>
              <p className="text-3xl font-bold mt-1">{conversations.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total threads with your matches</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
              <p className="text-slate-400 text-sm">Active today</p>
              <p className="text-3xl font-bold mt-1">{recentCount}</p>
              <p className="text-xs text-slate-400 mt-1">Sent or received in the last 24h</p>
            </div>
            <Link
              href="/matches"
              className="rounded-2xl border border-fuchsia-500/40 bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 backdrop-blur p-4 flex flex-col justify-between shadow-lg shadow-fuchsia-500/20 transition hover:-translate-y-0.5 hover:shadow-fuchsia-500/40"
            >
              <div>
                <p className="text-sm text-slate-100">Find new matches</p>
                <p className="text-lg font-semibold">Start a fresh conversation</p>
              </div>
              <span className="text-sm text-fuchsia-100 mt-3">Browse matches →</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur animate-pulse"
                >
                  <div className="h-14 w-14 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded-full bg-white/20" />
                    <div className="h-3 w-2/3 rounded-full bg-white/10" />
                  </div>
                  <div className="h-3 w-12 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 backdrop-blur p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
                💬
              </div>
              <h2 className="text-xl font-semibold">No conversations yet</h2>
              <p className="text-slate-300 mt-2">Matches will show up here once you start chatting. Say hello to get things going.</p>
              <Link
                href="/matches"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-0.5"
              >
                Browse matches
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {conversations.map(conv => (
                <Link
                  key={conv.userId}
                  href={`/chat/${conv.userId}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-fuchsia-400/50 hover:bg-white/10"
                >
                  {conv.photo ? (
                    <img
                      src={conv.photo}
                      alt={conv.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-fuchsia-400/60"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white ring-2 ring-white/5">
                      {conv.name?.charAt(0) || "?"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-white truncate">{conv.name}</p>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">Match</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate mt-1">
                      {conv.lastMessage || "Say something kind to break the ice."}
                    </p>
                  </div>

                  <div className="flex flex-col items-end text-xs text-slate-300 whitespace-nowrap">
                    <span>{formatTime(conv.lastAt)}</span>
                    <span className="mt-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-200">Tap to continue</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
