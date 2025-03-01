export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote:
        "Crear mi campaña en Minka fue tan sencillo como contar mi historia. La posibilidad de compartirla fácilmente me permitió llegar a más personas solidarias.",
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

  return (
    <section className="bg-[#f5f7e9] py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl md:text-6xl font-bold text-[#333333] mb-16 animate-slide-up text-center">
          Nuestra comunidad
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
      </div>
    </section>
  );
}

