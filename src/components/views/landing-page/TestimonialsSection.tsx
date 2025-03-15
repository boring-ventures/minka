"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      id: 1,
      quote:
        "Crear mi campaña en Minka fue tan sencillo como contar mi historia. Además, la posibilidad de compartirla fácilmente me permitió llegar a más personas solidarias.",
      author: "Sofía Balcázar",
      role: "Activista Ambiental",
    },
    {
      id: 2,
      quote:
        "Gracias a Minka pudimos recaudar los fondos necesarios para nuestro proyecto comunitario. La plataforma es intuitiva y segura.",
      author: "Carlos Mendoza",
      role: "Líder Comunitario",
    },
    {
      id: 3,
      quote:
        "Como donante, me encanta la transparencia que ofrece Minka. Puedo ver exactamente cómo mi aporte está ayudando.",
      author: "María Vargas",
      role: "Donante Frecuente",
    },
  ];

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance carousel every 5 seconds on mobile
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, currentIndex]);

  return (
    <section className="bg-[#f5f7e9] py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-6xl md:text-7xl font-bold text-[#333333] mb-16 animate-slide-up text-center">
          Nuestra comunidad
        </h2>

        {/* Desktop view - grid */}
        {!isMobile && (
          <div className="hidden md:grid grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="testimonial-card bg-white rounded-xl shadow-lg p-8 text-center animate-float"
              >
                <div className="mb-8">
                  <svg
                    className="w-10 h-10 text-[#2c6e49] mx-auto mb-4 opacity-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Quote Icon"
                    role="img"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {testimonial.quote}
                  </p>
                </div>
                <div className="animate-fade-in">
                  <p className="font-medium text-xl text-[#2c6e49] mb-1">
                    {testimonial.author}
                  </p>
                  <p className="text-lg text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile view - carousel */}
        {isMobile && (
          <div className="md:hidden relative max-w-md mx-auto">
            <div ref={carouselRef} className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="testimonial-card bg-white rounded-xl shadow-lg p-6 text-center min-w-full"
                  >
                    <div className="mb-6">
                      <svg
                        className="w-8 h-8 text-[#2c6e49] mx-auto mb-3 opacity-20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Quote Icon"
                        role="img"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-base text-gray-600 mb-5 leading-relaxed">
                        {testimonial.quote}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-lg text-[#2c6e49] mb-1">
                        {testimonial.author}
                      </p>
                      <p className="text-base text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-md z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-[#2c6e49]" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-2 shadow-md z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-[#2c6e49]" />
            </button>

            {/* Navigation dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index
                      ? "w-6 bg-[#2c6e49]"
                      : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
