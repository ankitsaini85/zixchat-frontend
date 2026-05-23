"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getToken, getUser } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionModal from "@/components/SubscriptionModal";

let socket: any;

type ChatMessage = {
  sender: string;
  message: string;
  status?: "sent" | "delivered" | "seen";
};

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const currentUser = getUser();
  const currentUserId = currentUser?.id || currentUser?._id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<{ name: string; photo?: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Free trial and subscription states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [trialActive, setTrialActive] = useState(false);
  const [trialTimeLeft, setTrialTimeLeft] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  
  // Check access and start free trial
  useEffect(() => {
    const checkAccessStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/access`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (data.hasAccess) {
          setHasAccess(true);
          if (data.reason === "trial" && data.trialEndsAt) {
            setTrialActive(true);
            const endsAt = new Date(data.trialEndsAt).getTime();
            const now = Date.now();
            setTrialTimeLeft(Math.max(0, Math.floor((endsAt - now) / 1000)));
          }
        } else {
          // No access - check if trial can be started
          if (data.reason === "no_trial") {
            // Start free trial automatically
            const trialRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/trial/start`, {
              method: "POST",
              headers: { Authorization: `Bearer ${getToken()}` }
            });
            const trialData = await trialRes.json();
            
            if (trialData.ok) {
              setHasAccess(true);
              setTrialActive(true);
              const endsAt = new Date(trialData.trialEndsAt).getTime();
              const now = Date.now();
              setTrialTimeLeft(Math.max(0, Math.floor((endsAt - now) / 1000)));
            }
          } else {
            // Trial already used and expired
            setTrialExpired(true);
            setShowSubscriptionModal(true);
          }
        }
      } catch (err) {
        console.error("Access check error:", err);
      }
    };

    checkAccessStatus();
  }, []);

  // Trial countdown timer
  useEffect(() => {
    if (!trialActive || trialTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setTrialTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setTrialActive(false);
          setHasAccess(false);
          setTrialExpired(true);
          setShowSubscriptionModal(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trialActive, trialTimeLeft]);

  useEffect(() => {
    const user = getUser();
    
    // Debug: Check user state
    console.log("User state:", user);
    console.log("Profile completed:", user?.profileCompleted);

    // Fetch other user's profile with error guarding (no throwing to avoid parse issues)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Profile fetch failed", res.status, text);
          return null;
        }
        try {
          return await res.json();
        } catch (e) {
          console.error("Profile JSON parse error", e);
          return null;
        }
      })
      .then(data => {
        if (data?.name) {
          setOtherUser({ name: data.name, photo: data.photo || null });
        } else {
          setOtherUser({ name: "Conversation", photo: null });
        }
      })
      .catch(err => {
        console.error("Failed to fetch user profile:", err);
        setOtherUser({ name: "Conversation", photo: null });
      });
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(async res => {
        if (res.status === 403) {
          const errorData = await res.json();
          console.error("Chat access denied:", errorData);
          
          // Check if it's really a profile issue or a request issue
          if (errorData.message?.includes("Complete your profile")) {
            alert("Please complete your profile first");
            router.push("/profile-setup");
          } else {
            alert(errorData.message || "Unable to access chat");
            router.push("/matches");
          }
          return [];
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      });

    socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      auth: { token: getToken() }
    });

    socket.on("chat_blocked", ({ message }: any) => {
      alert(message);
      socket.disconnect();
      router.push("/profile-setup");
    });

    socket.emit("check_online", { userId: id });

    socket.on("online_status", ({ userId, online }: any) => {
      if (userId === id) setIsOnline(online);
    });

    socket.on("user_online", ({ userId }: any) => {
      if (userId === id) setIsOnline(true);
    });

    socket.on("user_offline", ({ userId }: any) => {
      if (userId === id) setIsOnline(false);
    });

    socket.on("receive_message", (msg: any) => {
      setMessages(prev => [...prev, msg]);

      // 👀 INSTANT SEEN FIX
      if (msg.sender === id) {
        socket.emit("mark_seen", { withUser: id });
      }
    });

    socket.on("typing", ({ senderId }: any) => {
      if (senderId === id) setIsTyping(true);
    });

    socket.on("stop_typing", ({ senderId }: any) => {
      if (senderId === id) setIsTyping(false);
    });

    socket.on("messages_seen", ({ by }: any) => {
      if (by === id) {
        setMessages(prev =>
          prev.map(m =>
            m.sender === currentUserId
              ? { ...m, status: "seen" }
              : m
          )
        );
      }
    });

    socket.emit("mark_seen", { withUser: id });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    
    // Check if user has access before sending
    if (!hasAccess) {
      setShowSubscriptionModal(true);
      return;
    }

    socket.emit("send_message", {
      receiverId: id,
      message: text
    });

    socket.emit("stop_typing", { receiverId: id });
    setText("");
  };

  const statusLabel = useMemo(() => {
    if (isTyping) return "typing...";
    return isOnline ? "online now" : "offline";
  }, [isOnline, isTyping]);

  return (
    <ProtectedRoute>
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        trialExpired={trialExpired}
      />
      <div className="relative min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] text-white overflow-hidden flex flex-col">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex flex-1 max-w-5xl w-full flex-col px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">💬 Chat</p>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Conversation</h1>
              <p className="text-sm text-slate-400 mt-2">Keep it friendly and respectful</p>

              {/* Trial Timer */}
              {trialActive && trialTimeLeft > 0 && (
                <div className="mt-2 inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="animate-pulse">⏱️</span>
                  Free trial: {trialTimeLeft}s remaining
                </div>
              )}
            </div>
            <Link
              href="/inbox"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5"
            >
              Back to inbox
            </Link>
          </div>

          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl shadow-fuchsia-500/10 min-h-[70vh]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                {otherUser?.photo ? (
                  <img
                    src={otherUser.photo}
                    alt={otherUser.name || "User"}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/40 flex items-center justify-center text-sm font-semibold text-white">
                    {otherUser?.name?.charAt(0) || "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{otherUser?.name || "Loading..."}</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-slate-500"}`} />
                    <p className="text-xs text-slate-300">{statusLabel}</p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
                <span className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">💫</span>
                Safe, respectful conversation
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              <AnimatePresence>
                {messages.map((m, i) => {
                  const isSelf = m.sender === currentUserId;
                  return (
                    <motion.div
                      key={`${i}-${m.message}`}
                      initial={{ opacity: 0, translateY: 8 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -8 }}
                      transition={{ duration: 0.12 }}
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow ${
                            isSelf
                          ? "ml-auto bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-fuchsia-500/25"
                          : "mr-auto border border-white/10 bg-white/10 text-white shadow-black/10"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{m.message}</p>
                      {isSelf && (
                        <p className="mt-2 text-[11px] text-white/80 text-right">
                          {m.status === "seen" ? "Seen" : m.status === "delivered" ? "Delivered" : "Sent"}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 px-4 py-3 sm:px-6">
              {isTyping && (
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Typing...
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400/60 focus:outline-none"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);

                    socket.emit("typing", { receiverId: id });

                    if (typingTimeout) clearTimeout(typingTimeout);

                    const timeout = setTimeout(() => {
                      socket.emit("stop_typing", { receiverId: id });
                    }, 1000);

                    setTypingTimeout(timeout);
                  }}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-0.5"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
