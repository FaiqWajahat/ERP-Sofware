"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import en from "@/locales/en.json";
import ur from "@/locales/ur.json";

const translations = {
  English: en,
  Urdu: ur,
};

export const useLanguage = create(
  persist(
    (set) => ({
      // Default language
      lang: "English",

      // Default translation object
      t: translations["English"],

      // Simple array for dropdown
      languages: ["English", "Urdu"],

      // Change language
      setLang: (selected) => {
        set({
          lang: selected,
          t: translations[selected], // directly load json
        });
      },
    }),
    {
      name: "language-storage",
      getStorage: () =>
        typeof window !== "undefined" ? window.localStorage : undefined,
    }
  )
);
