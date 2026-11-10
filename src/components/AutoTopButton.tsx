/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const AutoTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    let lastProgress = 0;
    let lastVisible = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const visible = scrollTop > 250;
          if (visible !== lastVisible) {
            lastVisible = visible;
            setIsVisible(visible);
          }

          if (visible) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
              const progress = Math.min(100, Math.round((scrollTop / docHeight) * 100));
              // Throttle state update: only update if changed by at least 2% to avoid render spam
              if (Math.abs(progress - lastProgress) >= 2 || progress === 100 || progress === 0) {
                lastProgress = progress;
                setScrollProgress(progress);
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[290px] md:bottom-[280px] right-4 sm:right-6 z-30 animate-in fade-in zoom-in-75 duration-200">
      <button
        onClick={scrollToTop}
        className="relative p-3 bg-white hover:bg-rose-50 text-rose-900 rounded-full shadow-lg border border-rose-300 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group"
        title={`Cuộn lên đầu trang (${scrollProgress}%)`}
        aria-label="Cuộn lên đầu trang"
      >
        {/* Circular progress ring */}
        <svg className="w-10 h-10 -rotate-90 absolute pointer-events-none" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#fce7f3"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#e11d48"
            strokeWidth="2.5"
            strokeDasharray="100"
            strokeDashoffset={100 - scrollProgress}
            strokeLinecap="round"
            className="transition-all duration-150"
          />
        </svg>

        <ArrowUp className="w-5 h-5 text-rose-800 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};
