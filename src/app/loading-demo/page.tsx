import { LoadingDemo } from "@/components/ui/loading-demo";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LoadingDemoPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold text-center text-[#356945]">
        Demostración del componente de carga
      </h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="mb-6 text-gray-700">
          Esta página muestra el componente de carga con el logo de Minka y una
          animación de spinner verde minimalista. El spinner ahora ocupa un 50%
          de la circunferencia con un color verde intenso que se desvanece,
          tiene una terminación redondeada, y no presenta círculo de fondo para
          un aspecto más minimalista durante la animación.
        </p>

        <div className="grid grid-cols-1 mb-8">
          <div className="bg-[#f5f7e9] p-12 rounded-lg flex flex-col justify-center items-center">
            <LoadingSpinner size="xl" />
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <LoadingDemo />
        </div>
      </div>
    </div>
  );
}
