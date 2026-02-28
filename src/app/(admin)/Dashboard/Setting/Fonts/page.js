'use client';
import React, { useState } from "react";
import { Check,  Text } from "lucide-react";
import { useFontStore } from "@/stores/fontStore";
import DashboardPageHeader from "@/Components/DashboardPageHeader";

// Font options with their Google Fonts names
const fontOptions = [
  { id: 'inter', name: 'Inter', preview: 'Clean & Modern' },
  { id: 'poppins', name: 'Poppins', preview: 'Geometric & Friendly' },
  { id: 'roboto', name: 'Roboto', preview: 'Classic & Readable' },
  { id: 'montserrat', name: 'Montserrat', preview: 'Urban & Bold' },
  { id: 'opensans', name: 'Open Sans', preview: 'Neutral & Legible' },
  { id: 'lato', name: 'Lato', preview: 'Warm & Professional' },
  { id: 'nunito', name: 'Nunito', preview: 'Rounded & Soft' },
  { id: 'raleway', name: 'Raleway', preview: 'Elegant & Stylish' },
  { id: 'sourcesans', name: 'Source Sans Pro', preview: 'Technical & Clear' },
  { id: 'playfair', name: 'Playfair Display', preview: 'Serif & Elegant' },
];

export default function FontSettings() {
  const { font: selectedFont, setFont } = useFontStore();
  const [isLoading, setIsLoading] = useState(false);

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
  
    { name: "Font", href: "/Dashboard/Setting/Fonts" },
  ];

  // Handle font selection
  const handleFontChange = async (fontId) => {
    setIsLoading(true);
    
    try {
      // Simulate API call to save preference
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Save to localStorage
      localStorage.setItem("app-font", fontId);
      
      // Update Zustand store (this will trigger layout re-render)
      setFont(fontId);
      
    } catch (error) {
      console.error("Error saving font:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <DashboardPageHeader breadData={breadData} 
    heading="Font Settings"
    />

      {/* Main Content Card */}
      <div className="w-full bg-base-100  rounded-xl shadow-lg p-4 lg:p-6">
        <div className="w-full max-w-5xl mx-auto">
        
         <header className="mb-10 text-center">
                 <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary-color)]/10 mb-5">
                   <Text className="w-7 h-7 text-[var(--primary-color)]" />
                 </div>
                 <h1 className="text-2xl font-semibold text-base-content mb-2">
                   Font Settings
                 </h1>
                 <p className="text-base-content/60 text-sm max-w-lg mx-auto">
                  {`Select a font style that matches your preference. Your choice is automatically saved.`}
                 </p>
               </header>
       

        {/* Font Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {fontOptions.map((font) => (
            <button
              key={font.id}
              onClick={() => handleFontChange(font.id)}
              disabled={isLoading}
              className={`
                relative p-4 rounded-md border-2 transition-all duration-200
                
                ${selectedFont === font.id 
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' 
                  : 'border-base-300 bg-base-100 hover:border-base-content/20'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Selected Indicator */}
              {selectedFont === font.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--primary-color)] flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}

              {/* Font Name */}
              <div className="text-left mb-3">
                <h3 className="text-base font-bold text-base-content">{font.name}</h3>
              </div>

              {/* Font Preview */}
              <div className="text-left space-y-2">
                <p className="text-md font-bold text-base-content">Aa Bb Cc</p>
                <p className="text-sm text-base-content/70">{font.preview}</p>
               
              </div>
            </button>
          ))}
        </div>

        <div className="max-w-sm mx-auto pt-7 border-t border-base-300 ">
          <div className=" text-center">
           
           <p className="text-xs text-base-content/50 mb-2">Active Theme</p>
          </div>
          <p className="text-base font-semibold capitalize text-[var(--primary-color)] text-center">
            {fontOptions.find(f => f.id === selectedFont)?.name || 'Inter'}
          </p>
          <p className="text-xs text-base-content/60 mt-1 text-center">
            This font is applied across all pages and components
          </p>
        </div>
        </div>
      </div>
    </>
  );
}