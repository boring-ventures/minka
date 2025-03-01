export function TestimonialsSection() {
  return (
    <section className="bg-[#f5f7e9] py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#333333] text-center mb-16 animate-slide-up">
          Nuestra comunidad
        </h2>

        <div className="relative max-w-4xl mx-auto">
          <div className="testimonial-card bg-white rounded-xl shadow-lg p-12 text-center animate-float">
            <div className="mb-8">
              <svg className="w-12 h-12 text-[#2c6e49] mx-auto mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                "Crear mi campaña en Minka fue tan sencillo como contar mi historia. Además, la posibilidad de
                compartirla fácilmente me permitió llegar a más personas solidarias."
              </p>
            </div>
            <div className="animate-fade-in">
              <p className="font-medium text-xl text-[#2c6e49] mb-1">Sofía Balcázar</p>
              <p className="text-lg text-gray-500">Activista Ambiental</p>
            </div>
          </div>

          <div className="flex justify-center mt-10 gap-3">
            <button className="nav-dot h-3 w-3 rounded-full bg-gray-300 hover:bg-[#2c6e49] transition-colors"></button>
            <button className="nav-dot h-3 w-3 rounded-full bg-[#2c6e49] active"></button>
            <button className="nav-dot h-3 w-3 rounded-full bg-gray-300 hover:bg-[#2c6e49] transition-colors"></button>
          </div>

          <button
            className="absolute top-1/2 -left-12 transform -translate-y-1/2 hover-lift p-2 text-[#2c6e49] hover:text-[#1e4d33]"
            aria-label="Previous testimonial"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute top-1/2 -right-12 transform -translate-y-1/2 hover-lift p-2 text-[#2c6e49] hover:text-[#1e4d33]"
            aria-label="Next testimonial"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

