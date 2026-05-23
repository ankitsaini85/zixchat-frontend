// "use client";

// import Link from "next/link";
// import { useAuth } from "@/context/AuthContext";

// export default function Hero() {
//   const { isLoggedIn } = useAuth();

//   return (
//     <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-6">
//       <h1 className="text-4xl md:text-6xl font-bold max-w-3xl">
//         Meaningful connections start with compatibility
//       </h1>

//       <p className="mt-6 text-gray-600 max-w-xl">
//         ZixChat helps you find real relationships through smart,
//         personality-based matching — not endless swiping.
//       </p>

//       <div className="mt-8 flex gap-4">
//         {isLoggedIn ? (
//           <Link
//             href="/matches"
//             className="px-8 py-3 bg-black text-white rounded"
//           >
//             View Matches
//           </Link>
//         ) : (
//           <>
//             <Link
//               href="/signup"
//               className="px-8 py-3 bg-black text-white rounded"
//             >
//               Get Started
//             </Link>
//             <Link
//               href="/login"
//               className="px-8 py-3 border rounded"
//             >
//               Login
//             </Link>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }


// "use client";

// import Link from "next/link";
// import { useAuth } from "@/context/AuthContext";

// export default function Hero() {
//   const { isLoggedIn } = useAuth();

//   return (
//     <section className="relative min-h-[95vh] bg-gradient-to-r from-pink-500 to-purple-600 text-white">
//       <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 px-6 py-24 items-center">

//         {/* LEFT */}
//         <div>
//           <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
//             Get someone <br />
//             <span className="text-pink-200">who truly gets you</span>
//           </h1>

//           <p className="mt-6 text-lg text-pink-100 max-w-xl">
//             ZixChat helps you build meaningful relationships through
//             personality-based compatibility — not endless swiping.
//           </p>

//           <div className="mt-10 flex gap-4 flex-wrap">
//             {isLoggedIn ? (
//               <Link
//                 href="/matches"
//                 className="px-8 py-4 bg-white text-pink-600 rounded-full font-semibold"
//               >
//                 View Matches
//               </Link>
//             ) : (
//               <>
//                 <Link
//                   href="/signup"
//                   className="px-8 py-4 bg-white text-pink-600 rounded-full font-semibold"
//                 >
//                   Start Free Today
//                 </Link>
//                 <Link
//                   href="/login"
//                   className="px-8 py-4 border border-white rounded-full"
//                 >
//                   Login
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="hidden md:grid grid-cols-2 gap-4">
//           <img
//             src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
//             className="rounded-3xl object-cover h-64"
//           />
//           <img
//             src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
//             className="rounded-3xl object-cover h-64 mt-10"
//           />
//         </div>

//       </div>
//     </section>
//   );
// }



"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import coupleImage from "@/app/assets/couple_image.png";
export default function Hero() {
  const { isLoggedIn } = useAuth();

  const [scrollY, setScrollY] = useState(0);

  /* ---------------- SLIDER DATA ---------------- */
  const values = [
    "Personality-based compatibility",
    "No fake profiles, no spam",
    "Designed for serious relationships",
    "Privacy-first & secure platform"
  ];

  const testimonials = [
    "“We matched on ZixChat and instantly felt understood.”",
    "“The compatibility quiz actually works. We’re engaged!”",
    "“Finally a dating app for people who want something real.”"
  ];

  const [valueIndex, setValueIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const v = setInterval(
      () => setValueIndex(i => (i + 1) % values.length),
      4000
    );
    const t = setInterval(
      () =>
        setTestimonialIndex(i => (i + 1) % testimonials.length),
      5000
    );
    return () => {
      clearInterval(v);
      clearInterval(t);
    };
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="fixed top-0 left-0 right-0 h-screen text-white overflow-hidden z-0">

      {/* BACKGROUND IMAGE */}
      <div
        className="
          absolute inset-0
          bg-cover
          bg-no-repeat
          bg-[position:center_top]
          md:bg-[position:center]
        "
        style={{
          backgroundImage:
            `url(${coupleImage.src})`
        }}
      />

      {/* BRAND OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/1 via-purple-1/1 to-black/1" />

      {/* SOFT GLOWS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-400 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-30" />

      <div className="relative h-full max-w-6xl mx-auto px-6 flex items-center pt-24 pb-16" style={{ transform: `translateY(${-scrollY * 0.5}px)` }}>
        <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center gap-8" style={{ transform: `translateY(${-scrollY * 0.3}px)` }}>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-pink-200/80">Meaningful connections</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
              Get someone
              <span className="block text-pink-200">who truly gets you</span>
            </h1>
            
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/matches"
                className="px-8 py-4 bg-white text-pink-600 rounded-full font-semibold shadow-xl shadow-pink-500/30 hover:-translate-y-0.5 transition transform"
              >
                View Matches
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white text-pink-600 rounded-full font-semibold shadow-xl shadow-pink-500/30 hover:-translate-y-0.5 transition transform"
                >
                  Start Free Today
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 border border-white/70 text-white rounded-full font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>

        

          {/* ✅ VALUE SLIDER (ADDED) */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={valueIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-lg sm:text-xl font-semibold text-white"
              >
                {values[valueIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ✅ TESTIMONIAL SLIDER (ADDED) */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-5 max-w-xl w-full">
            <AnimatePresence mode="wait">
              <motion.p
                key={testimonialIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-sm sm:text-base text-pink-100"
              >
                {testimonials[testimonialIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
