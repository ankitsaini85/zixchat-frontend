"use client";
import { useAuth } from "@/context/AuthContext";
import { saveAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const orientationOptions = [
  { label: "Straight", value: "straight", blurb: "Attracted to a different gender. Celebrate classic chemistry." },
  { label: "Gay", value: "gay", blurb: "Attracted to the same gender. Here for honest connections." },
  { label: "Lesbian", value: "lesbian", blurb: "Women loving women. Looking for real vibes." },
  { label: "Bisexual", value: "bisexual", blurb: "Attracted to more than one gender. Open to possibilities." },
  { label: "Asexual", value: "asexual", blurb: "Little or no sexual attraction. Emotional bonds matter most." },
  { label: "Demisexual", value: "demisexual", blurb: "Attraction grows after deep trust. Slow and meaningful." },
  { label: "Pansexual", value: "pansexual", blurb: "Attraction beyond gender. People over labels." },
  { label: "Queer", value: "queer", blurb: "Fluid and self-defined. Connection over categories." },
  { label: "Bi-curious", value: "bicurious", blurb: "Exploring attraction to multiple genders." },
  { label: "Aromantic", value: "aromantic", blurb: "Little or no romantic attraction. Prefers other bonds." },
  { label: "Not listed", value: "not_listed", blurb: "Something else fits you better. You decide." }
];

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

const lifestyleOptions = {
  drinking: ["Never", "Occasionally", "Socially", "Often"],
  smoking: ["Never", "Sometimes", "Often"],
  exercise: ["Hardly", "1-2x/week", "3-4x/week", "Daily"],
  pets: ["No pets", "Dog person", "Cat person", "Many pets"]
};

const relationshipOptions = [
  "Long-term",
  "Short-term",
  "Fun",
  "Friendship",
  "Exploring",
  "Not sure yet"
];

const interestedOptions = [
  { value: "female", label: "Women" },
  { value: "male", label: "Men" },
  { value: "everyone", label: "Everyone" }
];

type Coords = { lat: number; lng: number };

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [humanCheck, setHumanCheck] = useState({ running: false, done: false });
  const [coords, setCoords] = useState<Coords | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [citySearchLoading, setCitySearchLoading] = useState(false);

  const [form, setForm] = useState({
    countryCode: "+91",
    phone: "",
    email: "",
    password: "",
    termsAccepted: false,
    name: "",
    dob: "",
    gender: "",
    sexualOrientation: "",
    interestedIn: "",
    relationshipIntent: "",
    distanceKm: 25,
    city: "",
    school: "",
    drinking: "",
    smoking: "",
    exercise: "",
    pets: "",
    identity: "",
    interests: [] as string[],
    bio: ""
  });

  const steps = useMemo(
    () => [
      { id: "phone", title: "What's your mobile?" },
      { id: "email", title: "Add your email" },
      { id: "terms", title: "Terms & conditions" },
      { id: "human", title: "Let's verify you" },
      { id: "name", title: "Your name" },
      { id: "dob", title: "Date of birth" },
      { id: "gender", title: "Gender" },
      { id: "orientation", title: "Sexual orientation" },
      { id: "interest", title: "Who do you want to see?" },
      { id: "intent", title: "What are you looking for?" },
      { id: "distance", title: "Distance & location" },
      { id: "school", title: "School (optional)" },
      { id: "lifestyle", title: "Lifestyle" },
      { id: "identity", title: "What else makes you, you?" },
      { id: "interests", title: "What are you into?" },
      { id: "photo", title: "Add a photo" },
      { id: "about", title: "Share more" }
    ],
    []
  );

  const progress = Math.round(((step + 1) / steps.length) * 100);

  const toggleInterest = (interest: string) => {
    setForm((prev) => {
      const exists = prev.interests.includes(interest);
      const interests = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const goNext = () => {
    setError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const startHumanCheck = () => {
    setHumanCheck({ running: true, done: false });
    setTimeout(() => {
      setHumanCheck({ running: false, done: true });
      goNext();
    }, 3000);
  };

  const handleNameNext = () => {
    if (!form.name.trim()) {
      setError("Please enter your name");
      return;
    }
    setWelcomeVisible(true);
    setTimeout(() => {
      setWelcomeVisible(false);
      goNext();
    }, 4000);
  };

  const requestLocation = () => {
    setCitySearchLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCitySearchLoading(false);
      },
      () => {
        setCitySearchLoading(false);
        setError("Location permission denied. Enter your city instead.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const buildBio = () => {
    const parts = [] as string[];
    if (form.identity) parts.push(form.identity);
    if (form.interests.length) parts.push(`Into: ${form.interests.join(", ")}`);
    if (form.school) parts.push(`School: ${form.school}`);
    if (form.drinking || form.smoking || form.exercise || form.pets) {
      const life = [
        form.drinking && `Drinks: ${form.drinking}`,
        form.smoking && `Smokes: ${form.smoking}`,
        form.exercise && `Exercise: ${form.exercise}`,
        form.pets && `Pets: ${form.pets}`
      ].filter(Boolean);
      parts.push(life.join(" | "));
    }
    if (form.bio) parts.push(form.bio);
    return parts.filter(Boolean).join(" • ");
  };

  const uploadPhoto = async (token: string) => {
    if (!photoFile) return null;
    const formData = new FormData();
    formData.append("photo", photoFile);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/photo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.photo as string;
  };

  const saveProfileDetails = async (token: string) => {
    const payload = {
      bio: buildBio(),
      gender: form.gender,
      lookingFor: form.interestedIn || "everyone",
      sexualOrientation: form.sexualOrientation || undefined,
      relationshipIntent: form.relationshipIntent || undefined,
      distancePreferenceKm: form.distanceKm,
      school: form.school || undefined,
      drinking: form.drinking || undefined,
      smoking: form.smoking || undefined,
      exercise: form.exercise || undefined,
      pets: form.pets || undefined,
      identity: form.identity || undefined,
      interests: form.interests,
      dob: form.dob || undefined,
      phone: `${form.countryCode} ${form.phone}`,
      city: form.city || undefined,
      profileCompleted: true
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.phone.trim()) return setError("Please add your mobile number");
    if (!form.email.trim()) return setError("Please add your email");
    if (!form.password.trim()) return setError("Please set a password");
    if (!form.termsAccepted) return setError("Please agree to the terms");
    if (!form.name.trim()) return setError("Name is required");
    if (!form.dob) return setError("Please add your date of birth");
    if (!form.gender) return setError("Select your gender");
    if (!form.interestedIn) return setError("Tell us who you want to see");
    if (!form.relationshipIntent) return setError("Tell us what you are looking for");
    if (!coords && !form.city.trim()) return setError("Share your city or enable location");
    if (!photoFile) return setError("Please add a photo");

    setLoading(true);

    try {
      const signupRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: `${form.countryCode} ${form.phone}`,
            lat: coords?.lat,
            lng: coords?.lng,
            city: form.city || undefined,
            dob: form.dob || undefined,
            gender: form.gender || undefined,
            sexualOrientation: form.sexualOrientation || undefined,
            interestedIn: form.interestedIn || undefined,
            relationshipIntent: form.relationshipIntent || undefined,
            distanceKm: form.distanceKm,
            school: form.school || undefined,
            drinking: form.drinking || undefined,
            smoking: form.smoking || undefined,
            exercise: form.exercise || undefined,
            pets: form.pets || undefined,
            identity: form.identity || undefined,
            interests: form.interests,
            bio: form.bio || undefined
          })
        }
      );

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.message || "Signup failed");
        setLoading(false);
        return;
      }

      const token = signupData.token as string;
      let user = signupData.user;

      const uploadedPhoto = await uploadPhoto(token);
      const updatedProfile = await saveProfileDetails(token);

      user = {
        ...user,
        photo: uploadedPhoto || user.photo,
        bio: updatedProfile?.bio || user.bio,
        gender: updatedProfile?.gender || form.gender,
        lookingFor: updatedProfile?.lookingFor || form.interestedIn,
        sexualOrientation: updatedProfile?.sexualOrientation || form.sexualOrientation,
        relationshipIntent: updatedProfile?.relationshipIntent || form.relationshipIntent,
        distancePreferenceKm: updatedProfile?.distancePreferenceKm || form.distanceKm,
        school: updatedProfile?.school || form.school,
        drinking: updatedProfile?.drinking || form.drinking,
        smoking: updatedProfile?.smoking || form.smoking,
        exercise: updatedProfile?.exercise || form.exercise,
        pets: updatedProfile?.pets || form.pets,
        identity: updatedProfile?.identity || form.identity,
        interests: updatedProfile?.interests || form.interests,
        phone: updatedProfile?.phone || `${form.countryCode} ${form.phone}`,
        dob: updatedProfile?.dob || form.dob,
        city: updatedProfile?.city || form.city,
        quizCompleted: true,
        profileCompleted: true
      };

      saveAuth(token, user);
      login();
      router.push("/matches");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const current = steps[step].id;

    switch (current) {
      case "phone":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">Mobile number</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="w-full sm:w-32 bg-white/5 border border-white/15 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
                value={form.countryCode}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+971">🇦🇪 +971</option>
              </select>
              <input
                className="flex-1 bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
                placeholder="Enter mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">Email</label>
            <input
              className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <label className="block text-sm font-semibold text-slate-200">Password</label>
            <input
              className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="text-xs text-slate-300">You will use this password to log in.</p>
          </div>
        );

      case "terms":
        return (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-200 space-y-2">
              <p>By continuing you agree to:</p>
              <ul className="list-disc ml-5 space-y-1 text-slate-300">
                <li>Our Terms of Service and Privacy Policy.</li>
                <li>Receiving account updates on your phone and email.</li>
                <li>Respecting community guidelines and staying kind.</li>
              </ul>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                className="h-4 w-4 accent-purple-500"
              />
              I agree and want to continue
            </label>
          </div>
        );

      case "human":
        return (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-white">Let's verify you are human</p>
            <p className="text-sm text-slate-300">A quick 3-second check keeps bots away.</p>
            {humanCheck.running && <div className="text-sm text-slate-300">Almost there...</div>}
            {humanCheck.done && <div className="text-green-300 text-sm">All good! Moving on.</div>}
          </div>
        );

      case "name":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">What should we call you?</label>
            <input
              className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        );

      case "dob":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Date of birth</label>
            <input
              type="date"
              className="w-full border rounded-lg p-3"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </div>
        );

      case "gender":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">Select gender</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["male", "female", "other"].map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`p-3 rounded-lg border transition ${form.gender === g ? "border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20" : "border-white/15 bg-white/5 text-white hover:border-white/30"}`}
                  type="button"
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );

      case "orientation":
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">You can skip this if you want.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {orientationOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, sexualOrientation: opt.value })}
                  className={`text-left p-4 rounded-xl border transition ${
                    form.sexualOrientation === opt.value
                      ? "border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20"
                      : "border-white/15 bg-white/5 text-white hover:border-white/30"
                  }`}
                >
                  <div className="font-semibold text-white">{opt.label}</div>
                  <div className="text-xs text-slate-300 leading-5">{opt.blurb}</div>
                </button>
              ))}
            </div>
            <button type="button" className="text-sm text-slate-300 underline" onClick={goNext}>Skip this step</button>
          </div>
        );

      case "interest":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">Who are you interested in seeing?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {interestedOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, interestedIn: opt.value })}
                  className={`p-3 rounded-lg border transition ${
                    form.interestedIn === opt.value
                      ? "border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20"
                      : "border-white/15 bg-white/5 text-white hover:border-white/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );

      case "intent":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">What are you looking for?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relationshipOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, relationshipIntent: opt })}
                  className={`p-3 rounded-lg border transition ${
                    form.relationshipIntent === opt
                      ? "border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20"
                      : "border-white/15 bg-white/5 text-white hover:border-white/30"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case "distance":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">Your distance preference ({form.distanceKm} km)</label>
            <input
              type="range"
              min={5}
              max={100}
              value={form.distanceKm}
              onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })}
              className="w-full accent-purple-400"
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">Share your city</label>
              <input
                className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
                placeholder="Enter city (needed to find matches)"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <button
                type="button"
                onClick={requestLocation}
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-fuchsia-500/30 hover:-translate-y-0.5 transition"
                disabled={citySearchLoading}
              >
                {citySearchLoading ? "Getting location..." : "Use my current location"}
              </button>
              {coords && (
                <p className="text-xs text-green-300">Location captured ✔️</p>
              )}
            </div>
          </div>
        );

      case "school":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200">If studying is your thing...</label>
            <input
              className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
              placeholder="School or past school (optional)"
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
            />
            <button type="button" className="text-sm text-slate-300 underline" onClick={goNext}>Skip this step</button>
          </div>
        );

      case "lifestyle":
        return (
          <div className="space-y-5">
            {(
              [
                { key: "drinking", label: "How often do you drink?" },
                { key: "smoking", label: "How often do you smoke?" },
                { key: "exercise", label: "Do you exercise?" },
                { key: "pets", label: "Do you have any pets?" }
              ] as const
            ).map((item) => (
              <div key={item.key}>
                <p className="text-sm font-semibold text-slate-200 mb-2">{item.label}</p>
                <div className="flex flex-wrap gap-2">
                  {lifestyleOptions[item.key].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm({ ...form, [item.key]: opt })}
                      className={`px-3 py-2 rounded-full border text-sm transition ${
                        (form as any)[item.key] === opt
                          ? "border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20"
                          : "border-white/15 bg-white/5 text-white hover:border-white/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" className="text-sm text-slate-300 underline" onClick={goNext}>Skip this step</button>
          </div>
        );

      case "identity":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200">What else makes you, you?</label>
            <textarea
              className="w-full bg-white/5 border border-white/15 rounded-lg p-3 min-h-[100px] text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition"
              placeholder="Add anything unique (optional)"
              value={form.identity}
              onChange={(e) => setForm({ ...form, identity: e.target.value })}
            />
            <button type="button" className="text-sm text-slate-300 underline" onClick={goNext}>Skip this step</button>
          </div>
        );

      case "interests":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200">What are you into?</label>
            <div className="flex flex-wrap gap-2">
              {interestLibrary.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-2 rounded-full border text-sm ${
                    form.interests.includes(interest) ? "border-purple-600 bg-purple-50" : "border-gray-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <button type="button" className="text-sm text-gray-600 underline" onClick={goNext}>Skip this step</button>
          </div>
        );

      case "photo":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Add a photo (mandatory)</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-purple-50 border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-purple-500">No photo</span>
                )}
              </div>
              <label className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer text-sm font-semibold">
                Choose photo
                <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
              </label>
            </div>
            {!photoFile && <p className="text-xs text-red-600">Photo is required to continue.</p>}
          </div>
        );

      case "about":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200">Share more about yourself (optional)</label>
            <textarea
              className="w-full bg-white/5 border border-white/15 rounded-lg p-3 min-h-[120px] text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
              placeholder="Anything else before we start matching?"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepId = steps[step].id;
  const isLastStep = step === steps.length - 1;
  const isNameStep = currentStepId === "name";
  const isHumanStep = currentStepId === "human";
  const primaryActionLabel = isHumanStep
    ? humanCheck.done
      ? "Continue"
      : humanCheck.running
        ? "Verifying..."
        : "Start 3s check"
    : isLastStep
      ? "Create my account"
      : "Next";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1022] via-[#10172f] to-[#180f2f] text-white flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 text-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/25 p-4 sm:p-6 md:p-10 relative overflow-hidden backdrop-blur">
        <div className="relative z-10">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex-1">
              <p className="text-xs text-slate-300 uppercase tracking-wide">ZixChat Register</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Let's set up your profile</h1>
            </div>
            <Link href="/login" className="text-sm text-pink-200 font-semibold hover:text-pink-100 whitespace-nowrap">Already have an account?</Link>
          </header>

          <div className="mb-7 sm:mb-9">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="truncate">{steps[step].title}</span>
              <span className="ml-2 text-right">{step + 1} / {steps.length}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-inner shadow-purple-500/10 min-h-[220px] sm:min-h-[260px]">
            {error && (
              <div className="mb-4 text-xs sm:text-sm text-red-100 bg-red-500/10 border border-red-400/60 rounded-lg p-3">
                {error}
              </div>
            )}
            {renderStep()}
          </div>

          <div className="mt-4 sm:mt-6 flex items-center justify-between gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || loading}
              className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-white/20 text-white disabled:opacity-50 text-sm sm:text-base font-medium"
            >
              Back
            </button>

            {isNameStep ? (
              <button
                type="button"
                onClick={handleNameNext}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg text-sm sm:text-base"
                disabled={loading}
              >
                {primaryActionLabel}
              </button>
            ) : isHumanStep ? (
              <button
                type="button"
                onClick={humanCheck.done ? goNext : startHumanCheck}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg disabled:opacity-60 text-sm sm:text-base"
                disabled={loading || humanCheck.running}
              >
                {primaryActionLabel}
              </button>
            ) : isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg disabled:opacity-60 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? "Creating..." : primaryActionLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg text-sm sm:text-base"
                disabled={loading}
              >
                {primaryActionLabel}
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4">Progress saves step by step. Skipping still moves you forward.</p>
        </div>

        {welcomeVisible && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 p-4">
            <div className="bg-white rounded-2xl p-6 text-center w-72 shadow-2xl animate-bounce">
              <p className="text-sm text-gray-500 mb-1">Welcome</p>
              <p className="text-lg sm:text-xl font-bold text-purple-700">Hey {form.name || "there"}, welcome to ZixChat!</p>
              <p className="text-xs text-gray-500 mt-2">Loading your next step...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
