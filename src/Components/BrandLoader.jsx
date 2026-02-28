"use client";
import { useState, useEffect } from "react";

export default function Brandloader({ duration = 3000 }) {
  const [visible, setVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // main timer for loader
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);

      // small delay for smooth exit animation
      const exitTimer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = "unset";
      }, 700);

      return () => clearTimeout(exitTimer);
    }, duration);

    // cleanup
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200 transition-all duration-700 ${
        isAnimatingOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Brand Name with Bounce */}
      <h1
        className="text-6xl md:text-9xl font-black text-[#1C8BEE] tracking-tight"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        {"Dashbaord".split("").map((letter, index) => (
          <span
            key={index}
            className="inline-block bounce"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>

      {/* Animations */}
      <style jsx>{`
        .bounce {
          display: inline-block;
          animation: bounce 1.5s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-12px);
          }
          60% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
