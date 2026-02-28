'use client';
import React, { useEffect, useState } from "react";
import DashboardHeader from "@/Components/DashboardHeader";
import DashboardSidebar from "@/Components/DasboardSidebar";
import { 
  Inter, 
  Poppins, 
  Roboto, 
  Montserrat, 
  Open_Sans, 
  Lato, 
  Nunito, 
  Raleway, 
  Source_Sans_3,
  Playfair_Display 
} from "next/font/google";
import { useThemeStore } from "./Setting/Theme/page";
import { useFontStore } from "@/stores/fontStore";
import axios from "axios";
import {useUserStore} from '@/stores/userStore';


// Configure Inter font
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-opensans",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-nunito",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-raleway",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sourcesans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-playfair",
});

// Font mapping
const fontMap = {
  inter: inter.className,
  poppins: poppins.className,
  roboto: roboto.className,
  montserrat: montserrat.className,
  opensans: openSans.className,
  lato: lato.className,
  nunito: nunito.className,
  raleway: raleway.className,
  sourcesans: sourceSans.className,
  playfair: playfair.className,
};

export default function AdminLayout({ children }) {
  const { theme, setTheme } = useThemeStore();
  const { font, setFont } = useFontStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { setUser } = useUserStore();

  // Initialize theme, font, and user data on mount
  useEffect(() => {
    // 1. Define fetchData INSIDE useEffect to avoid dependency warnings
    const fetchData = async () => { 
      try {
        const response = await axios.get('/api/user/profile');
        const data = response.data;
        setUser(data.user);
        console.log('User set in store:', data.user);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } 
    };

    try {
      const savedTheme = localStorage.getItem("app-theme") || "light";
      const savedFont = localStorage.getItem("app-font") || "inter";
      
      setTheme(savedTheme);
      setFont(savedFont);
      
      // 2. Call it immediately
      fetchData();
    } catch (e) {
      console.warn("Error loading preferences:", e);
    }
    
    // 3. Add setUser to dependencies (safe because store functions are stable)
  }, [setTheme, setFont, setUser]);

  // Get the current font className
  const currentFontClass = fontMap[font] || inter.className;

  // Combine all font variables for CSS
  const allFontVariables = `${inter.variable} ${poppins.variable} ${roboto.variable} ${montserrat.variable} ${openSans.variable} ${lato.variable} ${nunito.variable} ${raleway.variable} ${sourceSans.variable} ${playfair.variable}`;

  return (
    <div
      data-theme={theme}
      className={`${currentFontClass} ${allFontVariables} flex h-screen w-full overflow-hidden`}
    >
      {/* Sidebar */}
      <div
        className={`fixed lg:relative w-64 h-screen z-50 shadow-lg transition-all duration-700 ease-in-out flex-shrink-0
        ${sidebarOpen ? "-ml-64 lg:ml-0" : "ml-0 lg:-ml-64"}`}
      >
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Main column */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col transition-all duration-700 ease-in-out">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
          <DashboardHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </header>

        {/* Content */}
        <main className="flex-1 min-w-0 min-h-0 overflow-auto lg:px-6 px-4 py-4 bg-base-200">
          <div className="max-w-7xl m-auto">
              {children}
          </div>
        
        </main>

        {/* Footer */}
        <footer className="h-10 flex items-center justify-center bg-base-100 text-xs text-gray-500 shrink-0">
          {'Made with love by'}
          <span className="text-[#0885f3] ml-1 font-bold">Faiq Wajahat</span>
        </footer>
      </div>
    </div>
  );
}