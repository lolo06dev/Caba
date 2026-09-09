"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    image: "/hero.png",
    quote: '"Do it for the people who want to see you fail"',
  },
  {
    image: "/hero-1.png",
    quote: '"Style is a way to say who you are without having to speak"',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <div className="hero-slider">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`hero-slide ${idx === current ? "active" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image} alt={`Slide ${idx + 1}`} />
        </div>
      ))}

      <button className="hero-nav-btn prev" onClick={prev} aria-label="Previous slide">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="hero-nav-btn next" onClick={next} aria-label="Next slide">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="hero-quote">
        {slides[current].quote}
      </div>
    </div>
  );
};

export default HeroSlider;
