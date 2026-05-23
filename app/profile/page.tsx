"use client";

import { useEffect, useState } from "react";
import { getToken, getUser, saveUser } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const orientationOptions = [
  { label: "Straight", value: "straight" },
  { label: "Gay", value: "gay" },
  { label: "Lesbian", value: "lesbian" },
  { label: "Bisexual", value: "bisexual" },
  { label: "Asexual", value: "asexual" },
  { label: "Demisexual", value: "demisexual" },
  { label: "Pansexual", value: "pansexual" },
  { label: "Queer", value: "queer" },
  { label: "Bi-curious", value: "bicurious" },
  { label: "Aromantic", value: "aromantic" },
  { label: "Not listed", value: "not_listed" }
];

const relationshipOptions = [
  "Long-term",
  "Short-term",
  "Fun",
  "Friendship",
  "Exploring",
  "Not sure yet"
];

const lifestyleOptions = {
  drinking: ["Never", "Occasionally", "Socially", "Often"],
  smoking: ["Never", "Sometimes", "Often"],
  exercise: ["Hardly", "1-2x/week", "3-4x/week", "Daily"],
  pets: ["No pets", "Dog person", "Cat person", "Many pets"]
};

const interestLibrary = [
  "Art & Design",
  "Live Music",
  "Street Food",
  "Photography",
  "Coding",
  "Gaming",
  "Travel",
  "Hiking",
  "Podcasts",
  "Writing",
  "Movies",
  "Dancing",
  "Yoga",
  "Cooking",
  "Startups"
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({
    bio: "",
    gender: "",
    lookingFor: "",
    sexualOrientation: "",
    relationshipIntent: "",
    distancePreferenceKm: 25,
    city: "",
    school: "",
    drinking: "",
    smoking: "",
    exercise: "",
    pets: "",
    identity: "",
    interests: [] as string[],
    dob: "",
    phone: ""
  });

  const [photo, setPhoto] = useState<File | null>(null);

  const toggleInterest = (interest: string) => {
    setForm(prev => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setForm({
          bio: data.bio || "",
          gender: data.gender || "",
          lookingFor: data.lookingFor || "",
          sexualOrientation: data.sexualOrientation || "",
          relationshipIntent: data.relationshipIntent || "",
          distancePreferenceKm: data.distancePreferenceKm || 25,
          city: data.city || "",
          school: data.school || "",
          drinking: data.drinking || "",
          smoking: data.smoking || "",
          exercise: data.exercise || "",
          pets: data.pets || "",
          identity: data.identity || "",
          interests: data.interests || [],
          dob: data.dob ? data.dob.slice(0, 10) : "",
          phone: data.phone || ""
        });
      });
  }, []);

  /* ================= PHOTO UPLOAD ================= */
  const uploadPhoto = async () => {
    if (!photo) return;

    const formData = new FormData();
    formData.append("photo", photo);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/photo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      }
    );
    
    const photoData = await res.json();
    return photoData;
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    setLoading(true);

    try {
      let photoUrl = user.photo;
      
      if (photo) {
        const photoData = await uploadPhoto();
        photoUrl = photoData.photo;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            ...form,
            distancePreferenceKm: Number(form.distancePreferenceKm) || 25
          })
        }
      );

      const updatedUser = await res.json();
      
      // Update with photo URL if it was uploaded
      if (photoUrl) {
        updatedUser.photo = photoUrl;
      }
      
      setUser(updatedUser);
      saveUser(updatedUser); // update localStorage
      refreshUser(); // refresh navbar user
      setEdit(false);
      setPhoto(null);
    } catch {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="relative min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] text-white flex items-center justify-center overflow-hidden">
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-300 font-medium">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] text-white overflow-hidden py-8 px-4">
        {/* Ambient Background Blurs */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-semibold">👤 Profile</p>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">Manage your personal information and preferences</p>
          </div>

          {/* Profile Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl shadow-fuchsia-500/10 overflow-hidden">
            {/* Cover Background */}
            <div className="h-32 bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-purple-600/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            </div>

            {/* Profile Content */}
            <div className="px-6 sm:px-8 pb-8">
              {/* PHOTO */}
              <div className="flex flex-col items-center -mt-16 mb-6">
                <div className="relative group">
                  <img
                    src={user.photo || "https://i.pravatar.cc/150"}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl ring-2 ring-purple-400/40 group-hover:ring-purple-400/80 transition-all duration-300"
                    alt={user.name}
                  />
                  {edit && photo && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg animate-bounce">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {edit && (
                  <div className="mt-4 w-full max-w-xs animate-fadeIn">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-lg shadow-fuchsia-500/25 border border-white/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-semibold">Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => setPhoto(e.target.files?.[0] || null)}
                      />
                    </label>
                    {photo && <p className="text-xs text-emerald-400 mt-2 text-center">✓ New photo selected</p>}
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="space-y-6">
                {/* Name & Email */}
                <div className="text-center pb-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-slate-400 mt-1">{user.email}</p>
                </div>

                {/* BIO */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <svg className="w-5 h-5 inline mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    About Me
                  </label>
                  {edit ? (
                    <textarea
                      value={form.bio}
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                      className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      rows={4}
                      placeholder="Tell others about yourself..."
                    />
                  ) : (
                    <p className="text-slate-200 bg-white/5 p-4 rounded-lg border border-white/10">
                      {user.bio || <span className="text-slate-500 italic">No bio added yet</span>}
                    </p>
                  )}
                </div>

                {/* Basics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
                    {edit ? (
                      <input
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Phone number"
                      />
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                        {user.phone || <span className="text-slate-500 italic">Not added</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Date of birth</label>
                    {edit ? (
                      <input
                        type="date"
                        value={form.dob}
                        onChange={e => setForm({ ...form, dob: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                        {user.dob ? new Date(user.dob).toLocaleDateString() : <span className="text-slate-500 italic">Not added</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">City</label>
                    {edit ? (
                      <input
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Your city"
                      />
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10 capitalize">
                        {user.city || <span className="text-slate-500 italic">Not added</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Gender</label>
                    {edit ? (
                      <select
                        value={form.gender}
                        onChange={e => setForm({ ...form, gender: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-slate-800">Select gender</option>
                        <option value="male" className="bg-slate-800">Male</option>
                        <option value="female" className="bg-slate-800">Female</option>
                        <option value="other" className="bg-slate-800">Other</option>
                      </select>
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10 capitalize">
                        {user.gender || <span className="text-slate-500 italic">Not specified</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Looking For</label>
                    {edit ? (
                      <select
                        value={form.lookingFor}
                        onChange={e => setForm({ ...form, lookingFor: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-slate-800">Looking for</option>
                        <option value="male" className="bg-slate-800">Men</option>
                        <option value="female" className="bg-slate-800">Women</option>
                        <option value="everyone" className="bg-slate-800">Everyone</option>
                      </select>
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10 capitalize">
                        {user.lookingFor || <span className="text-slate-500 italic">Not specified</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Sexual orientation</label>
                    {edit ? (
                      <select
                        value={form.sexualOrientation}
                        onChange={e => setForm({ ...form, sexualOrientation: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-slate-800">Select</option>
                        {orientationOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                        {user.sexualOrientation || <span className="text-slate-500 italic">Not specified</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Relationship intent</label>
                    {edit ? (
                      <select
                        value={form.relationshipIntent}
                        onChange={e => setForm({ ...form, relationshipIntent: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-slate-800">Select</option>
                        {relationshipOptions.map(opt => (
                          <option key={opt} value={opt} className="bg-slate-800">{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                        {user.relationshipIntent || <span className="text-slate-500 italic">Not specified</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Distance preference ({form.distancePreferenceKm} km)</label>
                    {edit ? (
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={form.distancePreferenceKm}
                        onChange={e => setForm({ ...form, distancePreferenceKm: Number(e.target.value) })}
                        className="w-full accent-purple-500"
                      />
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">{user.distancePreferenceKm || 25} km</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">School</label>
                    {edit ? (
                      <input
                        value={form.school}
                        onChange={e => setForm({ ...form, school: e.target.value })}
                        className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="School or college"
                      />
                    ) : (
                      <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                        {user.school || <span className="text-slate-500 italic">Not added</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lifestyle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {([
                    { key: "drinking", label: "How often do you drink?" },
                    { key: "smoking", label: "How often do you smoke?" },
                    { key: "exercise", label: "Do you exercise?" },
                    { key: "pets", label: "Do you have any pets?" }
                  ] as const).map(item => (
                    <div key={item.key}>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">{item.label}</label>
                      {edit ? (
                        <div className="flex flex-wrap gap-2">
                          {lifestyleOptions[item.key].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setForm({ ...form, [item.key]: opt })}
                              className={`px-3 py-2 rounded-full border text-sm transition-all ${
                                (form as any)[item.key] === opt ? "border-purple-400 bg-purple-500/30 text-white" : "border-white/20 bg-white/5 text-slate-300 hover:border-purple-400/50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                          {(user as any)[item.key] || <span className="text-slate-500 italic">Not set</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Identity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">What else makes you, you?</label>
                  {edit ? (
                    <textarea
                      value={form.identity}
                      onChange={e => setForm({ ...form, identity: e.target.value })}
                      className="w-full border border-white/10 rounded-lg p-3 bg-white/5 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      rows={3}
                      placeholder="Add anything unique"
                    />
                  ) : (
                    <p className="text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                      {user.identity || <span className="text-slate-500 italic">Not added</span>}
                    </p>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">What are you into?</label>
                  {edit ? (
                    <div className="flex flex-wrap gap-2">
                      {interestLibrary.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-2 rounded-full border text-sm transition-all ${
                            form.interests.includes(interest) ? "border-purple-400 bg-purple-500/30 text-white" : "border-white/20 bg-white/5 text-slate-300 hover:border-purple-400/50"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  ) : form.interests.length ? (
                    <div className="flex flex-wrap gap-2">
                      {form.interests.map(i => (
                        <span key={i} className="px-3 py-1 bg-purple-500/30 text-purple-200 text-sm rounded-full border border-purple-400/40">{i}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No interests added</p>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                {edit ? (
                  <>
                    <button
                      onClick={saveProfile}
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEdit(false);
                        setPhoto(null);
                        setForm({
                          bio: user.bio || "",
                          gender: user.gender || "",
                          lookingFor: user.lookingFor || "",
                          sexualOrientation: user.sexualOrientation || "",
                          relationshipIntent: user.relationshipIntent || "",
                          distancePreferenceKm: user.distancePreferenceKm || 25,
                          city: user.city || "",
                          school: user.school || "",
                          drinking: user.drinking || "",
                          smoking: user.smoking || "",
                          exercise: user.exercise || "",
                          pets: user.pets || "",
                          identity: user.identity || "",
                          interests: user.interests || [],
                          dob: user.dob ? user.dob.slice(0, 10) : "",
                          phone: user.phone || ""
                        });
                      }}
                      className="px-8 py-3 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEdit(true)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:-translate-y-0.5 text-white font-semibold rounded-xl transition-all shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
