import { Toaster } from "react-hot-toast";
import "../app/globals.css";

export default function RootLayout({ children }) {
  return (
    <html  data-theme="light"
     lang="en">
      <body  >
        <main>{children}</main>
        <Toaster/>
      </body>
    </html>
  );
}

