export default function Compatibility() {
  return (
    <section className="py-30 bg-pink-100">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 px-6 items-center">

        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-full border-8 border-pink-500 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold text-pink-500">97%</p>
              <p className="text-gray-600 mt-2">Compatibility Score</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-gray-800">
            Compatibility Counts
          </h2>
          <p className="mt-6 text-gray-600">
            We match you using personality traits, communication styles,
            values, habits, and long-term intentions.
          </p>

          <div className="mt-8 space-y-4">
            <Progress label="Personality" value="90%" />
            <Progress label="Values" value="85%" />
            <Progress label="Lifestyle" value="80%" />
          </div>
        </div>

      </div>
    </section>
  );
}

function Progress({ label, value }: any) {
  return (
    <div>
      <p className="text-sm mb-1">{label}</p>
      <div className="h-3 bg-pink-100 rounded-full">
        <div
          className="h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}
