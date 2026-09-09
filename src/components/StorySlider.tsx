"use client";

import { useState, useEffect } from "react";

const images = ["/story.png", "/story-2.png"];

const StorySlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="brand-story-image"
      style={{ position: "relative", background: "#1a0a0a" }}
    >
      {images.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`Caba Product story ${idx + 1}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: idx === current ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
        />
      ))}
    </div>
  );
};

export default StorySlider;
