// export default function HowItWorks() {
//   const steps = [
//     {
//       title: "Create Your Profile",
//       desc: "Tell us about yourself and what you’re looking for."
//     },
//     {
//       title: "Answer the Quiz",
//       desc: "Our personality quiz helps us understand you deeply."
//     },
//     {
//       title: "Get Matches",
//       desc: "See people you’re genuinely compatible with."
//     }
//   ];

//   return (
//     <section className="py-20 bg-gray-50">
//       <h2 className="text-3xl font-bold text-center">
//         How ZixChat Works
//       </h2>

//       <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
//         {steps.map((step, i) => (
//           <div
//             key={i}
//             className="bg-white p-6 rounded shadow text-center"
//           >
//             <div className="text-3xl font-bold mb-4">{i + 1}</div>
//             <h3 className="font-semibold text-xl">{step.title}</h3>
//             <p className="mt-2 text-gray-600">{step.desc}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }





export default function HowItWorks() {
  const steps = [
    {
      title: "Create Your Profile",
      desc: "Tell us about yourself, your values, and what matters most to you.",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
    },
    {
      title: "Answer the Compatibility Quiz",
      desc: "Our quiz understands your personality, habits, and relationship goals.",
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
    },
    {
      title: "Meet Compatible Matches",
      desc: "Get matched with people who align with you emotionally and mentally.",
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
    }
  ];

  return (
    <section className="py-30 bg-blue-100">
      <h2 className="text-4xl font-bold text-center text-gray-800">
        How ZixChat Works
      </h2>

      <div className="mt-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
        {steps.map((step, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <img src={step.img} className="h-48 w-full object-cover" />
            <div className="p-8 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-gray-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
