
export const metadata = {
  // 1. Template Title: Child pages will appear as "Dashboard | Seven Directions"
  title: {
    template: '%s | Seven Directions',
    default: 'Seven-Directions ERP', // Fallback for the home page
  },
  
  // 2. Contextual Description for your Construction Project
  description: "Advanced Enterprise Resource Planning (ERP) system for construction management, employee tracking, and project logistics.",
  
  // 3. Icons: Mapped exactly to the files in your 'public' folder
  icons: {
    icon: [
      { url: '/favicon.ico' }, // Standard fallback
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }, // High res tab icon
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }, // Low res tab icon
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }, // For iPhones/iPads
    ],
    shortcut: ['/favicon.ico'],
  },

 
};

export default function UserLayout({ children }) {
  return (
   <>
       
        <main>{children}</main>
       
        </>
     
  );
}
