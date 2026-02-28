"use client";

;
import { create } from "zustand";
import { Palette, Check, Search, X } from "lucide-react";

import DashboardPageHeader from "@/Components/DashboardPageHeader";

// Zustand Store
 export const  useThemeStore = create((set) => ({
  theme: "",
  searchQuery: "",
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("app-theme", theme);
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
 
   
  
}));

export default function ThemeSwitcherPage() {
  const { theme, searchQuery, setTheme} = useThemeStore();

  const themes = [
    { name: "light", desc: "Clean & minimal", colors: ["#FFFFFF", "#F3F4F6", "#E5E7EB"] },
    { name: "dark", desc: "Easy on eyes", colors: ["#1F2937", "#374151", "#4B5563"] },
    { name: "corporate", desc: "Professional", colors: ["#3B82F6", "#2563EB", "#1D4ED8"] },
    { name: "emerald", desc: "Fresh green", colors: ["#10B981", "#059669", "#047857"] },
    { name: "cupcake", desc: "Sweet pastels", colors: ["#FDE68A", "#FCA5A5", "#C4B5FD"] },
    { name: "synthwave", desc: "Retro neon", colors: ["#E779C1", "#58C7F3", "#F9ED69"] },
    { name: "retro", desc: "Vintage charm", colors: ["#EF9995", "#F3D2C1", "#8AB4A6"] },
    { name: "cyberpunk", desc: "Futuristic", colors: ["#FFEE00", "#FF00FF", "#00F0FF"] },
    { name: "valentine", desc: "Romantic", colors: ["#E96D7B", "#F7C8C8", "#AF4670"] },
    { name: "garden", desc: "Natural", colors: ["#5C7F67", "#A8DADC", "#457B9D"] },
    { name: "forest", desc: "Deep woods", colors: ["#1EB854", "#2D6A4F", "#40916C"] },
    { name: "luxury", desc: "Premium", colors: ["#1C1917", "#D4AF37", "#F5F5DC"] },
    { name: "dracula", desc: "Vampire mode", colors: ["#282A36", "#FF79C6", "#BD93F9"] },
    { name: "business", desc: "Corporate blue", colors: ["#1E40AF", "#1E3A8A", "#1E293B"] },
    { name: "night", desc: "Midnight", colors: ["#0F172A", "#1E293B", "#334155"] },
    { name: "coffee", desc: "Warm & cozy", colors: ["#6F4E37", "#A0826D", "#C9B8A8"] },
    { name: "winter", desc: "Cool calm", colors: ["#DBEAFE", "#BFDBFE", "#93C5FD"] }
  ];

 

  const filteredThemes = themes.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
   
    { name: "Theme", href: "/Dashboard/Setting/Theme" },
  ];

  return (

    <>
    <DashboardPageHeader breadData={breadData} 

    heading="Theme Settings"
    
    />

    
    <main className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
      <div className="w-full max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary-color)]/10 mb-5">
            <Palette className="w-7 h-7 text-[var(--primary-color)]" />
          </div>
          <h1 className="text-2xl font-semibold text-base-content mb-2">
            Theme Settings
          </h1>
          <p className="text-base-content/60 text-sm max-w-lg mx-auto">
            Select a visual style that matches your preference. Your choice is automatically saved.
          </p>
        </header>

        {/* Search */}
        {/* <div className="mb-7 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-base-300 bg-base-100 
                          focus:input-neutral transition-colors text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div> */}

        {/* Theme Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-7">
          {filteredThemes.map((t) => (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={`group relative p-4 rounded-lg border transition-all duration-200
                ${theme === t.name 
                  ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5 shadow-sm" 
                  : "border-base-300 hover:border-base-400 bg-base-100"}
                focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40`}
            >
              {/* Color Palette */}
              <div className="flex gap-1 mb-3">
                {t.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 rounded-md border border-base-300/50 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Theme Info */}
              <div className="text-left">
                <h3 className="font-medium text-sm text-base-content capitalize mb-0.5">
                  {t.name}
                </h3>
                <p className="text-xs text-base-content/50">
                  {t.desc}
                </p>
              </div>

              {/* Active Indicator */}
              {theme === t.name && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[var(--primary-color)] 
                                flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

       

        {/* Current Theme Display */}
        <div className="max-w-sm mx-auto pt-7 border-t border-base-300">
          <div className="text-center">
            <p className="text-xs text-base-content/50 mb-2">Active Theme</p>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[var(--primary-color)]/10">
              <div className="flex gap-1">
                {themes.find(t => t.name === theme)?.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-[var(--primary-color)]/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-base font-semibold capitalize text-[var(--primary-color)]">
                {theme}
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
    </>
  );
}