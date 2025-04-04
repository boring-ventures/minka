"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(3);

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
    {
      id: 4,
      quote:
        "Minka ha transformado la manera en que apoyamos causas sociales en Bolivia. Su plataforma facilita la conexión entre proyectos importantes y personas que quieren ayudar.",
      author: "Roberto Flores",
      role: "Empresario Social",
    },
    {
      id: 5,
      quote:
        "La experiencia de usuario en Minka es excepcional. Pude crear mi campaña rápidamente y el soporte del equipo fue fundamental para alcanzar nuestras metas de recaudación.",
      author: "Ana Gutiérrez",
      role: "Directora de ONG",
    },
    {
      id: 6,
      quote:
        "Lo que más valoro de Minka es la comunidad que se forma alrededor de cada causa. No solo recaudamos fondos, sino que encontramos aliados comprometidos con nuestro proyecto.",
      author: "Daniel Rojas",
      role: "Educador Ambiental",
    },
  ];

  // Check if we're on mobile and set visible items
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;

      if (width >= 1280) {
        setVisibleItems(3);
      } else if (width >= 768) {
        setVisibleItems(2);
      } else {
        setVisibleItems(1);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      // If we're at the last possible position (considering visible items), go back to 0
      return nextIndex > testimonials.length - visibleItems ? 0 : nextIndex;
    });
  }, [visibleItems, testimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      // If we're at the first position, go to the last possible position
      return nextIndex < 0 ? testimonials.length - visibleItems : nextIndex;
    });
  }, [visibleItems, testimonials.length]);

  const goToSlide = useCallback(
    (index: number) => {
      // Ensure we don't go beyond the last possible position
      if (index > testimonials.length - visibleItems) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(index);
      }
    },
    [visibleItems, testimonials.length]
  );

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-6xl md:text-7xl font-bold text-[#333333] mb-16 animate-slide-up text-center">
          Nuestra comunidad
        </h2>

        {/* Carousel for both mobile and desktop */}
        <div className="relative max-w-6xl mx-auto px-8 md:px-12">
          <div ref={carouselRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="px-4 md:px-6 py-4"
                  style={{ flex: `0 0 ${100 / visibleItems}%` }}
                >
                  <div className="testimonial-card bg-white rounded-xl shadow-lg p-6 md:p-8 text-center h-full transition-shadow duration-300 hover:shadow-xl">
                    <div className="mb-6 md:mb-8">
                      <svg
                        className="w-8 h-8 md:w-10 md:h-10 text-[#2c6e49] mx-auto mb-3 md:mb-4 opacity-20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Quote Icon"
                        role="img"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-base md:text-lg text-gray-600 mb-5 md:mb-6 leading-relaxed">
                        {testimonial.quote}
                      </p>
                    </div>
                    <div className="animate-fade-in">
                      <p className="font-medium text-lg md:text-xl text-[#2c6e49] mb-1">
                        {testimonial.author}
                      </p>
                      <p className="text-base md:text-lg text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-0 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 transition-colors"
            aria-label="Previous testimonial"
            type="button"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-[#2c6e49]" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-0 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 transition-colors"
            aria-label="Next testimonial"
            type="button"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-[#2c6e49]" />
          </button>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials
              .slice(0, testimonials.length - visibleItems + 1)
              .map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-6 bg-[#2c6e49]"
                      : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  type="button"
                />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
