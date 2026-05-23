// import Link from "next/link";

// export default function CTA() {
//   return (
//     <section className="py-20 bg-black text-white text-center">
//       <h2 className="text-3xl font-bold">
//         Ready to find something real?
//       </h2>

//       <p className="mt-4 text-gray-300">
//         Join ZixChat today and meet people who truly match you.
//       </p>

//       <Link
//         href="/signup"
//         className="inline-block mt-6 px-8 py-3 bg-white text-black rounded"
//       >
//         Create Free Account
//       </Link>
//     </section>
//   );
// }




import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-28 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center">
      <h2 className="text-4xl font-bold">
        Ready to find something real?
      </h2>

      <p className="mt-6 text-pink-100 max-w-xl mx-auto">
        Join ZixChat today and meet people who truly match you —
        emotionally, mentally, and intentionally.
      </p>

      <Link
        href="/signup"
        className="inline-block mt-10 px-12 py-4 bg-white text-pink-600 rounded-full font-semibold"
      >
        Create Free Account
      </Link>
    </section>
  );
}
