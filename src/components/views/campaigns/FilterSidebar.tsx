"use client";

export function FilterSidebar() {
  return (
    <div className="w-72 flex-shrink-0">
      <div className="space-y-8">
        {/* Campañas verificadas */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox text-[#2c6e49] rounded border-gray-300"
            />
            <span className="text-sm font-medium">
              Solo campañas verificadas
            </span>
          </label>
        </div>

        {/* Estado de verificación */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Estado de verificación</h3>
          <div className="space-y-3 border-b pb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">En proceso de verificación</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">Sin verificar</span>
            </label>
          </div>
        </div>

        {/* Fecha de creación */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Fecha de creación</h3>
          <div className="space-y-3 border-b pb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">Últimas 24 horas</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">Últimos 7 días</span>
            </label>
          </div>
        </div>

        {/* Monto recaudado */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Monto recaudado</h3>
          <div className="space-y-3 border-b pb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">Menos del 25% de la meta</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">Entre el 25% y 75% de la meta</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">Más del 75% de la meta</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-sm">Meta alcanzada</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
