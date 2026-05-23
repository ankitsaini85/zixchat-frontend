import Link from "next/link";

type MatchProps = {
  match: {
    userId: string;
    name: string;
    photo?: string | null;
    compatibility: number;
  };
};

export default function MatchCard({ match }: MatchProps) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-fuchsia-500/20 hover:bg-white/10 hover:-translate-y-1 transition-all">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Profile Photo */}
        {match.photo ? (
          <img
            src={match.photo}
            alt={match.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-400/40"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 border border-purple-400/40 flex items-center justify-center text-lg font-semibold text-white">
            {match.name.charAt(0)}
          </div>
        )}

        {/* Name + Match % */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{match.name}</h3>
          <span
            className={`inline-block mt-1 px-3 py-1 text-sm rounded-full font-medium border ${
              match.compatibility >= 80
                ? "bg-green-500/30 text-green-200 border-green-400/40"
                : match.compatibility >= 60
                ? "bg-yellow-500/30 text-yellow-200 border-yellow-400/40"
                : "bg-slate-500/30 text-slate-200 border-slate-400/40"
            }`}
          >
            {match.compatibility}% Match
          </span>
        </div>
      </div>

      {/* Compatibility Bar */}
      <div className="mb-6">
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full shadow-sm shadow-fuchsia-500/50"
            style={{ width: `${match.compatibility}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/profile/${match.userId}`}
        className="block w-full text-center border-2 border-white/20 rounded-xl py-2 hover:bg-gradient-to-r hover:from-purple-500 hover:to-fuchsia-500 hover:border-transparent text-white font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fuchsia-500/25"
      >
        View Profile
      </Link>
      
    </div>
  );
}
