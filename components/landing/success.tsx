export default function SuccessStories() {
  const stories = [
    {
      img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
      text: "We matched on ZixChat and felt connected instantly."
    },
    {
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
      text: "The quiz actually worked — we’re engaged now!"
    },
    {
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      text: "Finally a platform for serious relationships."
    }
  ];

  return (
    <section className="py-30 bg-purple-300">
      <h2 className="text-4xl font-bold text-center">
        Real People. Real Love.
      </h2>

      <div className="mt-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
        {stories.map((s, i) => (
          <div key={i} className="bg-pink-200 rounded-3xl shadow overflow-hidden">
            <img src={s.img} className="h-56 w-full object-cover" />
            <p className="p-6 text-black-600 text-center">
              “{s.text}”
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
