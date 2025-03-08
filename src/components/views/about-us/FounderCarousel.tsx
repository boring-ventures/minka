"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Founder {
  id: string;
  image: string;
  name: string;
  role: string;
}

const founders: Founder[] = [
  {
    id: "founder-1",
    image: "/about-us/Perfil.png",
    name: "Marco Polo Sanchez",
    role: "Co-fundador",
  },
  {
    id: "founder-2",
    image: "/about-us/Perfil.png",
    name: "Rosalia Riviera Gonzales",
    role: "Co-fundador",
  },
  {
    id: "founder-3",
    image: "/about-us/Perfil.png",
    name: "Asad Abdula Mohamed",
    role: "Co-fundador",
  },
  {
    id: "founder-4",
    image: "/about-us/Perfil.png",
    name: "Rosa Martinez",
    role: "Co-fundador",
  },
];

export function FoundersCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideWidth, setSlideWidth] = useState(33.333);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [indicators, setIndicators] = useState<string[]>([]);

  // Handle window resize to adjust slide width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlideWidth(100);
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlideWidth(50);
        setSlidesPerView(2);
      } else {
        setSlideWidth(33.333);
        setSlidesPerView(3);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Generate indicator IDs
  useEffect(() => {
    const count = Math.max(1, founders.length - slidesPerView + 1);
    const newIndicators = Array.from(
      { length: count },
      (_, i) => `indicator-${i}-${Date.now()}`
    );
    setIndicators(newIndicators);
  }, [slidesPerView]);

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide(
        (prev) => (prev + 1) % (founders.length - slidesPerView + 1)
      );
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) =>
        prev === 0 ? Math.max(0, founders.length - slidesPerView) : prev - 1
      );
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <div className="relative px-4 md:px-16">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-16 text-center md:text-left">
        Los fundadores
      </h2>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * slideWidth}%)` }}
        >
          {founders.map((founder) => (
            <div
              key={founder.id}
              className={`flex-none px-4 ${
                slideWidth === 100
                  ? "w-full"
                  : slideWidth === 50
                    ? "w-1/2"
                    : "w-1/3"
              }`}
            >
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[3/5]">
                <Image
                  src={founder.image || "/placeholder.svg"}
                  alt={founder.name}
                  width={400}
                  height={667}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-sm md:text-base text-gray-600 mb-2">
                  {founder.role}
                </p>
                <h3 className="font-medium text-xl md:text-2xl">
                  {founder.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-[#2c6e49] hover:text-[#1e4d33] transition-colors"
        disabled={isAnimating || currentSlide === 0}
        aria-label="Previous slide"
        type="button"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-[#2c6e49] hover:text-[#1e4d33] transition-colors"
        disabled={
          isAnimating || currentSlide >= founders.length - slidesPerView
        }
        aria-label="Next slide"
        type="button"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className="flex justify-center mt-8 gap-2">
        {indicators.map((id, index) => (
          <button
            key={id}
            onClick={() => !isAnimating && setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-[#2c6e49]" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
