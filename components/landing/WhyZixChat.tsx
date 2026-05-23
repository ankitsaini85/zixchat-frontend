// export default function WhyZixChat() {
//   const points = [
//     "Personality-based compatibility",
//     "No meaningless swiping",
//     "Privacy-focused design",
//     "Built for serious relationships"
//   ];

//   return (
//     <section className="py-20">
//       <h2 className="text-3xl font-bold text-center">
//         Why Choose ZixChat?
//       </h2>

//       <div className="mt-10 max-w-3xl mx-auto grid gap-4 px-6">
//         {points.map((point, i) => (
//           <div
//             key={i}
//             className="flex items-center gap-3"
//           >
//             <span className="text-green-600 text-xl">✔</span>
//             <p className="text-lg">{point}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }



export default function WhyZixChat() {
  const points = [
    "No meaningless swiping",
    "Personality-first matching",
    "Verified & moderated users",
    "Privacy-focused platform",
    "Built for long-term relationships"
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-pink-400 to-white">
      <h2 className="text-4xl font-bold text-center">
        Why Choose ZixChat?
      </h2>

      <div className="mt-12 max-w-4xl mx-auto space-y-4 px-6">
        {points.map((p, i) => (
          <div key={i} className="flex gap-4 bg-white p-6 rounded-xl shadow">
            <span className="text-pink-500 text-2xl">✔</span>
            <p className="text-lg text-gray-700">{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

