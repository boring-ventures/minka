"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Grid2X2,
  Palette,
  GraduationCap,
  AlertTriangle,
  Heart,
  Leaf,
  Stethoscope,
} from "lucide-react";

const categories = [
  { id: "todas", label: "Todas", icon: Grid2X2 },
  { id: "cultura", label: "Cultura y arte", icon: Palette },
  { id: "educacion", label: "Educación", icon: GraduationCap },
  { id: "emergencia", label: "Emergencia", icon: AlertTriangle },
  { id: "igualdad", label: "Igualdad", icon: Heart },
  { id: "medioambiente", label: "Medioambiente", icon: Leaf },
  { id: "salud", label: "Salud", icon: Stethoscope },
];

export function CategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState("todas");

  return (
    <div className="flex flex-nowrap overflow-x-auto pb-4 gap-4 max-w-full mx-auto hide-scrollbar">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <button
            type="button"
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex flex-col items-center justify-center px-6 py-4 rounded-xl border transition-all flex-shrink-0",
              "hover:border-[#2c6e49] hover:shadow-sm",
              "w-[140px]",
              selectedCategory === category.id
                ? "border-[#2c6e49] bg-[#f8f9fa]"
                : "border-gray-200 bg-white"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 mb-2",
                selectedCategory === category.id
                  ? "text-[#2c6e49]"
                  : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "text-base font-medium text-center",
                selectedCategory === category.id
                  ? "text-[#2c6e49]"
                  : "text-gray-600"
              )}
            >
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

