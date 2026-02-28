
import { create } from 'zustand';

export const useFontStore = create((set) => ({
  font: 'inter',
  setFont: (font) => set({ font }),
}));