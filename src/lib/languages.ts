export const languages = [
  { code: "en", name: "English", native: "English", speech: "en-IN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", speech: "hi-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", speech: "bn-IN" },
  { code: "te", name: "Telugu", native: "తెలుగు", speech: "te-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", speech: "mr-IN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", speech: "ta-IN" },
  { code: "ur", name: "Urdu", native: "اردو", speech: "ur-IN" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", speech: "gu-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", speech: "kn-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", speech: "ml-IN" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", speech: "or-IN" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", speech: "pa-IN" },
  { code: "as", name: "Assamese", native: "অসমীয়া", speech: "as-IN" },
  { code: "ne", name: "Nepali", native: "नेपाली", speech: "ne-NP" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्", speech: "sa-IN" },
] as const;
export type Language = (typeof languages)[number]["code"];
export const languageName = (code: string) =>
  languages.find((l) => l.code === code)?.name || "English";
