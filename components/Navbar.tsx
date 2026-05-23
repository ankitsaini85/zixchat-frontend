"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import logoImage from "@/app/assets/logo_zixchat.png";
interface NavbarProps {
  isLandingPage?: boolean;
}

export default function Navbar({ isLandingPage = false }: NavbarProps) {
  const router = useRouter();
  const { isLoggedIn, logout, user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 🔔 unread messages (dummy for now, socket-ready)
  const [unreadCount, setUnreadCount] = useState(2);

  const profileRef = useRef<HTMLDivElement>(null);

  /* ================= SCROLL ANIMATION ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClick = (e: any) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 z-[1200] transition-all duration-500 ease-in-out
      ${isLandingPage ? "bg-transparent" : "bg-gradient-to-r from-[#0b1022]/90 via-[#10172f]/90 to-[#180f2f]/90 backdrop-blur-md"}
      ${ scrolled && isLandingPage ? "shadow-[inset_0_18px_30px_-1px_rgba(0,0,0,0.6)]" : "" }
      ${ scrolled && !isLandingPage ? "shadow-[inset_0_-18px_30px_-18px_rgba(0,0,0,0.6)]" : "" }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center text-white">

        {/* LOGO */}
        <Link href="/" className="hover:scale-105 transition-transform duration-300">
         <img src={logoImage.src} alt="ZixChat Logo" className="h-12 sm:h-16 md:h-20" />
        </Link>

        {/* ================= DESKTOP MENU ================= */}
        <div className="hidden md:flex items-center gap-4">

          {!isLoggedIn ? (
            <>
              <Link 
                href="/login" 
                className="px-7 py-2.5 text-base bg-white text-purple-600 rounded-full font-semibold hover:bg-pink-50 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-7 py-2.5 text-base bg-white text-purple-600 rounded-full font-semibold hover:bg-pink-50 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* INBOX WITH BADGE */}
              <Link 
                href="/inbox" 
                className="relative px-5 py-2.5 text-base rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Inbox
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link 
                href="/matches" 
                className="px-5 py-2.5 text-base rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Matches
              </Link>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <img
                    src={user?.photo || "https://i.pravatar.cc/40"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <span className="hidden lg:block font-semibold text-base">
                    {user?.name || "Profile"}
                  </span>
                  <svg className="w-5 h-5 hidden lg:block transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group"
                      >
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">My Profile</span>
                      </Link>
                      <Link
                        href="/matches"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group"
                      >
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium">Matches</span>
                      </Link>
                      <Link
                        href="/inbox"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group"
                      >
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Inbox</span>
                      </Link>
                      {user?.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group border-t border-gray-100"
                        >
                          <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium text-purple-600">Admin Panel</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 group"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ================= MOBILE HAMBURGER ================= */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
        >
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-6 pt-4 space-y-2 bg-gradient-to-br from-[#0b1022]/95 via-[#10172f]/95 to-[#180f2f]/95 backdrop-blur-md text-white border-t border-white/10 shadow-lg">
          {!isLoggedIn ? (
            <>
              <Link 
                href="/login" 
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 bg-white text-purple-600 rounded-full font-semibold text-center hover:bg-pink-50 transition-all duration-200 shadow-lg"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-full font-semibold text-center hover:shadow-xl transition-all duration-200 shadow-lg"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/inbox" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Inbox
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              <Link 
                href="/matches" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Matches
              </Link>
              
              <Link 
                href="/profile" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>

              {user?.isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 font-medium border border-white/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </Link>
              )}

              <div className="pt-2 border-t border-white/20 mt-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 font-medium border border-red-400/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
